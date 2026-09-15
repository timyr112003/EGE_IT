"use client";

/*
 * Кабинет учителя: журнал сданных домашних заданий.
 * Открывается по адресу /uchitelyu?key=КЛЮЧ (ключ из переменной
 * окружения TEACHER_KEY; по умолчанию urok2026 — смените в .env).
 *
 * Список берётся из GET /api/homework?key=…, удаление — DELETE.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Terminal,
  RefreshCw,
  Trash2,
  Loader2,
  LogIn,
  BookCheck,
  ChevronDown,
  Link2,
} from "lucide-react";

interface SubmissionTask {
  num: string;
  title: string;
  code: string;
  stdin: string;
  solved: boolean;
}

interface Submission {
  id: string;
  name: string;
  lesson: number;
  taskCount: number;
  solvedCount: number;
  tasks: SubmissionTask[];
  createdAt: string;
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function TaskRow({ task }: { task: SubmissionTask }) {
  return (
    <li className="rounded-xl border border-stone-200 bg-white p-3">
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 flex h-6 w-9 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
            task.solved ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
          }`}
          title={task.solved ? "Отмечено учеником как решённая" : "Без отметки"}
        >
          {task.num || "—"}
        </span>
        <p className="flex-1 text-[13px] leading-snug text-stone-600">{task.title}</p>
      </div>
      <pre className="thin-scroll mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#282c34] p-3 font-mono text-[12px] leading-relaxed text-stone-200">
        {task.code?.trim() ? task.code : "(решение не написано)"}
      </pre>
      {task.stdin?.trim() ? (
        <p className="mt-1.5 font-mono text-[11.5px] text-stone-500">
          ввод ученика: {task.stdin.split("\n").join(" | ")}
        </p>
      ) : null}
    </li>
  );
}

function SubmissionCard({
  sub,
  onDelete,
}: {
  sub: Submission;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const worked = sub.tasks.filter((t) => t.code?.trim()).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3.5 sm:px-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-900 font-mono text-[13px] font-bold text-amber-300">
          {sub.lesson}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-stone-900">{sub.name}</p>
          <p className="text-[12.5px] text-stone-500">
            Урок {sub.lesson} · {dateFormatter.format(new Date(sub.createdAt))} · задач в работе:{" "}
            {sub.taskCount}, с кодом: {worked}
            {sub.solvedCount > 0 ? `, отмечено решённых: ${sub.solvedCount}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-stone-200 px-2.5 text-[12.5px] font-medium text-stone-600 hover:bg-stone-50"
        >
          {open ? "Свернуть" : "Показать"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Удалить работу «${sub.name}» из журнала?`)) onDelete(sub.id);
          }}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-red-200 px-2.5 text-[12.5px] font-medium text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Удалить
        </button>
      </div>
      {open && (
        <div className="border-t border-stone-100 bg-stone-50/60 px-4 py-3 sm:px-5">
          <ul className="space-y-2.5">
            {sub.tasks.map((t, i) => (
              <TaskRow key={`${sub.id}-${i}`} task={t} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function TeacherPage() {
  const [key, setKey] = useState("");
  const [lesson, setLesson] = useState<string>("all");
  const [items, setItems] = useState<Submission[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (k: string, l: string) => {
    if (!k.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const url = `/api/homework?key=${encodeURIComponent(k.trim())}${l !== "all" ? `&lesson=${l}` : ""}`;
      const res = await fetch(url);
      if (res.status === 403) {
        setError("Неверный ключ. Спросите ключ у администратора сайта (в .env это TEACHER_KEY).");
        setItems(null);
        return;
      }
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data = (await res.json()) as { items?: Submission[] };
      setItems(data.items ?? []);
    } catch {
      setError("Не удалось загрузить журнал — сервер недоступен.");
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ключ можно передать в адресе: /uchitelyu?key=…
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const k = params.get("key") ?? "";
    if (k) {
      setKey(k);
      void load(k, "all");
    }
  }, [load]);

  const remove = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/homework?key=${encodeURIComponent(key.trim())}&id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        setItems((prev) => (prev ? prev.filter((x) => x.id !== id) : prev));
      } catch {
        setError("Не удалось удалить запись.");
      }
    },
    [key],
  );

  const filtered =
    lesson === "all" ? items ?? [] : (items ?? []).filter((x) => String(x.lesson) === lesson);

  return (
    <div className="lesson-bg flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#f8f7f4]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900">
            <Terminal className="h-4 w-4 text-amber-300" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[13.5px] font-bold text-stone-900">Кабинет учителя</span>
            <span className="text-[11px] text-stone-500">журнал сданных домашних заданий</span>
          </div>
          <a
            href="/"
            className="ml-auto text-[12.5px] font-medium text-stone-500 underline hover:text-stone-700"
          >
            ← К уроку 1
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-8">
        {/* Вход по ключу */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-[15px] font-bold text-stone-900">
            <LogIn className="h-4 w-4 text-amber-500" />
            Вход по ключу учителя
          </p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-stone-600">
            Работы учеников — личные данные, поэтому журнал защищён ключом. Ключ задаётся в
            файле <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[12.5px]">.env</code>{" "}
            (переменная <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[12.5px]">TEACHER_KEY</code>)
            и хранится втайне от учеников.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void load(key, lesson);
              }}
              placeholder="Ключ учителя"
              className="min-h-[44px] flex-1 rounded-xl border border-stone-300 bg-white px-3 text-[14px] focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500/20"
            />
            <select
              value={lesson}
              onChange={(e) => {
                setLesson(e.target.value);
                if (key.trim()) void load(key, e.target.value);
              }}
              className="min-h-[44px] rounded-xl border border-stone-300 bg-white px-3 text-[14px] text-stone-700 focus:outline-none"
              aria-label="Фильтр по уроку"
            >
              <option value="all">Все уроки</option>
              <option value="1">Урок 1</option>
              <option value="2">Урок 2</option>
            </select>
            <button
              type="button"
              onClick={() => void load(key, lesson)}
              disabled={loading || !key.trim()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 text-[14px] font-bold text-amber-300 transition hover:bg-stone-800 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Открыть журнал
            </button>
          </div>
          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13.5px] font-medium text-red-700">
              {error}
            </p>
          )}
        </div>

        {/* Журнал */}
        {items !== null && !error && (
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-[14px] font-bold text-stone-800">
                <BookCheck className="h-4 w-4 text-emerald-600" />
                Работ в журнале: {filtered.length}
              </p>
              <button
                type="button"
                onClick={() => void load(key, lesson)}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-[12.5px] font-medium text-stone-600 hover:bg-stone-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Обновить
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white/70 p-10 text-center">
                <p className="text-[15px] font-semibold text-stone-700">Пока пусто</p>
                <p className="mx-auto mt-1 max-w-md text-[13.5px] leading-relaxed text-stone-500">
                  Здесь появятся работы, когда ученики нажмут «Отправить учителю» на странице
                  урока. Ссылку на журнал можно добавить в закладки — она уже содержит ключ.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((sub) => (
                  <SubmissionCard key={sub.id} sub={sub} onDelete={remove} />
                ))}
              </div>
            )}
          </div>
        )}

        {items === null && !error && (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 text-[13.5px] leading-relaxed text-stone-600">
            <p className="flex items-center gap-2 font-semibold text-stone-800">
              <Link2 className="h-4 w-4 text-amber-500" />
              Подсказка
            </p>
            <p className="mt-2">
              Чтобы не вводить ключ каждый раз, откройте журнал по ссылке с ключом:{" "}
              <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[12.5px]">
                /uchitelyu?key=ВАШ_КЛЮЧ
              </code>{" "}
              — и добавьте страницу в закладки.
            </p>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-stone-200 bg-white/60 py-5 text-center text-[12.5px] text-stone-500">
        Кабинет учителя · Python — подготовка к ЕГЭ · работы хранятся в базе данных сервера
      </footer>
    </div>
  );
}
