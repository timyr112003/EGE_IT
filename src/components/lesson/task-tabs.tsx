"use client";

import { useState } from "react";
import { TaskCard } from "./task-card";
import type { LessonTask } from "@/lib/lesson/tasks";

interface TaskTabsProps {
  tasks: LessonTask[];
  /** Скрывать подсказки (самостоятельная работа) */
  noHint?: boolean;
  withSolution?: boolean;
  stdinHint?: string;
}

export function TaskTabs({ tasks, noHint, withSolution, stdinHint }: TaskTabsProps) {
  const [active, setActive] = useState(0);
  const task = tasks[active];

  return (
    <div className="space-y-4">
      <div
        className="thin-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
        role="tablist"
        aria-label="Список задач"
      >
        {tasks.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
              i === active
                ? "border-stone-900 bg-stone-900 text-amber-300 shadow-sm"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            <span className="mr-1.5 font-mono text-[11px] opacity-70">№{i + 1}</span>
            {t.shortTitle}
          </button>
        ))}
      </div>

      <TaskCard
        key={task.id}
        task={task}
        index={active + 1}
        noHint={noHint}
        withSolution={withSolution}
        stdinHint={stdinHint}
      />
    </div>
  );
}
