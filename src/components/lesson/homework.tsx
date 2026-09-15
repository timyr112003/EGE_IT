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
import { HomeworkInteractive } from "./homework-interactive";
import { HomeworkSubmitPanel } from "./homework-submit-panel";
import {
  HOMEWORK_BLOCKS,
  HOMEWORK_ANSWERS_FILE_NAME,
  type HomeworkBlock,
} from "@/lib/lesson/homework-data";

interface HomeworkProps {
  /** Номер раздела в оглавлении урока (9 для урока 1, 10 для урока 2) */
  num?: number;
  blocks?: HomeworkBlock[];
  /** Текст-подсказка в звонуте под блоками (для урока 2 — своя) */
  calloutTitle?: string;
  calloutText?: React.ReactNode;
  lead?: string;
  /** Пропсы кнопки Word (файл, подзаголовок, данные) */
  wordProps?: {
    blocks?: HomeworkBlock[];
    hint?: string;
    fileName?: string;
    subtitle?: string;
  };
  /** Номер урока для журнала сдачи */
  lesson?: number;
  /** Префикс реестра решений и ключей localStorage */
  prefix?: string;
  /** Имя файла docx с ответами ученика */
  answersFileName?: string;
}

export function Homework({
  num = 9,
  blocks = HOMEWORK_BLOCKS,
  calloutTitle = "Подсказки для задач с цифрами числа",
  calloutText,
  lead = "Четыре блока по возрастанию сложности — 15 задач. Все задачи решаются материалом этого урока: print(), input(), int(), str(), переменные и арифметические операции. Решайте прямо здесь — редактор под каждой задачей.",
  wordProps,
  lesson = 1,
  prefix = "hw1",
  answersFileName = HOMEWORK_ANSWERS_FILE_NAME,
}: HomeworkProps) {
  return (
    <section className="scroll-mt-20" aria-label="Домашнее задание">
      <SectionHeading
        num={num}
        id="homework"
        title="Домашнее задание"
        lead={lead}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-stone-300 bg-white/70 p-4">
        <HomeworkWordButton {...wordProps} />
        <p className="min-w-[220px] flex-1 text-[13px] leading-snug text-stone-600">
          Файл <b>.docx</b> откроется в Word, LibreOffice или Google Docs — удобно
          распечатать или вложить в дневник. Решения в файл не попадают, только условия
          и подсказки.
        </p>
      </div>

      <HomeworkSubmitPanel
        blocks={blocks}
        lesson={lesson}
        prefix={prefix}
        answersFileName={answersFileName}
        subtitle={wordProps?.subtitle ?? "Python — Урок 1 · Подготовка к ЕГЭ по информатике"}
      />

      <HomeworkInteractive blocks={blocks} prefix={prefix} />

      <div className="mt-5">
        <Callout icon={<Sparkles className="h-4 w-4" />} title={calloutTitle}>
          {calloutText ?? (
            <p>
              В блоках 2–3 вам пригодится связка <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">{"//"}</code>{" "}
              и <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">%</code> с числом 10:
              например, последняя цифра числа — это <code className="font-mono">n % 10</code>, а
              «отбросить» последнюю цифру можно через <code className="font-mono">n // 10</code>.
              В блоке 4 склеивайте строки через + и превращайте числа в строки через{" "}
              <code className="font-mono">str()</code>. Трёхзначное число разбирается за два-три
              действия. Решайте в любой среде — или прямо в редакторах выше.
            </p>
          )}
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
  { code: "s1 + s2", desc: "склеивать строки и повторять их: s * n" },
  { code: "str()", desc: "превращать число в строку для склейки с текстом" },
];

interface ChecklistProps {
  skills?: { code: string; desc: string }[];
  closingNote?: string;
  nextLabel?: string;
  nextTitle?: string;
  nextText?: string;
  nextBadge?: string;
}

export function Checklist({
  skills = SKILLS,
  closingNote = "И главное — уметь написать простую программу без копирования готового решения. Если все пункты выполняются уверенно, первый урок пройден не зря.",
  nextLabel = "Следующий урок",
  nextTitle = "Условия if / else",
  nextText = "Программы научатся принимать решения. Это одна из ключевых основ практически всей дальнейшей подготовки к ЕГЭ.",
  nextBadge = "Урок 2",
}: ChecklistProps) {
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
        {skills.map((s) => (
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
        {closingNote}
      </p>

      <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-br from-amber-400/15 to-emerald-400/10 p-5 ring-1 ring-amber-400/25 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-amber-300">
            {nextLabel}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-stone-200">
            <b>{nextTitle}</b> — {nextText}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-[14px] font-bold text-stone-900">
          {nextBadge}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </section>
  );
}
