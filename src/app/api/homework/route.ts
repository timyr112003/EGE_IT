import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/*
 * Приём и просмотр домашних заданий.
 *
 * POST /api/homework            — сдать работу { name, lesson, tasks: [...] }
 * GET  /api/homework?key=…      — журнал учителя (ключ из TEACHER_KEY)
 * DELETE /api/homework?key=…&id= — удалить работу из журнала
 */

const TEACHER_KEY = process.env.TEACHER_KEY || "urok2026";

const MAX_NAME = 80;
const MAX_TASKS = 80;
const MAX_TITLE = 300;
const MAX_CODE = 6000;
const MAX_STDIN = 2000;

/** Чистка текста: убираем управляющие символы (кроме \n, \t). */
function clean(text: unknown, max: number): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, max)
    .trimEnd();
}

interface IncomingTask {
  num: string;
  title: string;
  code: string;
  stdin: string;
  solved: boolean;
}

function parseTasks(raw: unknown): IncomingTask[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_TASKS) {
    throw new Error("Некорректный список задач");
  }
  return raw.map((t) => {
    const task = (t ?? {}) as Record<string, unknown>;
    return {
      num: clean(task.num, 16),
      title: clean(task.title, MAX_TITLE),
      code: clean(task.code, MAX_CODE),
      stdin: clean(task.stdin, MAX_STDIN),
      solved: task.solved === true,
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const name = clean(body.name, MAX_NAME);
    if (name.length < 2) {
      return NextResponse.json({ error: "Укажите имя ученика" }, { status: 400 });
    }
    const lessonRaw = Number(body.lesson);
    const lesson = Number.isInteger(lessonRaw) && lessonRaw >= 1 && lessonRaw <= 99 ? lessonRaw : 1;
    const tasks = parseTasks(body.tasks);
    const workedCount = tasks.filter((t) => t.solved || t.code.trim().length > 0).length;
    if (workedCount === 0) {
      return NextResponse.json(
        { error: "В работе нет ни одного решения" },
        { status: 400 },
      );
    }

    const sub = await db.homeworkSubmission.create({
      data: {
        name,
        lesson,
        taskCount: tasks.length,
        solvedCount: tasks.filter((t) => t.solved).length,
        data: JSON.stringify(tasks),
      },
    });

    return NextResponse.json({ ok: true, id: sub.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка сервера";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  if (key !== TEACHER_KEY) {
    return NextResponse.json({ error: "Неверный ключ учителя" }, { status: 403 });
  }
  const lessonParam = req.nextUrl.searchParams.get("lesson");
  const lesson =
    lessonParam && Number.isInteger(Number(lessonParam)) ? Number(lessonParam) : undefined;

  const rows = await db.homeworkSubmission.findMany({
    where: lesson ? { lesson } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    ok: true,
    items: rows.map((r) => {
      let tasks: unknown = [];
      try {
        tasks = JSON.parse(r.data);
      } catch {
        tasks = [];
      }
      return {
        id: r.id,
        name: r.name,
        lesson: r.lesson,
        taskCount: r.taskCount,
        solvedCount: r.solvedCount,
        tasks,
        createdAt: r.createdAt,
      };
    }),
  });
}

export async function DELETE(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  if (key !== TEACHER_KEY) {
    return NextResponse.json({ error: "Неверный ключ учителя" }, { status: 403 });
  }
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ error: "Не указан id" }, { status: 400 });
  }
  await db.homeworkSubmission.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
