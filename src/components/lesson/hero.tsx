"use client";

import { GraduationCap, Clock, Sparkles, Target, Play, Code2 } from "lucide-react";
import { pyRunner } from "@/lib/py-runner/runner";

const CHIPS = [
  { icon: Clock, text: "90 минут" },
  { icon: GraduationCap, text: "Уровень: с нуля" },
  { icon: Target, text: "print · input · переменные · арифметика" },
];

export function Hero() {
  const start = (anchor: string) => {
    void pyRunner.preload(); // греем Pyodide заранее
    document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 lg:grid-cols-[1.15fr_1fr] lg:pb-20 lg:pt-16">
        <div>
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[12.5px] font-medium text-amber-800">
            <Sparkles className="h-3.5 w-3.5" />
            Первый шаг в программирование
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl">
            Первый урок{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Python</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-3.5 rounded-sm bg-amber-300/70" />
            </span>{" "}
            — с нуля до первых программ
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-stone-600">
            Сегодня вы поймёте, как устроена программа, научитесь работать с переменными,
            вводом и выводом — и уже на этом уроке решите первые задачи в стиле ЕГЭ.
            Каждое задание можно выполнить прямо на этой странице: редактор кода
            встроен в урок.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <span
                key={c.text}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-medium text-stone-700 shadow-sm ring-1 ring-stone-200"
              >
                <c.icon className="h-3.5 w-3.5 text-amber-500" />
                {c.text}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => start("s1")}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-[14.5px] font-semibold text-amber-300 shadow-lg shadow-stone-900/10 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              <Play className="h-4 w-4" />
              Начать урок
            </button>
            <button
              onClick={() => start("s7")}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-[14.5px] font-semibold text-stone-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-md active:translate-y-0"
            >
              <Code2 className="h-4 w-4 text-amber-500" />
              К самостоятельной работе
            </button>
          </div>
        </div>

        {/* Декоративная карточка с кодом */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-200/50 via-transparent to-emerald-200/40 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-stone-700 bg-[#282c34] shadow-2xl">
            <div className="flex items-center gap-2 bg-[#21252b] px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-xs text-stone-400">урок-1.py</span>
            </div>
            <pre className="p-5 font-mono text-[13.5px] leading-relaxed">
              <code>
                <span className="text-[#c678dd]">print</span>
                <span className="text-[#abb2bf]">(</span>
                <span className="text-[#98c379]">&quot;Привет, ЕГЭ!&quot;</span>
                <span className="text-[#abb2bf]">)</span>
                {"\n"}
                {"\n"}
                <span className="text-[#abb2bf]">name = </span>
                <span className="text-[#c678dd]">input</span>
                <span className="text-[#abb2bf]">()</span>
                {"\n"}
                <span className="text-[#abb2bf]">age = </span>
                <span className="text-[#d19a66]">17</span>
                {"\n"}
                <span className="text-[#c678dd]">print</span>
                <span className="text-[#abb2bf]">(</span>
                <span className="text-[#98c379]">&quot;Мне&quot;</span>
                <span className="text-[#abb2bf]">, age, </span>
                <span className="text-[#98c379]">&quot;лет&quot;</span>
                <span className="text-[#abb2bf]">)</span>
                {"\n"}
                <span className="text-[#c678dd]">print</span>
                <span className="text-[#abb2bf]">(17 // 5, 17 % 5)</span>
              </code>
            </pre>
            <div className="border-t border-stone-700/60 bg-[#1b1e23] px-5 py-3 font-mono text-[13px] leading-relaxed">
              <p className="text-emerald-300">Привет, ЕГЭ!</p>
              <p className="text-emerald-300">Мне 17 лет</p>
              <p className="text-emerald-300">3 2</p>
              <span className="console-caret mt-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
