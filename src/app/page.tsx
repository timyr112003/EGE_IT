import { LessonHeader } from "@/components/lesson/lesson-header";
import { Hero } from "@/components/lesson/hero";
import {
  SectionOne,
  SectionTwo,
  SectionThree,
  SectionStrings,
  SectionFour,
  SectionFive,
} from "@/components/lesson/sections";
import { SectionHeading } from "@/components/lesson/sections";
import { TaskTabs } from "@/components/lesson/task-tabs";
import { Homework, Checklist } from "@/components/lesson/homework";
import { EXAM_TASKS, SELF_TASKS } from "@/lib/lesson/tasks";

export default function LessonPage() {
  return (
    <div className="lesson-bg flex min-h-screen flex-col">
      <LessonHeader />
      <main className="flex-1">
        <Hero />

        <div className="mx-auto max-w-6xl space-y-16 px-4 pb-16 pt-4 sm:space-y-20">
          <SectionOne />
          <SectionTwo />
          <SectionThree />
          <SectionStrings />
          <SectionFour />
          <SectionFive />

          {/* Раздел 7: задачи в стиле ЕГЭ */}
          <section className="scroll-mt-20" aria-label="Раздел 7">
            <SectionHeading
              num={7}
              id="s6"
              title="Первая задача в стиле ЕГЭ"
              lead="Четыре классические задачи формата ЕГЭ. Напишите решение в редакторе и нажмите «Проверить» — программа сама прогонит ваш код на нескольких тестах: входных и ожидаемых выходных данных. Решение доступно в спойлере, но сначала попробуйте сами."
            />
            <TaskTabs tasks={EXAM_TASKS} withSolution stdinHint="Для задач с двумя числами нужны две строки ввода." />
          </section>

          {/* Раздел 8: самостоятельная работа */}
          <section className="scroll-mt-20" aria-label="Раздел 8">
            <SectionHeading
              num={8}
              id="s7"
              title="Самостоятельная работа"
              duration="10 минут"
              lead="Пять задач без подсказок и решений — только условие и автопроверка. Так вы проверите, что действительно умеете писать программы сами. Каждая задача решается 2–4 строками."
            />
            <TaskTabs tasks={SELF_TASKS} noHint stdinHint="Каждая строка поля ввода — один input()." />
          </section>

          {/* Домашнее задание */}
          <Homework />

          {/* Итоги */}
          <Checklist />
        </div>
      </main>

      <footer className="mt-auto border-t border-stone-200 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-[13px] text-stone-500 sm:flex-row">
          <p>
            <span className="font-semibold text-stone-700">Python · Урок 1</span> —
            знакомство с программированием, подготовка к ЕГЭ по информатике
          </p>
          <p>
            Код выполняется в браузере: Pyodide + WebAssembly ·{" "}
            <a href="/urok-2" className="font-semibold text-blue-700 underline">
              Урок 2: Условия и логика →
            </a>
            {" · "}
            <a href="/uchitelyu" className="text-stone-500 underline">
              Кабинет учителя
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
