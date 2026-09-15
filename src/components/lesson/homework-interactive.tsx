"use client";

/*
 * Интерактивная сетка домашнего задания: каждая задача — с редактором
 * Python, полем ввода и отметкой «решено». Код сохраняется в localStorage
 * (persistKey редактора), отметки и код передаются в реестр сдачи
 * (hw-store), откуда их читает панель «Отправить учителю».
 */

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Home, Percent, BookOpenCheck, Type, CheckCircle2, Circle } from "lucide-react";
import { PythonPlayground } from "./python-playground";
import type { HomeworkBlock } from "@/lib/lesson/homework-data";
import {
  hwEnsure,
  hwUpdate,
  hwClear,
  hwGet,
  getHwVersion,
  subscribeHw,
} from "@/lib/lesson/hw-store";

const BLOCK_ICONS: React.ReactNode[] = [
  <Home key="b1" className="h-4 w-4" />,
  <Percent key="b2" className="h-4 w-4" />,
  <BookOpenCheck key="b3" className="h-4 w-4" />,
  <Type key="b4" className="h-4 w-4" />,
];

const BLOCK_TONES = [
  "border-stone-300",
  "border-amber-400/70",
  "border-emerald-400/70",
  "border-violet-400/70",
];

interface HomeworkInteractiveProps {
  blocks: HomeworkBlock[];
  /** Префикс ключей: «hw1» / «hw2» — изоляция уроков */
  prefix: string;
}

export function HomeworkInteractive({ blocks, prefix }: HomeworkInteractiveProps) {
  // version меняется при любом изменении реестра → перерисовка
  useSyncExternalStore(subscribeHw, getHwVersion, () => 0);

  const solvedKey = `python-hw-solved-${prefix}`;

  // Регистрируем все задачи в реестре сдачи и восстанавливаем отметки
  useEffect(() => {
    blocks.forEach((block, bi) => {
      block.tasks.forEach((task, ti) => {
        hwEnsure(prefix, bi, ti, {
          num: `${bi + 1}.${ti + 1}`,
          title: task.text,
          code: task.starter ?? "",
          stdin: task.stdin ?? "",
        });
      });
    });
    try {
      const raw = window.localStorage.getItem(solvedKey);
      if (raw) {
        const map = JSON.parse(raw) as Record<string, boolean>;
        blocks.forEach((_, bi) => {
          blocks[bi].tasks.forEach((_, ti) => {
            const v = map[`${bi}:${ti}`];
            if (typeof v === "boolean") hwUpdate(prefix, bi, ti, { solved: v });
          });
        });
      }
    } catch {
      /* приватный режим */
    }
    return () => hwClear(prefix);
  }, [prefix, solvedKey]);

  const isSolved = useCallback(
    (b: number, t: number): boolean => hwGet(prefix, b, t)?.solved ?? false,
    [prefix],
  );

  const toggleSolved = useCallback(
    (b: number, t: number) => {
      const cur = hwGet(prefix, b, t)?.solved ?? false;
      const solved = !cur;
      hwUpdate(prefix, b, t, { solved });
      try {
        const raw = window.localStorage.getItem(solvedKey);
        const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
        map[`${b}:${t}`] = solved;
        window.localStorage.setItem(solvedKey, JSON.stringify(map));
      } catch {
        /* приватный режим */
      }
    },
    [prefix, solvedKey],
  );

  const onCodeChange = useCallback(
    (b: number, t: number) => (code: string, stdin: string) => {
      hwUpdate(prefix, b, t, { code, stdin });
    },
    [prefix],
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {blocks.map((block, bi) => (
        <div
          key={bi}
          className={`rounded-2xl border-2 bg-white p-5 shadow-sm ${BLOCK_TONES[bi % BLOCK_TONES.length]}`}
        >
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-stone-900">
            <span className="text-amber-600">{BLOCK_ICONS[bi % BLOCK_ICONS.length]}</span>
            {block.title}
          </h3>
          <ol className="mt-3 space-y-3">
            {block.tasks.map((task, ti) => {
              const solved = isSolved(bi, ti);
              return (
                <li key={ti} className="rounded-xl bg-stone-50/80 p-3 ring-1 ring-stone-200/70">
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleSolved(bi, ti)}
                      aria-pressed={solved}
                      title={solved ? "Снять отметку" : "Отметить как решённую"}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 transition-colors ${
                        solved
                          ? "bg-emerald-500 text-white ring-emerald-500"
                          : "bg-white text-stone-400 ring-stone-300 hover:ring-stone-400"
                      }`}
                    >
                      {solved ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <span className="mr-1.5 inline-flex items-center justify-center rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-stone-600 ring-1 ring-stone-200">
                        {bi + 1}.{ti + 1}
                      </span>
                      <p className="inline text-[13.5px] leading-relaxed text-stone-700">
                        {task.text}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <PythonPlayground
                      initialCode={task.starter ?? `# ${task.text}\n\n`}
                      initialStdin={task.stdin ?? ""}
                      fileName={`дз-${bi + 1}-${ti + 1}.py`}
                      persistKey={`python-hw-${prefix}-${bi}-${ti}`}
                      onStateChange={onCodeChange(bi, ti)}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
