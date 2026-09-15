"use client";

/*
 * Панель сдачи домашнего задания на сервере:
 * - ученик решает задачи в редакторах ниже;
 * - вписывает имя и нажимает «Отправить учителю» → POST /api/homework;
 * - запасной канал — «Word с моими ответами» (.docx с кодом решений).
 *
 * Учитель смотрит работы на странице /uchitelyu (ключ из TEACHER_KEY).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Send, FileDown, Loader2, CheckCircle2, CircleAlert, UserRound } from "lucide-react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";
import type { HomeworkBlock } from "@/lib/lesson/homework-data";
import { tr, para } from "./homework-word-button";
import { hwEntries, getHwVersion, subscribeHw } from "@/lib/lesson/hw-store";
import { useSyncExternalStore } from "react";

interface HomeworkSubmitPanelProps {
  blocks: HomeworkBlock[];
  /** Урок в БД: 1 или 2 */
  lesson: number;
  /** Префикс реестра решений: «hw1» / «hw2» */
  prefix: string;
  /** Имя файла docx с ответами */
  answersFileName: string;
  /** Подзаголовок документа */
  subtitle: string;
}

type SendState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "ok"; at: string; saved: number }
  | { kind: "error"; message: string };

export function HomeworkSubmitPanel({
  blocks,
  lesson,
  prefix,
  answersFileName,
  subtitle,
}: HomeworkSubmitPanelProps) {
  useSyncExternalStore(subscribeHw, getHwVersion, () => 0);

  const [name, setName] = useState("");
  const [state, setState] = useState<SendState>({ kind: "idle" });
  const [wordBusy, setWordBusy] = useState(false);

  const nameKey = "python-hw-name";
  const sentKey = `python-hw-sent-${prefix}`;

  // Имя и отметка о последней отправке — из localStorage (после гидрации)
  useEffect(() => {
    try {
      const n = window.localStorage.getItem(nameKey);
      if (n) setName(n);
      const s = window.localStorage.getItem(sentKey);
      if (s && state.kind === "idle") {
        setState({ kind: "ok", at: s, saved: -1 });
      }
    } catch {
      /* приватный режим */
    }
  }, [sentKey]);

  const starters = useMemo(
    () => blocks.flatMap((b) => b.tasks.map((t) => t.starter ?? "")),
    [blocks],
  );
  const entries = hwEntries(prefix);
  const filled = entries.filter(
    (e, i) => e.solved || (e.code.trim().length > 0 && e.code !== starters[i]),
  ).length;
  const solvedCount = entries.filter((e) => e.solved).length;
  const total = starters.length;

  const submit = useCallback(async () => {
    if (state.kind === "sending") return;
    const cleanName = name.trim();
    if (!cleanName) {
      setState({ kind: "error", message: "Впишите имя — учитель должен понять, чья это работа." });
      return;
    }
    const list = hwEntries(prefix);
    const hasWork = list.some((e, i) => e.solved || (e.code.trim().length > 0 && e.code !== starters[i]));
    if (!hasWork) {
      setState({
        kind: "error",
        message: "Пока нечего отправлять: решите хотя бы одну задачу в редакторе ниже.",
      });
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          lesson,
          tasks: list.map((e) => ({
            num: e.num,
            title: e.title,
            code: e.code,
            stdin: e.stdin,
            solved: e.solved,
          })),
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Сервер ответил ошибкой ${res.status}`);
      }
      const data = (await res.json()) as { ok?: boolean; id?: string };
      const now = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
      setState({ kind: "ok", at: now, saved: 1 });
      window.localStorage.setItem(sentKey, now);
      window.localStorage.setItem(nameKey, cleanName);
      void data;
    } catch {
      setState({
        kind: "error",
        message:
          "Не удалось отправить работу: сервер недоступен. Нажмите «Word с моими ответами» и отправьте файл учителю вручную.",
      });
    }
  }, [name, lesson, prefix, sentKey, starters, state.kind]);

  // Word с моими ответами
  const downloadAnswers = useCallback(async () => {
    if (wordBusy) return;
    setWordBusy(true);
    try {
      const list = hwEntries(prefix);
      const cleanName = name.trim() || "______________________";
      const today = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());

      const children: Paragraph[] = [
        para([tr("Домашнее задание — ответы ученика", { bold: true, size: 36 })], {
          center: true,
          after: 60,
        }),
        para([tr(subtitle, { size: 24, color: "555555" })], { center: true, after: 240 }),
        para([tr(`Ученик: ${cleanName}     Дата: ${today}`, { size: 24 })], { after: 240 }),
      ];

      blocks.forEach((block, bi) => {
        const beforeBi = blocks.slice(0, bi).reduce((acc, b) => acc + b.tasks.length, 0);
        children.push(para([tr(block.title, { bold: true, size: 28 })], { before: 200, after: 120 }));
        block.tasks.forEach((task, ti) => {
          const e = list[beforeBi + ti];
          const code = e && e.code.trim() ? e.code : "(решение не написано)";
          children.push(
            para([tr(`${bi + 1}.${ti + 1}. `, { bold: true }), tr(task.text, { bold: true })], {
              before: 60,
              after: 40,
            }),
          );
          if (e?.solved) {
            children.push(para([tr("Отмечено как решённая", { size: 22, color: "2E7D32" })], { after: 20 }));
          }
          children.push(para([tr("Решение ученика:", { italics: true, size: 22, color: "555555" })], { after: 20 }));
          code.split("\n").forEach((line) => {
            children.push(
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: 0, line: 240 },
                children: [
                  new TextRun({
                    text: line.length ? line : " ",
                    font: "Courier New",
                    size: 22, // 11pt
                  }),
                ],
              }),
            );
          });
        });
      });

      children.push(
        para(
          [tr("Работа выполнена на странице урока (интерактивные редакторы Python).", {
            italics: true,
            size: 22,
            color: "555555",
          })],
          { before: 240, after: 0 },
        ),
      );

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 11906, height: 16838 },
                margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 },
              },
            },
            children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = answersFileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 500);
      window.localStorage.setItem(nameKey, name.trim());
    } finally {
      setWordBusy(false);
    }
  }, [blocks, name, prefix, answersFileName, subtitle, wordBusy]);

  return (
    <div className="mb-5 rounded-2xl border border-emerald-300/80 bg-emerald-50/60 p-4 sm:p-5">
      <p className="text-[14px] font-bold text-stone-900">Как сдать работу</p>
      <p className="mt-1 text-[13.5px] leading-relaxed text-stone-600">
        Решите задачи в редакторах ниже (код сохраняется автоматически), отметьте галочками
        решённые, впишите имя и отправьте учителю. Работа ляжет в общий журнал:{" "}
        <b>
          {filled} из {total}
        </b>{" "}
        задач с решением{solvedCount === 1 ? "" : ""}.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <label className="relative flex-1">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <span className="sr-only">Ваше имя и класс</span>
          <input
            type="text"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя и класс, например: Анна, 9А"
            className="min-h-[44px] w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-9 pr-3 text-[14px] text-stone-800 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={state.kind === "sending"}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.kind === "sending" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {state.kind === "sending" ? "Отправляю…" : "Отправить учителю"}
        </button>
        <button
          type="button"
          onClick={downloadAnswers}
          disabled={wordBusy}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-stone-700 shadow-sm transition hover:border-stone-400 disabled:opacity-60"
        >
          {wordBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 text-emerald-600" />
          )}
          Word с моими ответами
        </button>
      </div>

      <div aria-live="polite">
        {state.kind === "ok" && (
          <p className="mt-3 flex items-start gap-2 text-[13.5px] font-medium text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {state.saved >= 0
              ? `Отправлено ✓ ${state.at} — работа сохранена в журнале учителя.`
              : `Последняя отправка: ${state.at}.`}
          </p>
        )}
        {state.kind === "error" && (
          <p className="mt-3 flex items-start gap-2 text-[13.5px] font-medium text-red-700">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
