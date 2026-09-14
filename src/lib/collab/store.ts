"use client";

import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { toast } from "@/hooks/use-toast";
import { NAV } from "@/lib/lesson/nav";

/* ---------- Типы ---------- */

export interface CollabUser {
  id: string;
  name: string;
  color: string;
}

export interface ChatMsg {
  id: string;
  system?: boolean;
  name?: string;
  color?: string;
  text: string;
  ts: number;
}

export interface EditorHandle {
  /** Текущий код редактора */
  get: () => string;
  /** Применить внешний код (без повторной рассылки) */
  apply: (code: string) => void;
  /** true, если пользователь ещё не менял код от исходного */
  isPristine: () => boolean;
}

interface CollabState {
  connected: boolean;
  joined: boolean;
  room: string;
  me: CollabUser | null;
  users: CollabUser[];
  messages: ChatMsg[];
  unread: number;
  notes: string;
  sharing: boolean;
  leading: boolean;
  following: boolean;
  panelOpen: boolean;
  /** editorId → имя того, кто последним обновил код (для всплывающего индикатора) */
  flash: Record<string, string>;

  setPanelOpen: (v: boolean) => void;
  join: (name: string) => void;
  sendChat: (text: string) => void;
  setNotes: (text: string, fromRemote?: boolean) => void;
  setSharing: (v: boolean) => void;
  setLeading: (v: boolean) => void;
  setFollowing: (v: boolean) => void;
  reportSection: (sectionId: string) => void;
  notifySolved: (taskId: string, title: string) => void;
  broadcastCode: (editorId: string, code: string) => void;
  registerEditor: (id: string, handle: EditorHandle) => void;
  unregisterEditor: (id: string) => void;
  clearFlash: (editorId: string) => void;
}

/* ---------- Модульное состояние (вне zustand, чтобы не дёргать рендеры) ---------- */

let socket: Socket | null = null;
let reconnectName = "";
let notesTimer: ReturnType<typeof setTimeout> | null = null;
let lastSection = "";

/** Редакторы, зарегистрированные на странице */
const editors = new Map<string, EditorHandle>();
/** Последний известный код каждого редактора в комнате (с сервера и свой) */
const roomCodes = new Map<string, string>();
/** Последний отправленный нами код (защита от петли рассылки) */
const lastSent = new Map<string, string>();
/** Последний полученный удалённый код (защита от петли рассылки) */
const lastRemote = new Map<string, string>();

export function getRoomFromUrl(): string {
  if (typeof window === "undefined") return "urok-1";
  const r = new URLSearchParams(window.location.search).get("room");
  const safe = r?.replace(/[^\wа-яА-ЯёЁ-]/g, "").slice(0, 40).trim();
  return safe || "urok-1";
}

function sectionLabel(id: string): string {
  return NAV.find((n) => n.id === id)?.label ?? "раздел урока";
}

/* ---------- Store ---------- */

export const useCollab = create<CollabState>((set, get) => ({
  connected: false,
  joined: false,
  room: "urok-1",
  me: null,
  users: [],
  messages: [],
  unread: 0,
  notes: "",
  sharing: true,
  leading: false,
  following: false,
  panelOpen: false,
  flash: {},

  setPanelOpen: (v) => set({ panelOpen: v, unread: v ? 0 : get().unread }),

  join: (name) => {
    const s = ensureSocket(set, get);
    if (!s) return;
    reconnectName = name.trim();
    set({ room: getRoomFromUrl() });
    s.emit(
      "collab:join",
      { room: get().room, name: reconnectName },
      (res: {
        ok: boolean;
        you?: CollabUser;
        users?: CollabUser[];
        notes?: string;
        codes?: Record<string, string>;
        messages?: ChatMsg[];
        error?: string;
      }) => {
        if (!res?.ok) {
          console.warn("[collab] join failed", res?.error);
          return;
        }
        // применяем сохранённые коды комнаты только к нетронутым редакторам
        for (const [editorId, code] of Object.entries(res.codes ?? {})) {
          roomCodes.set(editorId, code);
          const h = editors.get(editorId);
          if (h && h.isPristine() && h.get() !== code) h.apply(code);
        }
        set({
          joined: true,
          me: res.you ?? null,
          users: res.users ?? [],
          notes: res.notes ?? "",
          messages: res.messages ?? [],
        });
      },
    );
  },

  sendChat: (text) => {
    const t = text.trim();
    if (!t || !socket) return;
    socket.emit("collab:chat", { text: t });
  },

  setNotes: (text, fromRemote = false) => {
    set({ notes: text });
    if (fromRemote || !socket) return;
    if (notesTimer) clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      notesTimer = null;
      socket?.emit("collab:notes", { text: get().notes });
    }, 400);
  },

  setSharing: (v) => set({ sharing: v }),
  setLeading: (v) => set({ leading: v }),
  setFollowing: (v) => set({ following: v }),

  reportSection: (sectionId) => {
    if (!get().leading || !socket) return;
    if (sectionId === lastSection) return;
    lastSection = sectionId;
    socket.emit("collab:section", { sectionId });
  },

  notifySolved: (taskId, title) => {
    if (!socket || !get().joined) return;
    socket.emit("collab:solved", { taskId, title });
  },

  broadcastCode: (editorId, code) => {
    if (!socket || !get().joined) return;
    if (!get().sharing) return;
    if (lastRemote.get(editorId) === code) {
      // это применение чужого кода — не ретранслируем
      lastRemote.delete(editorId);
      return;
    }
    if (lastSent.get(editorId) === code) return;
    lastSent.set(editorId, code);
    roomCodes.set(editorId, code);
    socket.emit("collab:code", { editorId, code });
  },

  registerEditor: (id, handle) => {
    editors.set(id, handle);
    // если для этого редактора уже есть код комнаты — применяем к нетронутому
    const code = roomCodes.get(id);
    if (code !== undefined && handle.isPristine() && handle.get() !== code) {
      handle.apply(code);
    }
  },

  unregisterEditor: (id) => {
    editors.delete(id);
  },

  clearFlash: (editorId) => {
    set((st) => {
      if (!(editorId in st.flash)) return st;
      const flash = { ...st.flash };
      delete flash[editorId];
      return { flash };
    });
  },
}));

/* ---------- Socket ---------- */

function ensureSocket(
  set: (partial: Partial<CollabState>) => void,
  get: () => CollabState,
): Socket | null {
  if (typeof window === "undefined") return null;
  if (socket) return socket;

  socket = io("https://vigilant-abundance-production-6403.up.railway.app", {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1500,
    timeout: 10000,
  });

  socket.on("connect", () => {
    set({ connected: true });
    // автоматический повторный вход после переподключения
    if (reconnectName && !get().joined) {
      get().join(reconnectName);
    }
  });

  socket.on("disconnect", () => {
    set({ connected: false, joined: false });
  });

  socket.on("collab:presence", (data: { users: CollabUser[] }) => {
    set({ users: data.users ?? [] });
  });

  socket.on("collab:chat", (msg: ChatMsg) => {
    set((st) => ({
      messages: [...st.messages.slice(-199), msg],
      unread: st.panelOpen || msg.system ? st.unread : st.unread + 1,
    }));
  });

  socket.on("collab:code", (data: { editorId: string; code: string; from: string }) => {
    const { editorId, code, from } = data;
    roomCodes.set(editorId, code);
    lastRemote.set(editorId, code);
    lastSent.delete(editorId);
    const h = editors.get(editorId);
    if (h) {
      h.apply(code);
      set((st) => ({ flash: { ...st.flash, [editorId]: from } }));
    }
  });

  socket.on("collab:notes", (data: { text: string; from: string }) => {
    get().setNotes(data.text, true);
  });

  socket.on("collab:section", (data: { sectionId: string; from: string }) => {
    if (!get().following) return;
    const el = document.getElementById(data.sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      toast({
        title: `${data.from} ведёт урок`,
        description: `Перешли к разделу «${sectionLabel(data.sectionId)}»`,
      });
    }
  });

  return socket;
}

/** Инициализация соединения (вызывается один раз из CollabRoot) */
export function initCollab(): void {
  ensureSocket(useCollab.setState, useCollab.getState);
}
