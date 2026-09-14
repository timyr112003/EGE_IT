"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, Eye } from "lucide-react";
import { PythonPlayground } from "./python-playground";
import { CodeBlock } from "./code-block";
import type { LessonTask } from "@/lib/lesson/tasks";

interface TaskCardProps {
  task: LessonTask;
  index: number;
  /** Скрывать подсказку (для самостоятельной работы) */
  noHint?: boolean;
  /** Показывать решение в спойлере */
  withSolution?: boolean;
  stdinHint?: string;
}

function Spoiler({
  icon,
  label,
  children,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tone: "amber" | "violet";
}) {
  const [open, setOpen] = useState(false);
  const toneCls =
    tone === "amber"
      ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
      : "border-violet-300 bg-violet-50 text-violet-900 hover:bg-violet-100";
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors ${toneCls}`}
      >
        {icon}
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function TaskCard({ task, index, noHint, withSolution, stdinHint }: TaskCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-[13px] font-bold text-amber-300">
          {index}
        </span>
        <div>
          <h4 className="text-[15.5px] font-bold text-stone-900">{task.shortTitle}</h4>
          <p className="mt-1 text-[14px] leading-relaxed text-stone-600">{task.statement}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {task.hint && !noHint && (
          <Spoiler icon={<Lightbulb className="h-3.5 w-3.5" />} label="Подсказка" tone="amber">
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13.5px] leading-relaxed text-amber-900">
              {task.hint}
            </p>
          </Spoiler>
        )}
        {task.solution && withSolution && (
          <Spoiler icon={<Eye className="h-3.5 w-3.5" />} label="Показать решение" tone="violet">
            <p className="mb-2 text-[12.5px] text-stone-500">
              Сначала попробуйте сами! Решение сверяйте только после своей попытки.
            </p>
            <CodeBlock code={task.solution} title="Решение" />
          </Spoiler>
        )}
      </div>

      <PythonPlayground
        key={task.id}
        taskId={task.id}
        initialCode={task.starterCode}
        initialStdin={task.initialStdin ?? ""}
        tests={task.tests}
        stdinHint={stdinHint}
      />
    </div>
  );
}
