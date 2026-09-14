import {
  BookOpenCheck,
  Home,
  Percent,
  ListChecks,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { SectionHeading, Callout } from "./sections";
import { HomeworkWordButton } from "./homework-word-button";
import { HOMEWORK_BLOCKS } from "@/lib/lesson/homework-data";

const BLOCK_ICONS: React.ReactNode[] = [
  <Home key="b1" className="h-4 w-4" />,
  <Percent key="b2" className="h-4 w-4" />,
  <BookOpenCheck key="b3" className="h-4 w-4" />,
];

const BLOCK_TONES = ["border-stone-300", "border-amber-400/70", "border-emerald-400/70"];

export function Homework() {
  return (
    <section className="scroll-mt-20" aria-label="Домашнее задание">
      <SectionHeading
        num={8}
        id="homework"
        title="Домашнее задание"
        lead="Три блока по возрастанию сложности. Все задачи решаются материалом этого урока: print(), input(), int(), переменные и семь арифметических операций."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-stone-300 bg-white/70 p-4">
        <HomeworkWordButton />
        <p className="min-w-[220px] flex-1 text-[13px] leading-snug text-stone-600">
          Файл <b>.docx</b> откроется в Word, LibreOffice или Google Docs — удобно
          распечатать или вложить в дневник. Решения в файл не попадают, только условия
          и подсказки.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {HOMEWORK_BLOCKS.map((block, bi) => (
          <div
            key={bi}
            className={`rounded-2xl border-2 bg-white p-5 shadow-sm ${BLOCK_TONES[bi]}`}
          >
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-stone-900">
              <span className="text-amber-600">{BLOCK_ICONS[bi]}</span>
              {block.title}
            </h3>
            <ol className="mt-3 space-y-2.5">
              {block.tasks.map((task, ti) => (
                <li key={ti} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-stone-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-stone-100 font-mono text-[11px] font-bold text-stone-600 ring-1 ring-stone-200">
                    {bi + 1}.{ti + 1}
                  </span>
                  {task}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Callout icon={<Sparkles className="h-4 w-4" />} title="Подсказки для задач с цифрами числа">
          <p>
            В блоках 2–3 вам пригодится связка <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">{"//"}</code>{" "}
            и <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">%</code> с числом 10:
            например, последняя цифра числа — это <code className="font-mono">n % 10</code>, а
            «отбросить» последнюю цифру можно через <code className="font-mono">n // 10</code>.
            Трёхзначное число разбирается за два-три действия. Решайте в любой среде — или
            вернитесь к редакторам этого урока.
          </p>
        </Callout>
      </div>
    </section>
  );
}

const SKILLS = [
  { code: "print()", desc: "выводить текст и результаты вычислений" },
  { code: "input()", desc: "читать данные, которые вводит пользователь" },
  { code: "int(), float()", desc: "превращать текст в целое и дробное число" },
  { code: "x = 10", desc: "создавать переменные и менять их значения" },
  { code: "+ - * /", desc: "выполнять базовые арифметические действия" },
  { code: "// % **", desc: "целочисленное деление, остаток и степень" },
];

export function Checklist() {
  return (
    <section className="scroll-mt-20 rounded-3xl bg-stone-900 p-6 text-stone-100 sm:p-10" aria-label="Итоги урока">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400">
          <ListChecks className="h-5 w-5 text-stone-900" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight sm:text-[28px]">
          Что вы должны уметь после урока
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SKILLS.map((s) => (
          <div
            key={s.code}
            className="flex items-start gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <code className="font-mono text-[14px] font-semibold text-amber-300">{s.code}</code>
              <p className="mt-0.5 text-[13.5px] leading-snug text-stone-300">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[15px] leading-relaxed text-stone-300">
        И главное — уметь написать простую программу <b className="text-white">без копирования
        готового решения</b>. Если все семь пунктов выполняются уверенно, первый урок пройден
        не зря.
      </p>

      <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-br from-amber-400/15 to-emerald-400/10 p-5 ring-1 ring-amber-400/25 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-amber-300">
            Следующий урок
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-stone-200">
            <b>Условия if / else</b> — программы научатся принимать решения. Это одна из
            ключевых основ практически всей дальнейшей подготовки к ЕГЭ.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-[14px] font-bold text-stone-900">
          Урок 2
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </section>
  );
}
