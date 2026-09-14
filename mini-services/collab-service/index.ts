/*
 * Collab-service: совместная работа над уроком в реальном времени.
 *
 * Возможности:
 *  - комнаты (room code из URL ?room=...; по умолчанию "urok-1")
 *  - presence: список участников с именами и цветами
 *  - чат (с системными сообщениями, история в памяти, до 100 сообщений)
 *  - синхронизация кода редакторов (collab:code, LWW, без эха отправителю)
 *  - общая доска заметок (collab:notes, сохраняется на диск)
 *  - «ведение урока»: вещание текущего раздела (collab:section)
 *  - уведомления о решённых задачах (collab:solved → системное сообщение)
 *
 * Персистентность: data/collab.json рядом с сервисом (заметки + коды редакторов).
 */
import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const PORT = Number(process.env.PORT) || 3003;
const DATA_DIR = join(import.meta.dir, "..", "..", "data");
const DATA_FILE = join(DATA_DIR, "collab.json");
const MAX_CHAT = 100;

interface CollabUser {
  id: string;
  name: string;
  color: string;
}

interface ChatMsg {
  id: string;
  system?: boolean;
  name?: string;
  color?: string;
  text: string;
  ts: number;
}

interface RoomState {
  notes: string;
  codes: Record<string, string>;
  messages: ChatMsg[];
}

const rooms = new Map<string, RoomState>();
const COLORS = [
  "#f59e0b", "#10b981", "#8b5cf6", "#ef4444",
  "#0ea5e9", "#ec4899", "#14b8a6", "#f97316",
];

/* ---------- Персистентность ---------- */

function loadState(): void {
  try {
    const raw = readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { rooms?: Record<string, RoomState> };
    for (const [room, st] of Object.entries(parsed.rooms ?? {})) {
      rooms.set(room, {
        notes: typeof st.notes === "string" ? st.notes : "",
        codes: st.codes && typeof st.codes === "object" ? st.codes : {},
        messages: Array.isArray(st.messages) ? st.messages.slice(-MAX_CHAT) : [],
      });
    }
    console.log(`[collab] loaded ${rooms.size} room(s) from disk`);
  } catch {
    console.log("[collab] no saved state, starting fresh");
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist(): void {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      mkdirSync(dirname(DATA_FILE), { recursive: true });
      const obj: Record<string, RoomState> = {};
      for (const [room, st] of rooms) {
        obj[room] = { notes: st.notes, codes: st.codes, messages: st.messages };
      }
      writeFileSync(DATA_FILE, JSON.stringify({ rooms: obj }, null, 2));
    } catch (e) {
      console.error("[collab] persist error:", e);
    }
  }, 800);
}

function roomState(room: string): RoomState {
  let st = rooms.get(room);
  if (!st) {
    st = { notes: "", codes: {}, messages: [] };
    rooms.set(room, st);
  }
  return st;
}

/* ---------- Утилиты ---------- */

function sanitize(v: unknown, max = 60): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

function nextColor(room: string): string {
  const n = usersIn(room).length;
  return COLORS[n % COLORS.length];
}

function usersIn(room: string): CollabUser[] {
  const list: CollabUser[] = [];
  for (const [, s] of io.of("/").sockets) {
    if (s.data.room === room && s.data.name) {
      list.push({ id: s.id, name: s.data.name, color: s.data.color });
    }
  }
  return list;
}

function systemMsg(text: string): ChatMsg {
  return {
    id: Math.random().toString(36).slice(2, 11),
    system: true,
    text,
    ts: Date.now(),
  };
}

function pushSystem(room: string, text: string): void {
  const st = roomState(room);
  const msg = systemMsg(text);
  st.messages.push(msg);
  if (st.messages.length > MAX_CHAT) st.messages.splice(0, st.messages.length - MAX_CHAT);
  io.to(room).emit("collab:chat", msg);
  persist();
}

/* ---------- Socket.io ---------- */

const httpServer = createServer();
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 2e6,
});

io.on("connection", (socket: Socket) => {
  console.log(`[collab] connected: ${socket.id}`);

  socket.on(
    "collab:join",
    (
      data: { room?: string; name?: string },
      ack?: (res: {
        ok: boolean;
        you?: CollabUser;
        users?: CollabUser[];
        notes?: string;
        codes?: Record<string, string>;
        messages?: ChatMsg[];
        error?: string;
      }) => void,
    ) => {
    try {
      const room = sanitize(data?.room, 40) || "urok-1";
      const name = sanitize(data?.name, 24) || "Гость";
      socket.data.room = room;
      socket.data.name = name;
      socket.data.color = nextColor(room);
      socket.join(room);

      const st = roomState(room);
      const me: CollabUser = {
        id: socket.id,
        name,
        color: socket.data.color,
      };
      ack?.({
        ok: true,
        you: me,
        users: usersIn(room),
        notes: st.notes,
        codes: st.codes,
        messages: st.messages.slice(-50),
      });

      socket.to(room).emit("collab:presence", { users: usersIn(room) });
      socket.to(room).emit("collab:chat", (() => {
        const m = systemMsg(`${name} присоединился к комнате`);
        const s = roomState(room);
        s.messages.push(m);
        if (s.messages.length > MAX_CHAT) s.messages.splice(0, s.messages.length - MAX_CHAT);
        persist();
        return m;
      })());
      console.log(`[collab] ${name} joined room "${room}" (${usersIn(room).length} online)`);
    } catch (e) {
      console.error("[collab] join error:", e);
      ack?.({ ok: false, error: "join failed" });
    }
  });

  socket.on("collab:chat", (data: { text?: string }) => {
    const room = socket.data.room;
    if (!room || !socket.data.name) return;
    const text = sanitize(data?.text, 500);
    if (!text) return;
    const st = roomState(room);
    const msg: ChatMsg = {
      id: Math.random().toString(36).slice(2, 11),
      name: socket.data.name,
      color: socket.data.color,
      text,
      ts: Date.now(),
    };
    st.messages.push(msg);
    if (st.messages.length > MAX_CHAT) st.messages.splice(0, st.messages.length - MAX_CHAT);
    io.to(room).emit("collab:chat", msg);
    persist();
  });

  socket.on("collab:code", (data: { editorId?: string; code?: string }) => {
    const room = socket.data.room;
    if (!room || !socket.data.name) return;
    const editorId = sanitize(data?.editorId, 80);
    if (!editorId || typeof data?.code !== "string") return;
    if (data.code.length > 100_000) return;
    const st = roomState(room);
    if (st.codes[editorId] === data.code) return; // без изменений
    st.codes[editorId] = data.code;
    persist();
    socket.to(room).emit("collab:code", {
      editorId,
      code: data.code,
      from: socket.data.name,
      color: socket.data.color,
    });
  });

  socket.on("collab:notes", (data: { text?: string }) => {
    const room = socket.data.room;
    if (!room || !socket.data.name) return;
    if (typeof data?.text !== "string" || data.text.length > 20_000) return;
    const st = roomState(room);
    if (st.notes === data.text) return;
    st.notes = data.text;
    persist();
    socket.to(room).emit("collab:notes", { text: data.text, from: socket.data.name });
  });

  socket.on("collab:section", (data: { sectionId?: string }) => {
    const room = socket.data.room;
    if (!room || !socket.data.name) return;
    const sectionId = sanitize(data?.sectionId, 40);
    if (!sectionId) return;
    socket.to(room).emit("collab:section", {
      sectionId,
      from: socket.data.name,
      color: socket.data.color,
    });
  });

  socket.on("collab:solved", (data: { taskId?: string; title?: string }) => {
    const room = socket.data.room;
    if (!room || !socket.data.name) return;
    const title = sanitize(data?.title, 80);
    if (!title) return;
    pushSystem(room, `${socket.data.name} справился с задачей «${title}» 🎉`);
  });

  socket.on("disconnect", () => {
    const room = socket.data.room;
    const name = socket.data.name;
    if (room && name) {
      socket.to(room).emit("collab:presence", { users: usersIn(room) });
      socket.to(room).emit("collab:chat", (() => {
        const m = systemMsg(`${name} покинул комнату`);
        const s = roomState(room);
        s.messages.push(m);
        if (s.messages.length > MAX_CHAT) s.messages.splice(0, s.messages.length - MAX_CHAT);
        persist();
        return m;
      })());
      console.log(`[collab] ${name} left room "${room}"`);
    }
    console.log(`[collab] disconnected: ${socket.id}`);
  });

  socket.on("error", (e) => console.error("[collab] socket error:", e));
});

/* ---------- Старт ---------- */

loadState();
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`[collab] websocket server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  httpServer.close(() => process.exit(0));
});
