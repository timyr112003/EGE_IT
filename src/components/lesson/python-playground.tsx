"use client";

/*
 * Интерактивная площадка Python:
 * - редактор CodeMirror (подсветка oneDark)
 * - панель «Ввод данных» (каждая строка = один input())
 * - консоль вывода с эхом ввода и объяснением ошибок
 * - опциональная автопроверка по тестам
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import {
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  Loader2,
  CircleAlert,
  XCircle,
  Info,
} from "lucide-react";
import { pyRunner, usePyStatus, type PyStatus } from "@/lib/py-runner/runner";
import { explainError, errorSummary, type ErrorExplanation } from "@/lib/py-runner/error-hints";
import { markSolved } from "@/lib/lesson/progress";
import { useCollab } from "@/lib/collab/store";
import { EXAM_TASKS, SELF_TASKS } from "@/lib/lesson/tasks";
import { EXAM_TASKS_L2, SELF_TASKS_L2 } from "@/lib/lesson/tasks2";
import { UserRoundPen } from "lucide-react";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] items-center justify-center bg-[#282c34] text-sm text-stone-400">
      Загружаю редактор…
    </div>
  ),
});

export interface TestCase {
  stdin: string;
  expected: string;
}

interface OutputEntry {
  kind: "out" | "err" | "echo" | "sys";
  text: string;
}

interface TestResult {
  stdin: string;
  expected: string;
  actual: string;
  ok: boolean;
  error?: string | null;
}

interface PythonPlaygroundProps {
  initialCode: string;
  initialStdin?: string;
  /** id для учёта прогресса (обязательно, если задан tests) */
  taskId?: string;
  tests?: TestCase[];
  /** Подсказка под панелью ввода */
  stdinHint?: string;
  /** Имя файла в шапке редактора */
  fileName?: string;
  /** id для синхронизации кода между участниками (по умолчанию — из taskId) */
  syncId?: string;
}

function normalizeOutput(s: string): string {
  return s
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "")
    .trim();
}

const STATUS_TEXT: Record<PyStatus, string> = {
  idle: "Python ещё не запускался",
  loading: "Загружаю Python…",
  ready: "Python готов",
  running: "Выполняется…",
};

const STATUS_DOT: Record<PyStatus, string> = {
  idle: "bg-stone-500",
  loading: "bg-amber-400 animate-pulse",
  ready: "bg-emerald-400",
  running: "bg-emerald-400 animate-pulse",
};

export function PythonPlayground({
  initialCode,
  initialStdin = "",
  taskId,
  tests,
  stdinHint,
  fileName = "main.py",
  syncId,
}: PythonPlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [stdin, setStdin] = useState(initialStdin);
  const [output, setOutput] = useState<OutputEntry[]>([]);
  const [runningLocal, setRunningLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<ErrorExplanation | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [visible, setVisible] = useState(false);

  // Совместная работа: синхронизация кода этого редактора между участниками
  const collabSyncId = syncId ?? (taskId ? `task-${taskId}` : null);
  const sharing = useCollab((s) => s.sharing);
  const broadcastCode = useCollab((s) => s.broadcastCode);
  const registerEditor = useCollab((s) => s.registerEditor);
  const unregisterEditor = useCollab((s) => s.unregisterEditor);
  const clearFlash = useCollab((s) => s.clearFlash);
  const flashName = useCollab((s) => (collabSyncId ? s.flash[collabSyncId] : undefined));
  const codeRef = useRef(code);

  // Актуальный код для реестра синхронизации (обновляем в эффекте, не в рендере)
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    if (!collabSyncId) return;
    const handle = {
      get: () => codeRef.current,
      apply: (c: string) => setCode(c),
      isPristine: () => codeRef.current === initialCode,
    };
    registerEditor(collabSyncId, handle);
    return () => unregisterEditor(collabSyncId);
  }, [collabSyncId, registerEditor, unregisterEditor, initialCode]);

  // Рассылаем свой код в комнату (с задержкой на время печати)
  useEffect(() => {
    if (!collabSyncId) return;
    const t = setTimeout(() => broadcastCode(collabSyncId, code), 400);
    return () => clearTimeout(t);
  }, [code, collabSyncId, sharing, broadcastCode]);

  // Индикатор «код обновил такой-то участник»
  useEffect(() => {
    if (!flashName || !collabSyncId) return;
    const t = setTimeout(() => clearFlash(collabSyncId), 2500);
    return () => clearTimeout(t);
  }, [flashName, collabSyncId, clearFlash]);

  const status = usePyStatus();
  const consoleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ленивая инициализация редактора — когда площадка попала в зону видимости
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Автопрокрутка консоли
  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [output, error, hint]);

  const busy = status === "running" || checking;

  const cmExtensions = useMemo(
    () => [
      python(),
      oneDark,
      EditorView.lineWrapping,
      EditorView.theme({
        "&": { minHeight: "260px", maxHeight: "55vh" },
        ".cm-scroller": { fontFamily: "inherit", padding: "4px 0" },
        ".cm-gutters": { borderRight: "none" },
      }),
    ],
    [],
  );

  const run = useCallback(async () => {
    if (status === "running" || checking) return;
    setResults(null);
    setError(null);
    setHint(null);
    setOutput([]);
    setRunningLocal(true);
    const result = await pyRunner.run(code, stdin, {
      onStdout: (text, echo) =>
        setOutput((prev) => [...prev, { kind: echo ? "echo" : "out", text }]),
      onStderr: (text) => setOutput((prev) => [...prev, { kind: "err", text }]),
      onSys: (text) => setOutput((prev) => [...prev, { kind: "sys", text }]),
    });
    setRunningLocal(false);
    if (!result.ok && result.error && result.error !== "__INTERRUPTED__") {
      setError(result.error);
      setHint(explainError(result.error));
    }
  }, [code, stdin, status, checking]);

  const stop = useCallback(() => {
    pyRunner.stop();
    setRunningLocal(false);
    setChecking(false);
    setOutput((prev) => [...prev, { kind: "sys", text: "— выполнение прервано —" }]);
  }, []);

  const reset = useCallback(() => {
    setCode(initialCode);
    setStdin(initialStdin);
    setOutput([]);
    setError(null);
    setHint(null);
    setResults(null);
  }, [initialCode, initialStdin]);

  const checkTests = useCallback(async () => {
    if (!tests || busy) return;
    setResults(null);
    setError(null);
    setHint(null);
    setChecking(true);
    setOutput([]);
    const collected: TestResult[] = [];
    for (const t of tests) {
      let actual = "";
      const r = await pyRunner.run(code, t.stdin, {
        onStdout: (text, echo) => {
          // Эхо ввода не входит в ожидаемый вывод программы
          if (!echo) actual += text;
        },
        onStderr: () => {},
      });
      const err = r.ok ? null : r.error ?? "Ошибка выполнения";
      collected.push({
        stdin: t.stdin,
        expected: t.expected,
        actual: err ? "" : actual,
        ok: !err && normalizeOutput(actual) === normalizeOutput(t.expected),
        error: err,
      });
    }
    setResults(collected);
    setChecking(false);
    if (taskId && collected.every((r) => r.ok)) {
      markSolved(taskId);
      const task = [...EXAM_TASKS, ...SELF_TASKS, ...EXAM_TASKS_L2, ...SELF_TASKS_L2].find(
        (t) => t.id === taskId,
      );
      if (task) useCollab.getState().notifySolved(taskId, task.shortTitle);
    }
  }, [tests, busy, code, taskId]);

  const allPassed = results !== null && results.every((r) => r.ok);

  return (
    <div ref={containerRef} className="overflow-hidden rounded-xl border border-stone-700 bg-[#1e1e2e] shadow-lg">
      {/* Тулбар */}
      <div className="flex flex-wrap items-center gap-2 bg-[#181820] px-3 py-2">
        <span className="mr-1 rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-stone-400">
          {fileName}
        </span>
        {flashName && (
          <span className="flex items-center gap-1 rounded-md bg-amber-400/15 px-2 py-1 text-[11px] font-medium text-amber-300">
            <UserRoundPen className="h-3 w-3" />
            обновил: {flashName}
          </span>
        )}
        <button
          onClick={run}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-[13px] font-semibold text-stone-900 shadow-sm transition-all hover:bg-amber-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {runningLocal ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Запустить
        </button>
        {runningLocal && (
          <button
            onClick={stop}
            className="flex items-center gap-1.5 rounded-lg border border-red-400/40 px-3 py-1.5 text-[13px] font-medium text-red-300 transition-colors hover:bg-red-400/10"
          >
            <Square className="h-3 w-3" />
            Стоп
          </button>
        )}
        {tests && (
          <button
            onClick={checkTests}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-[13px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {checking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Проверить
          </button>
        )}
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] text-stone-400 transition-colors hover:bg-white/10 hover:text-stone-200"
          title="Вернуть исходный код"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Сбросить
        </button>
        <span className="ml-auto hidden items-center gap-1.5 text-[11px] text-stone-500 sm:flex">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
          {STATUS_TEXT[status]}
        </span>
      </div>

      {/* Редактор + панели */}
      <div className="grid gap-3 p-3 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg min-w-0">
          {visible ? (
            <CodeMirror
              value={code}
              onChange={setCode}
              theme={oneDark}
              extensions={cmExtensions}
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                autocompletion: false,
                searchKeymap: false,
                highlightActiveLine: true,
              }}
              className="python-editor"
            />
          ) : (
            <div className="flex h-[260px] items-center justify-center rounded-lg bg-[#282c34] text-sm text-stone-500">
              Редактор загрузится при прокрутке
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          {/* Ввод данных */}
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <label
                htmlFor={`stdin-${taskId ?? "free"}`}
                className="text-[11px] font-semibold uppercase tracking-wider text-stone-400"
              >
                Ввод данных
              </label>
              <span className="text-[11px] text-stone-500">каждая строка — один input()</span>
            </div>
            <textarea
              id={`stdin-${taskId ?? "free"}`}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={3}
              spellCheck={false}
              placeholder={"Например:\n5\n10"}
              className="thin-scroll dark-scroll w-full resize-y rounded-lg border border-stone-700 bg-[#282c34] p-2.5 font-mono text-[13px] text-stone-200 placeholder:text-stone-600 focus:border-amber-400/50 focus:outline-none"
            />
            {stdinHint && <p className="mt-1 text-[11px] leading-snug text-stone-500">{stdinHint}</p>}
          </div>

          {/* Консоль вывода */}
          <div className="flex min-h-[120px] flex-1 flex-col">
            <span className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Вывод программы
            </span>
            <div
              ref={consoleRef}
              className="thin-scroll dark-scroll max-h-[280px] min-h-[110px] flex-1 overflow-y-auto rounded-lg bg-black/50 p-3 font-mono text-[13px] leading-relaxed"
              aria-live="polite"
            >
              {output.length === 0 && !error && (
                <p className="text-stone-600">
                  Здесь появится результат. Нажмите «Запустить».
                  <span className="console-caret ml-1" />
                </p>
              )}
              {output.map((entry, i) => (
                <pre
                  key={i}
                  className={
                    entry.kind === "err"
                      ? "whitespace-pre-wrap text-red-400"
                      : entry.kind === "echo"
                        ? "whitespace-pre-wrap text-amber-300/90"
                        : entry.kind === "sys"
                          ? "whitespace-pre-wrap italic text-stone-500"
                          : "whitespace-pre-wrap text-stone-100"
                  }
                >
                  {entry.text}
                </pre>
              ))}
              {error && (
                <pre className="mt-1 whitespace-pre-wrap text-red-400">{errorSummary(error)}</pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Объяснение ошибки */}
      {hint && (
        <div className="mx-3 mb-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="text-[13px] font-semibold text-amber-200">{hint.title}</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-stone-300">{hint.advice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Результаты автопроверки */}
      {results && (
        <div className="mx-3 mb-3 space-y-2">
          {allPassed ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
              <p className="text-[13.5px] font-semibold text-emerald-200">
                Все тесты пройдены — задача выполнена! Отличная работа.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 p-3">
              <CircleAlert className="h-5 w-5 shrink-0 text-red-300" />
              <p className="text-[13.5px] font-medium text-red-200">
                Пока не все тесты проходят. Посмотрите сравнение ниже и поправьте код.
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div
                key={i}
                className={`rounded-lg border p-2.5 text-[12.5px] ${
                  r.ok
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : "border-red-400/30 bg-red-400/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  {r.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-300" />
                  )}
                  <span className="font-semibold text-stone-200">Тест {i + 1}</span>
                  <span className="font-mono text-[11px] text-stone-500">
                    ввод: [{r.stdin.split("\n").join(", ")}]
                  </span>
                </div>
                {!r.ok && (
                  <div className="mt-1.5 grid gap-1 pl-6 font-mono text-[12px] sm:grid-cols-2">
                    <p className="text-stone-400">
                      ожидалось:{" "}
                      <span className="text-emerald-300">{r.expected.split("\n").join(" ⏎ ") || "(пусто)"}</span>
                    </p>
                    <p className="text-stone-400">
                      получено:{" "}
                      <span className={r.error ? "text-red-300" : "text-amber-300"}>
                        {r.error
                          ? errorSummary(r.error)
                          : r.actual.split("\n").join(" ⏎ ") || "(пусто)"}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
