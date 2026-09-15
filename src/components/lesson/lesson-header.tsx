"use client";

import { useEffect, useState } from "react";
import { Terminal, ListChecks } from "lucide-react";
import { useLessonProgress, TOTAL_CHECKED_TASKS } from "@/lib/lesson/progress";
import { NAV, type NavItem } from "@/lib/lesson/nav";
import { useCollab } from "@/lib/collab/store";
import { CollabButton } from "./collab/collab-button";

interface LessonHeaderProps {
  nav?: NavItem[];
  brand?: string;
  progressKey?: string;
  progressTotal?: number;
}

export function LessonHeader({
  nav = NAV,
  brand = "Python · Урок 1",
  progressKey = "python-lesson-1-progress",
  progressTotal = TOTAL_CHECKED_TASKS,
}: LessonHeaderProps) {
  const { count } = useLessonProgress(progressKey);
  const [activeSection, setActiveSection] = useState<string>("");
  const leading = useCollab((s) => s.leading);
  const reportSection = useCollab((s) => s.reportSection);

  useEffect(() => {
    const sections = nav.map((n) => document.getElementById(n.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // В режиме «Вести урок» вещаем текущий раздел остальным участникам
  useEffect(() => {
    if (activeSection) reportSection(activeSection);
  }, [activeSection, leading, reportSection]);

  const pct = Math.round((count / progressTotal) * 100);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#f8f7f4]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900">
            <Terminal className="h-4 w-4 text-amber-300" />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[13.5px] font-bold text-stone-900">{brand}</span>
            <span className="text-[11px] text-stone-500">Подготовка к ЕГЭ</span>
          </span>
        </a>

        <nav className="thin-scroll ml-2 hidden flex-1 items-center gap-1 overflow-x-auto lg:flex" aria-label="Разделы урока">
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] transition-colors ${
                activeSection === n.id
                  ? "bg-stone-900 font-medium text-amber-300"
                  : "text-stone-600 hover:bg-stone-200/70"
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <CollabButton />
          <ListChecks className="h-4 w-4 hidden text-stone-500 sm:block" />
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11.5px] font-medium text-stone-600">
              Задачи с проверкой: {count} / {progressTotal}
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
