import {
  Lightbulb,
  Terminal,
  AlertTriangle,
  Keyboard,
  ArrowRight,
  Cpu,
  ShieldCheck,
  BookMarked,
  Type,
} from "lucide-react";
import { CodeBlock } from "./code-block";
import { PythonPlayground } from "./python-playground";
import { TaskTabs } from "./task-tabs";
import {
  ARITHMETIC_STARTER,
  VARIABLES_STARTER_1,
  VARIABLES_STARTER_2,
  STRING_TASKS,
} from "@/lib/lesson/tasks";

/* ===== Вспомогательные блоки ===== */

export function SectionHeading({
  num,
  id,
  title,
  duration,
  lead,
}: {
  num: number;
  id: string;
  title: string;
  duration?: string;
  lead?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 font-mono text-lg font-bold text-amber-300">
          {num}
        </span>
        <h2 id={id} className="scroll-mt-20 text-2xl font-bold tracking-tight text-stone-900 sm:text-[28px]">
          {title}
        </h2>
        {duration && (
          <span className="rounded-full bg-stone-200/80 px-3 py-1 text-[12px] font-medium text-stone-600">
            {duration}
          </span>
        )}
      </div>
      {lead && <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-stone-600">{lead}</p>}
    </div>
  );
}

export function Callout({
  icon,
  title,
  children,
  tone = "amber",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  tone?: "amber" | "stone" | "red";
}) {
  const tones = {
    amber: "border-amber-300/70 bg-amber-50",
    stone: "border-stone-300 bg-stone-50",
    red: "border-red-300/70 bg-red-50",
  } as const;
  const iconTone = {
    amber: "text-amber-600",
    stone: "text-stone-600",
    red: "text-red-500",
  } as const;
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${tones[tone]}`}>
      <p className={`flex items-center gap-2 text-[14px] font-bold ${iconTone[tone]}`}>
        {icon}
        {title}
      </p>
      <div className="mt-2 text-[14px] leading-relaxed text-stone-700">{children}</div>
    </div>
  );
}

function VariableBox({ name, value }: { name: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="rounded-lg border-2 border-dashed border-amber-500 bg-amber-50 px-3 py-1.5 font-mono text-[14px] font-semibold text-stone-800">
        {name}
      </span>
      <ArrowRight className="h-4 w-4 text-stone-400" />
      <span className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-mono text-[14px] text-stone-800 shadow-sm">
        {value}
      </span>
    </span>
  );
}

/* ===== Разделы ===== */

export function SectionOne() {
  return (
    <section className="scroll-mt-20" aria-label="Раздел 1">
      <SectionHeading
        num={1}
        id="s1"
        title="Что такое Python"
        duration="10 минут"
        lead="Python — это язык, на котором мы записываем инструкции для компьютера. Вы пишете команду — компьютер выполняет её и показывает результат. Ниже — самая короткая программа на Python: одна инструкция print() выводит текст на экран."
      />

      <div className="space-y-5">
        <CodeBlock
          code={'print("Hello!")'}
          output={"Hello!"}
          title="Первая команда"
        />

        <Callout icon={<Lightbulb className="h-4 w-4" />} title="Как это читать">
          <p>
            <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">
              print()
            </code>{" "}
            — команда «напечатай на экране». Всё, что стоит внутри скобок в кавычках, Python
            выведет как есть. Кавычки могут быть двойными или одинарными —{" "}
            <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">
              &quot;текст&quot;
            </code>{" "}
            и{" "}
            <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">
              &apos;текст&apos;
            </code>{" "}
            работают одинаково.
          </p>
        </Callout>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 flex items-center gap-2 text-[15.5px] font-bold text-stone-900">
            <Terminal className="h-4 w-4 text-amber-500" />
            Первое задание — впишите своё имя
          </h3>
          <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
            Замените пропуски на своё имя, нажмите «Запустить» и посмотрите на вывод. Затем
            измените текст любой строки и запустите снова — программа всегда делает ровно то,
            что вы написали.
          </p>
          <PythonPlayground
            initialCode={`print("Меня зовут ...")
print("Я изучаю Python")
print("Я готовлюсь к ЕГЭ")`}
            fileName="задание-1.py"
            syncId="s1-intro"
          />
        </div>

        {/* Как компьютер выполняет код: транслятор */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 flex items-center gap-2 text-[15.5px] font-bold text-stone-900">
            <Cpu className="h-4 w-4 text-amber-500" />
            Как компьютер выполняет Python-код
          </h3>
          <p className="text-[14px] leading-relaxed text-stone-600">
            Компьютер понимает только машинный код — нули и единицы. Чтобы он выполнил
            программу на Python, нужен <b>транслятор</b> — специальная программа-переводчик,
            которая превращает ваш код в команды процессора. От того, <i>когда</i> происходит
            перевод, зависит всё:
          </p>
          <div className="mt-4 overflow-x-auto thin-scroll">
            <table className="w-full min-w-[520px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[12px] uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-2.5 font-semibold"> </th>
                  <th className="px-4 py-2.5 font-semibold">Компилятор</th>
                  <th className="px-4 py-2.5 font-semibold">Интерпретатор</th>
                </tr>
              </thead>
              <tbody className="text-stone-700">
                <tr className="border-b border-stone-100">
                  <td className="px-4 py-2.5 font-medium text-stone-800">Как работает</td>
                  <td className="px-4 py-2.5">переводит всю программу сразу в готовый файл</td>
                  <td className="px-4 py-2.5">читает и выполняет код <b>по строкам</b></td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="px-4 py-2.5 font-medium text-stone-800">Скорость</td>
                  <td className="px-4 py-2.5">запуск готового файла — очень быстрый</td>
                  <td className="px-4 py-2.5">каждый запуск — перевод заново</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-stone-800">Ошибки</td>
                  <td className="px-4 py-2.5">покажет все сразу, до запуска</td>
                  <td className="px-4 py-2.5">остановится на первой ошибке в своей строке</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Callout icon={<Lightbulb className="h-4 w-4" />} title="Что важно запомнить">
            <p>
              Python — <b>интерпретируемый</b> язык: интерпретатор выполняет программу строка
              за строкой, сверху вниз. Поэтому если ошибка прячется в десятой строке, первые
              девять всё равно успеют выполниться — и только потом программа остановится. На
              этой странице работает настоящий Python (CPython), собранный в WebAssembly:
              тот же интерпретатор, просто внутри браузера.
            </p>
          </Callout>
        </div>
      </div>
    </section>
  );
}

const OPERATIONS: { name: string; op: string; example: string; result: string; note?: string }[] = [
  { name: "Сложение", op: "+", example: "7 + 3", result: "10" },
  { name: "Вычитание", op: "-", example: "7 - 3", result: "4" },
  { name: "Умножение", op: "*", example: "7 * 3", result: "21" },
  { name: "Деление", op: "/", example: "7 / 2", result: "3.5", note: "всегда даёт дробное число" },
  { name: "Целочисленное деление", op: "//", example: "17 // 5", result: "3", note: "дробная часть отбрасывается" },
  { name: "Остаток", op: "%", example: "17 % 5", result: "2", note: "остаток от деления" },
  { name: "Степень", op: "**", example: "3 ** 5", result: "243", note: "3 в пятой степени" },
];

export function SectionTwo() {
  return (
    <section className="scroll-mt-20" aria-label="Раздел 2">
      <SectionHeading
        num={2}
        id="s2"
        title="Числа и арифметика"
        duration="15 минут"
        lead="Python умеет считать как обычный калькулятор — но гораздо мощнее. Запись в print() вычисляется, и на экран выводится готовый результат, а не сама запись."
      />

      <div className="space-y-5">
        <CodeBlock
          code={`print(5 + 3)
print(10 - 4)
print(6 * 7)
print(20 / 5)`}
          output={"8\n6\n42\n4.0"}
          title="Арифметика в print()"
        />

        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-5 py-3.5">
            <h3 className="text-[15.5px] font-bold text-stone-900">Таблица операций</h3>
            <p className="mt-0.5 text-[13px] text-stone-500">
              Обратите особое внимание на <code className="font-mono">{"//"}</code> и{" "}
              <code className="font-mono">%</code> — они чаще всего встречаются в задачах ЕГЭ.
            </p>
          </div>
          <div className="overflow-x-auto thin-scroll">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[12.5px] uppercase tracking-wide text-stone-500">
                  <th className="px-5 py-2.5 font-semibold">Операция</th>
                  <th className="px-4 py-2.5 font-semibold">В Python</th>
                  <th className="px-4 py-2.5 font-semibold">Пример</th>
                  <th className="px-4 py-2.5 font-semibold">Результат</th>
                </tr>
              </thead>
              <tbody>
                {OPERATIONS.map((o) => (
                  <tr key={o.op} className="border-b border-stone-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-stone-800">
                      {o.name}
                      {o.note && (
                        <span className="ml-2 hidden text-[12px] font-normal text-stone-400 md:inline">
                          — {o.note}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded-md bg-amber-100 px-2 py-0.5 font-mono text-[13.5px] font-bold text-stone-800">
                        {o.op}
                      </code>
                    </td>
                    <td className="px-4 py-3 font-mono text-[13.5px] text-stone-600">{o.example}</td>
                    <td className="px-4 py-3 font-mono text-[13.5px] font-semibold text-emerald-700">
                      {o.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <CodeBlock
          code={"print(17 // 5)\nprint(17 % 5)"}
          output={"3\n2"}
          title="Важно для ЕГЭ: // и %"
        />

        <Callout icon={<Lightbulb className="h-4 w-4" />} title="Запомните на примере">
          <p>
            Если 17 конфет раздать 5 друзьям поровну, каждый получит{" "}
            <b>17 // 5 = 3</b> конфеты, а <b>17 % 5 = 2</b> конфеты останутся в остатке.
            Целочисленное деление отвечает на вопрос «сколько раз целиком помещается», а
            остаток — «что лишнее».
          </p>
        </Callout>

        {/* Приоритет операторов */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 text-[15.5px] font-bold text-stone-900">Порядок вычислений</h3>
          <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
            В математике умножение старше сложения — в Python то же самое. Посмотрите на два
            почти одинаковых print(): результат разный, потому что операции выполняются по
            старшинству, а не слева направо.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <CodeBlock code={"print(2 + 3 * 4)"} output={"14"} title="Сначала умножение" />
            <CodeBlock code={"print((2 + 3) * 4)"} output={"20"} title="Скобки сильнее всех" />
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-stone-600">
            Порядок от старших к младшим: <code className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[13px] font-bold">**</code>{" "}
            (степень) → <code className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[13px] font-bold">* / // %</code>{" "}
            → <code className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[13px] font-bold">+ -</code>. Если сомневаетесь — ставьте скобки:
            они не портят код, а делают его понятнее для человека.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 text-[15.5px] font-bold text-stone-900">Практика — 5 задач</h3>
          <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
            Решайте задачи по одной в редакторе: заменяйте комментарии на код и запускайте.
            Каждая задача — одна строка вида <code className="font-mono">print(...)</code>.
          </p>
          <ol className="mb-4 grid gap-1.5 text-[14px] text-stone-700 sm:grid-cols-2">
            {[
              "Посчитать сумму 27 и 15",
              "Посчитать произведение 12 и 8",
              "Найти остаток от деления 25 на 4",
              "Найти целую часть от деления 25 на 4",
              "Возвести 3 в пятую степень",
            ].map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-stone-900 text-[11px] font-bold text-amber-300">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
          <PythonPlayground initialCode={ARITHMETIC_STARTER} fileName="практика-2.py" syncId="s2-practice" />
        </div>
      </div>
    </section>
  );
}

export function SectionThree() {
  return (
    <section className="scroll-mt-20" aria-label="Раздел 3">
      <SectionHeading
        num={3}
        id="s3"
        title="Переменные и стиль кода"
        duration="20 минут"
        lead="Переменная — это имя, под которым мы храним значение. Записываем значение в переменную один раз — и дальше используем имя во всей программе. Здесь же разберём два «профессиональных» вопроса: как правильно давать имена и что такое PEP."
      />

      <div className="space-y-5">
        <CodeBlock
          code={'age = 17\nname = "Ivan"\n\nprint(age)\nprint(age + 1)'}
          output={"17\n18"}
          title="Создаём переменные"
        />

        <Callout icon={<Lightbulb className="h-4 w-4" />} title="Важный момент">
          <p>
            В строке <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">x = 10</code>{" "}
            слева стоит <b>имя переменной</b>, справа — <b>значение</b>. Читайте как: «положи
            10 в коробку с именем x». Можно представить это так:
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <VariableBox name="x" value="10" />
            <span className="text-stone-500">→ после команды</span>
            <VariableBox name="x" value="25" />
          </div>
          <p className="mt-3">
            Команда <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">x = 25</code>{" "}
            не добавляет вторую коробку, а <b>заменяет</b> старое значение новым: в коробке x
            теперь лежит 25, десятки там больше нет.
          </p>
        </Callout>

        {/* Идентификаторы */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 flex items-center gap-2 text-[15.5px] font-bold text-stone-900">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            Идентификаторы: правила имён переменных
          </h3>
          <p className="text-[14px] leading-relaxed text-stone-600">
            Имя переменной в программировании называют <b>идентификатором</b>. Python
            разрешает не любые имена — есть пять правил, и на экзамене за их нарушение даётся
            ошибка SyntaxError:
          </p>
          <ol className="mt-3 grid gap-2 text-[14px] text-stone-700 sm:grid-cols-2">
            {[
              "Только латинские буквы, цифры и знак подчёркивания _",
              "Имя не может начинаться с цифры",
              "Пробелы и дефисы запрещены (нужен символ _)",
              "Заглавные и строчные буквы различаются: age и Age — разные переменные",
              "Нельзя использовать ключевые слова языка: if, else, for, while…",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-stone-900 text-[11px] font-bold text-amber-300">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
          <div className="mt-4 overflow-x-auto thin-scroll">
            <table className="w-full min-w-[420px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[12px] uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-2.5 font-semibold">Пример имени</th>
                  <th className="px-4 py-2.5 font-semibold">Можно?</th>
                  <th className="px-4 py-2.5 font-semibold">Почему</th>
                </tr>
              </thead>
              <tbody className="font-mono text-stone-700">
                {[
                  ["user_name", "да", "буквы и подчёркивание"],
                  ["_count", "да", "подчёркивание в начале разрешено"],
                  ["age16", "да", "цифры после букв"],
                  ["16age", "нет", "начинается с цифры"],
                  ["my-var", "нет", "дефис Python считает минусом"],
                  ["my var", "нет", "пробел недопустим"],
                  ["for", "нет", "ключевое слово языка"],
                ].map(([name, ok, why]) => (
                  <tr key={name} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-2">{name}</td>
                    <td className={`px-4 py-2 font-bold ${ok === "да" ? "text-emerald-700" : "text-red-600"}`}>{ok}</td>
                    <td className="px-4 py-2 font-sans text-stone-500">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-stone-500">
            Нюанс: формально Python 3 разрешает буквы других алфавитов, но так не делают —
            настоящий код пишут латиницей. Имя <code className="font-mono">print</code> — не
            ключевое слово, а имя встроенной функции: переменная с таким именем создастся, но
            сломает печать — лучше не надо.
          </p>
          <div className="mt-4">
            <p className="mb-3 text-[14px] font-semibold text-stone-800">
              Эксперимент: раскомментируйте любую строку — и Python откажется создавать такую
              переменную:
            </p>
            <PythonPlayground
              initialCode={`age = 16
Age = 21          # другое имя! регистр важен
print(age, Age)

# 2name = 5       # нельзя: начинается с цифры
# my-var = 5      # нельзя: дефис — это минус
# my var = 5      # нельзя: пробел
# for = 7         # нельзя: ключевое слово
`}
              fileName="имена.py"
              syncId="s3-ident"
            />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-1 text-[15.5px] font-bold text-stone-900">Упражнение 1</h3>
            <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
              Создайте три переменные и выведите каждую на экран. Потом поменяйте значения и
              запустите снова.
            </p>
            <PythonPlayground initialCode={VARIABLES_STARTER_1} fileName="упражнение-1.py" syncId="s3-var1" />
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-1 text-[15.5px] font-bold text-stone-900">Упражнение 2</h3>
            <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
              Даны две переменные. Выведите их сумму, произведение и разность — по одному
              результату на строку.
            </p>
            <PythonPlayground initialCode={VARIABLES_STARTER_2} fileName="упражнение-2.py" syncId="s3-var2" />
          </div>
        </div>

        {/* PEP и стиль кода */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 flex items-center gap-2 text-[15.5px] font-bold text-stone-900">
            <BookMarked className="h-4 w-4 text-amber-500" />
            Что такое PEP и почему код должен быть красивым
          </h3>
          <p className="text-[14px] leading-relaxed text-stone-600">
            <b>PEP</b> (Python Enhancement Proposal — «предложение по развитию Python») — это
            официальные документы, в которых сообщество Python описывает новые возможности
            языка и правила работы с ним. Главный документ для новичка — <b>PEP 8</b>:
            стандарт оформления кода. Программы читают не только компьютеры, но и люди —
            одноклассник, учитель, коллега. Единый стиль делает код понятным для всех.
          </p>
          <div className="mt-4 overflow-x-auto thin-scroll">
            <table className="w-full min-w-[520px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[12px] uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-2.5 font-semibold">Правило PEP 8</th>
                  <th className="px-4 py-2.5 font-semibold">Плохо</th>
                  <th className="px-4 py-2.5 font-semibold">Хорошо</th>
                </tr>
              </thead>
              <tbody className="text-stone-700">
                {[
                  ["Отступ — 4 пробела, не табуляция", "if x>1:\n  print(x)", "if x > 1:\n    print(x)"],
                  ["Имена переменных — строчными, через _ (snake_case)", "UserName, username2day", "user_name, items_count"],
                  ["Пробелы вокруг операторов = + - * /", "x=10;  a+b", "x = 10;  a + b"],
                  ["Пробел после запятой", "print(a,b)", "print(a, b)"],
                  ["Пробел после решётки в комментариях", "#комментарий", "# комментарий"],
                  ["Не растягивайте строки — короче 79 символов", "длинная строка на 120 символов", "перенесите на новую строку"],
                ].map(([rule, bad, good]) => (
                  <tr key={rule} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-stone-800">{rule}</td>
                    <td className="px-4 py-2.5 font-mono text-[12.5px] text-red-600">{bad}</td>
                    <td className="px-4 py-2.5 font-mono text-[12.5px] text-emerald-700">{good}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <CodeBlock
              code={"x=10\nprint( x *2 )\nUserName=\"Ivan\""}
              title="Так не пишут"
            />
            <CodeBlock
              code={"x = 10\nprint(x * 2)\nuser_name = \"Ivan\""}
              title="Так пишут по PEP 8"
            />
          </div>
          <Callout icon={<Lightbulb className="h-4 w-4" />} title="Совет">
            <p>
              Следить за стилем вручную необязательно: есть программы-линтеры (flake8) и
              автоформаттеры (black), которые проверяют и исправляют оформление сами. Но
              правила из таблицы стоит помнить — на экзамене и в жизни читабельный код ценится.
            </p>
          </Callout>
        </div>
      </div>
    </section>
  );
}

export function SectionStrings() {
  return (
    <section className="scroll-mt-20" aria-label="Раздел 4">
      <SectionHeading
        num={4}
        id="s3b"
        title="Строки: конкатенация и str()"
        duration="12 минут"
        lead="Текст в Python называется строкой, и со строками есть свои операции: их можно склеивать, повторять и превращать числа в текст. Это понадобится и для красивого вывода, и для задач экзамена."
      />

      <div className="space-y-5">
        <CodeBlock
          code={'first = "Иван"\nlast = "Петров"\n\nprint(first + " " + last)'}
          output={"Иван Петров"}
          title="Конкатенация — склейка строк через +"
        />

        <Callout icon={<Lightbulb className="h-4 w-4" />} title="Как это работает">
          <p>
            Операция <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">+</code> для
            строк означает «приклей одну строку к другой — без пробелов и без всего лишнего».
            Поэтому пробел приходится ставить самому:{" "}
            <code className="font-mono">first + &quot; &quot; + last</code> — средняя строка в
            кавычках и есть этот один пробел. А звёздочка повторяет строку:{" "}
            <code className="font-mono">&quot;ха&quot; * 3</code> →{" "}
            <code className="font-mono">хахаха</code>,{" "}
            <code className="font-mono">&quot;-&quot; * 20</code> — линия из 20 дефисов.
          </p>
        </Callout>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 text-[15.5px] font-bold text-stone-900">
            Попробуйте: склейка и повтор
          </h3>
          <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
            Запустите код, затем измените строки и числа. Посмотрите, что будет, если убрать
            пробел между словами.
          </p>
          <PythonPlayground
            initialCode={'name = "Анна"\n\ngreeting = "Привет, " + name\nprint(greeting)\n\nprint("-" * 20)\nprint("ха" * 3)'}
            fileName="склейка.py"
            syncId="s4-str-1"
          />
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 text-[15.5px] font-bold text-stone-900">
            Ловушка: строка + число = ошибка
          </h3>
          <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
            Склеить можно только строку со строкой. Раскомментируйте вторую строку — Python
            остановится с ошибкой TypeError: нельзя складывать текст и число.
          </p>
          <PythonPlayground
            initialCode={'age = 17\n\nprint("Мне " + str(age) + " лет")\n# print("Мне " + age + " лет")  ← уберите решётку и запустите'}
            fileName="ошибка-типов.py"
            syncId="s4-str-2"
          />
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 flex items-center gap-2 text-[15.5px] font-bold text-stone-900">
            <Type className="h-4 w-4 text-amber-500" />
            str() и другие функции преобразования
          </h3>
          <p className="text-[14px] leading-relaxed text-stone-600">
            Функция <code className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[13px] font-bold">str()</code>{" "}
            превращает число в строку — и тогда склейка работает. Это зеркало функций{" "}
            <code className="font-mono">int()</code> и <code className="font-mono">float()</code>, которые
            вы уже знаете:
          </p>
          <div className="mt-3 overflow-x-auto thin-scroll">
            <table className="w-full min-w-[460px] text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[12px] uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-2.5 font-semibold">Функция</th>
                  <th className="px-4 py-2.5 font-semibold">Что делает</th>
                  <th className="px-4 py-2.5 font-semibold">Пример</th>
                  <th className="px-4 py-2.5 font-semibold">Результат</th>
                </tr>
              </thead>
              <tbody className="text-stone-700">
                <tr className="border-b border-stone-100">
                  <td className="px-4 py-2.5 font-mono font-bold">str()</td>
                  <td className="px-4 py-2.5">число → строка</td>
                  <td className="px-4 py-2.5 font-mono">str(25)</td>
                  <td className="px-4 py-2.5 font-mono">&quot;25&quot;</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="px-4 py-2.5 font-mono font-bold">int()</td>
                  <td className="px-4 py-2.5">строка → целое число</td>
                  <td className="px-4 py-2.5 font-mono">int(&quot;25&quot;)</td>
                  <td className="px-4 py-2.5 font-mono">25</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono font-bold">float()</td>
                  <td className="px-4 py-2.5">строка → дробное число</td>
                  <td className="px-4 py-2.5 font-mono">float(&quot;3.14&quot;)</td>
                  <td className="px-4 py-2.5 font-mono">3.14</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <PythonPlayground
              initialCode={'price = 25\ncount = 3\n\ntotal = price * count\nprint("Итого: " + str(total) + " руб.")\nprint("На человека:", total / count)'}
              fileName="str-в-деле.py"
              syncId="s4-str-3"
            />
          </div>
          <Callout icon={<Lightbulb className="h-4 w-4" />} title="Запятая или плюс?">
            <p>
              В <code className="font-mono">print()</code> можно перечислять через запятую — она
              сама ставит пробелы и не требует str(). Конкатенация нужна, когда вы{" "}
              <b>собираете одну готовую строку</b>: сохранить в переменную, передать дальше,
              получить ровно нужный формат. На экзамене чаще всего используют запятую — она
              короче и безопаснее.
            </p>
          </Callout>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 text-[15.5px] font-bold text-stone-900">
            Задачи по строкам — с автопроверкой
          </h3>
          <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
            Три задачи на склейку, повтор и str(). Напишите решение и нажмите «Проверить».
          </p>
          <TaskTabs tasks={STRING_TASKS} withSolution stdinHint="Каждая строка поля ввода — один input()." />
        </div>
      </div>
    </section>
  );
}

export function SectionFour() {
  return (
    <section className="scroll-mt-20" aria-label="Раздел 5">
      <SectionHeading
        num={5}
        id="s4"
        title="Ввод данных"
        duration="20 минут"
        lead="До сих пор программа работала с числами, записанными прямо в коде. Команда input() позволяет получить данные от пользователя — так начинаются настоящие интерактивные программы и задачи ЕГЭ."
      />

      <div className="space-y-5">
        <Callout
          icon={<Keyboard className="h-4 w-4" />}
          title="Как вводить данные на этой странице"
          tone="stone"
        >
          <p>
            В каждом редакторе справа (или ниже на телефоне) есть поле <b>«Ввод данных»</b>.
            Напишите там ответ для пользователя — <b>каждая строка в этом поле — это один
            input()</b>. При запуске введённое подсвечивается янтарным в консоли, как будто вы
            печатали с клавиатуры. Если программа запросит больше значений, чем введено,
            Python выдаст ошибку EOFError — просто допишите строки.
          </p>
        </Callout>

        <CodeBlock
          code={"name = input()\n\nprint(name)"}
          title="Читаем ввод"
        />

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 text-[15.5px] font-bold text-stone-900">
            Первая полноценная программа
          </h3>
          <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
            Программа спрашивает имя и здоровается. В поле ввода уже написано «Alex» —
            запустите, а потом впишите своё имя.
          </p>
          <PythonPlayground
            initialCode={'name = input()\n\nprint("Привет,", name)'}
            initialStdin={"Alex"}
            fileName="приветствие.py"
            stdinHint="Если input() в программе два — нужно две строки в поле ввода."
            syncId="s4-greet"
          />
        </div>

        <Callout icon={<Lightbulb className="h-4 w-4" />} title="Что здесь нового">
          <p>
            Во-первых, результат <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">input()</code>{" "}
            мы сохраняем в переменную — иначе он потеряется. Во-вторых, в{" "}
            <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">print(&quot;Привет,&quot;, name)</code>{" "}
            через запятую можно перечислять несколько фрагментов: print сам поставит между
            ними пробел. Текст — в кавычках, переменные — без кавычек.
          </p>
        </Callout>
      </div>
    </section>
  );
}

export function SectionFive() {
  return (
    <section className="scroll-mt-20" aria-label="Раздел 6">
      <SectionHeading
        num={6}
        id="s5"
        title="Почему возникают ошибки с числами"
        lead="Самая частая ловушка новичка: input() всегда возвращает текст — даже если пользователь ввёл цифры. Вы уже знаете из раздела 4, что для строк + означает склейку. Проверим, что при этом происходит."
      />

      <div className="space-y-5">
        <CodeBlock
          code={"a = input()\nb = input()\n\nprint(a + b)"}
          output={"510"}
          title="Что не так?"
        />

        <Callout icon={<AlertTriangle className="h-4 w-4" />} title="Секрет input()" tone="red">
          <p>
            <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">input()</code>{" "}
            всегда получает <b>текст</b> (строку), даже если пользователь ввёл число. А для
            текста операция + означает «склейку»: <code className="font-mono">&quot;5&quot; + &quot;10&quot;</code>{" "}
            → <code className="font-mono">&quot;510&quot;</code>, а не 15. Поэтому нужны функции
            преобразования:
          </p>
          <div className="mt-3 space-y-1.5">
            <p>
              <code className="rounded-md bg-amber-100 px-2 py-0.5 font-mono text-[13.5px] font-bold">int()</code>{" "}
              — превращает текст в <b>целое число</b>: int(&quot;5&quot;) → 5
            </p>
            <p>
              <code className="rounded-md bg-amber-100 px-2 py-0.5 font-mono text-[13.5px] font-bold">float()</code>{" "}
              — превращает текст в <b>дробное число</b>: float(&quot;3.14&quot;) → 3.14
            </p>
          </div>
        </Callout>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-1 text-[15.5px] font-bold text-stone-900">Правильный вариант</h3>
          <p className="mb-4 text-[14px] leading-relaxed text-stone-600">
            Оборачиваем каждый input() в int() — и теперь «5» и «10» складываются как числа.
            В поле ввода уже есть тестовые значения: 5 и 10.
          </p>
          <PythonPlayground
            initialCode={"a = int(input())\nb = int(input())\n\nprint(a + b)"}
            initialStdin={"5\n10"}
            fileName="правильно.py"
            syncId="s5-int"
          />
        </div>

        <Callout icon={<Lightbulb className="h-4 w-4" />} title="Запомните схему">
          <p>
            Для всех задач ЕГЭ с числами используйте шаблон:{" "}
            <code className="rounded bg-stone-200/70 px-1.5 py-0.5 font-mono text-[13px]">x = int(input())</code>{" "}
            — «считать строку и превратить в целое число». Это самая частая строка кода на
            экзамене. Если в задаче дробные числа — замените int на float.
          </p>
        </Callout>
      </div>
    </section>
  );
}
