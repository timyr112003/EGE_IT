import type { Metadata } from "next";
import { LessonHeader } from "@/components/lesson/lesson-header";
import { Hero2 } from "@/components/lesson/hero2";
import { SectionHeading, Callout } from "@/components/lesson/sections";
import { CodeBlock } from "@/components/lesson/code-block";
import { TaskTabs } from "@/components/lesson/task-tabs";
import { Homework, Checklist } from "@/components/lesson/homework";
import { PythonPlayground } from "@/components/lesson/python-playground";
import { SetLessonRoom } from "@/components/lesson/set-lesson-room";
import { EXAM_TASKS_L2, SELF_TASKS_L2 } from "@/lib/lesson/tasks2";
import { NAV2 } from "@/lib/lesson/nav2";
import { TOTAL_CHECKED_TASKS_L2 } from "@/lib/lesson/progress";
import {
  HOMEWORK_BLOCKS_L2,
  HOMEWORK_HINT_L2,
  HOMEWORK_FILE_NAME_L2,
} from "@/lib/lesson/homework-data2";
import { Lightbulb, AlertTriangle, GraduationCap, Terminal } from "lucide-react";
import type { LessonTask } from "@/lib/lesson/tasks";

export const metadata: Metadata = {
  title: "Урок 2. Условия и логика в Python — подготовка к ЕГЭ по информатике",
  description:
    "Интерактивный урок 2 по Python для подготовки к ЕГЭ: условия if, elif, else, операторы сравнения и логические операции. Редактор Python работает прямо в браузере.",
};

/* Задачи повторения — простые, с решениями и автопроверкой */
const REP_TASKS: LessonTask[] = [
  {
    id: "l2-rep-1",
    shortTitle: "Квадрат числа",
    statement: "Вводится число. Выведите его квадрат.",
    solution: "n = int(input())\nprint(n ** 2)",
    starterCode: "",
    tests: [{ stdin: "6", expected: "36" }],
  },
  {
    id: "l2-rep-2",
    shortTitle: "Остаток",
    statement: "Вводятся два числа. Выведите остаток от деления первого на второе.",
    solution: "a = int(input())\nb = int(input())\nprint(a % b)",
    starterCode: "",
    tests: [{ stdin: "17\n5", expected: "2" }],
  },
  {
    id: "l2-rep-3",
    shortTitle: "Полные часы",
    statement: "Вводится количество минут. Выведите количество полных часов.",
    solution: "minutes = int(input())\nprint(minutes // 60)",
    starterCode: "",
    tests: [{ stdin: "130", expected: "2" }],
  },
];

/* Навыки итогового чек-листа урока 2 */
const SKILLS_L2 = [
  { code: "if / elif / else", desc: "писать ветвления с двоеточием и отступом" },
  { code: "> < >= <= == !=", desc: "сравнивать значения и не путать = с ==" },
  { code: "n % 2 == 0", desc: "проверять чётность и делимость чисел" },
  { code: "and, or, not", desc: "соединять простые условия в сложные" },
  { code: "elif", desc: "выбирать нужную ветку: первая подошедшая побеждает" },
  { code: "ввод → условие → вывод", desc: "решать задачи по стандартной схеме ЕГЭ" },
];

export default function Lesson2Page() {
  return (
    <div className="min-h-screen">
      <SetLessonRoom room="urok-2" lesson="2" />
      <LessonHeader
        nav={NAV2}
        brand="Python · Урок 2"
        progressKey="python-lesson-2-progress"
        progressTotal={TOTAL_CHECKED_TASKS_L2}
      />
      <Hero2 />

      <main className="mx-auto max-w-6xl space-y-16 px-4 pb-20">
        {/* Раздел 1: повторение */}
        <section className="scroll-mt-20" aria-label="Раздел 1">
          <SectionHeading
            num={1}
            id="s1"
            title="Повторение: основы"
            duration="10 минут"
            lead="Разминка перед новой темой: вспоминаем print, input, переменные и арифметику из первого урока."
          />
          <div className="space-y-5">
            <Callout icon={<Lightbulb className="h-4 w-4" />} title="Вопросы для устной разминки">
              <p>
                Что делает <code>print()</code>? Для чего нужен <code>input()</code>? Почему
                пишем <code>int(input())</code>, а не просто <code>input()</code>? Что означает{" "}
                <code>%</code> и <code>//</code>? Что такое переменная? Если какой-то из ответов
                вызывает сомнения —{" "}
                <a href="/" className="font-medium text-blue-700 underline">
                  вернитесь к уроку 1
                </a>
                .
              </p>
            </Callout>
            <TaskTabs
              tasks={REP_TASKS}
              withSolution
              stdinHint="Каждая строка поля ввода — один input()."
            />
          </div>
        </section>

        {/* Раздел 2: зачем нужны условия */}
        <section className="scroll-mt-20" aria-label="Раздел 2">
          <SectionHeading
            num={2}
            id="s2"
            title="Зачем нужны условия"
            duration="10 минут"
            lead="Программы учатся принимать решения: действовать по-разному в зависимости от данных."
          />
          <div className="space-y-5">
            <p className="text-[15px] leading-relaxed text-stone-700">
              В жизни мы постоянно действуем по схеме «если — то»: если дождь — берём зонт, если
              дождя нет — не берём. В программировании то же самое делает конструкция{" "}
              <code>if</code> («если»). Python проверяет условие: истинно — выполняет команду с
              отступом, ложно — пропускает её.
            </p>
            <CodeBlock
              title="Пример · Первое условие"
              code={"age = 18\n\nif age >= 18:\n    print(\"Можно\")"}
              output="Можно"
            />
            <Callout icon={<AlertTriangle className="h-4 w-4" />} title="Главное правило">
              <p>
                После условия ставится двоеточие <code>:</code>, а действие записывается{" "}
                <b>с отступом</b> — четыре пробела. Отступ показывает Python, какая команда
                относится к условию. Без отступа программа не запустится.
              </p>
            </Callout>
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-1 flex items-center gap-2 text-[15.5px] font-bold text-stone-900">
                <Terminal className="h-4 w-4 text-amber-500" />
                Попробуйте сами
              </h3>
              <p className="mb-3 text-[13.5px] text-stone-600">
                Измените возраст на 15 и запустите снова — программа ничего не выведет:
                условие ложно. «Молчание» программы — тоже результат.
              </p>
              <PythonPlayground
                initialCode={"age = 18\n\nif age >= 18:\n    print(\"Можно\")"}
                fileName="условие.py"
                syncId="l2-s2-demo"
              />
            </div>
          </div>
        </section>

        {/* Раздел 3: операторы сравнения */}
        <section className="scroll-mt-20" aria-label="Раздел 3">
          <SectionHeading
            num={3}
            id="s3"
            title="Операторы сравнения"
            duration="10 минут"
            lead="Условие — это вопрос с ответом «да» или «нет». Задаём его операторами сравнения."
          />
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="bg-stone-100 text-left text-[12px] uppercase tracking-wide text-stone-500">
                    <th className="px-4 py-2.5">Оператор</th>
                    <th className="px-4 py-2.5">Значение</th>
                    <th className="px-4 py-2.5">Пример</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[
                    [">", "больше", "7 > 3 — истина"],
                    ["<", "меньше", "2 < 1 — ложь"],
                    [">=", "больше или равно", "5 >= 5 — истина"],
                    ["<=", "меньше или равно", "4 <= 3 — ложь"],
                    ["==", "равно", "6 == 6 — истина"],
                    ["!=", "не равно", "6 != 4 — истина"],
                  ].map(([op, name, ex]) => (
                    <tr key={op}>
                      <td className="px-4 py-2.5 font-mono font-semibold text-stone-900">{op}</td>
                      <td className="px-4 py-2.5 text-stone-700">{name}</td>
                      <td className="px-4 py-2.5 font-mono text-[13px] text-stone-600">{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout icon={<AlertTriangle className="h-4 w-4" />} title="Не перепутайте = и ==">
              <p>
                Один знак — <b>записать</b> значение: <code>x = 10</code>. Два знака —{" "}
                <b>спросить</b>, равно ли: <code>x == 10</code>. Если в условии написать один
                знак, Python остановится с ошибкой SyntaxError.
              </p>
            </Callout>
            <div className="grid gap-4 md:grid-cols-2">
              <CodeBlock
                title="Вопрос · Что выведет?"
                code={"x = 10\n\nif x > 5:\n    print(\"A\")"}
                output="A"
              />
              <CodeBlock
                title="Вопрос · А здесь?"
                code={"x = 10\n\nif x < 5:\n    print(\"A\")"}
                output="(пусто — условие ложно)"
              />
            </div>
          </div>
        </section>

        {/* Раздел 4: if + else */}
        <section className="scroll-mt-20" aria-label="Раздел 4">
          <SectionHeading
            num={4}
            id="s4"
            title="if + else: две ветки"
            duration="15 минут"
            lead="Конструкция else («иначе») описывает вторую ветку — она выполняется во всех остальных случаях. Одна из двух веток сработает обязательно."
          />
          <div className="space-y-5">
            <CodeBlock
              title="Пример · Проверка возраста"
              code={
                "age = int(input())\n\nif age >= 18:\n    print(\"Совершеннолетний\")\nelse:\n    print(\"Несовершеннолетний\")"
              }
              output="ввод 16 → Несовершеннолетний; ввод 20 → Совершеннолетний"
            />
            <Callout icon={<AlertTriangle className="h-4 w-4" />} title="А что будет с нулём?">
              <p>
                Ноль не больше нуля, поэтому условие <code>n &gt; 0</code> ложно — программа
                ответит «Не положительное». Формально это верно, но ноль и не отрицателен!
                Будьте внимательны к границам: на ЕГЭ проверяют именно аккуратность условий.
              </p>
            </Callout>
          </div>
        </section>

        {/* Раздел 5: elif */}
        <section className="scroll-mt-20" aria-label="Раздел 5">
          <SectionHeading
            num={5}
            id="s5"
            title="elif: несколько вариантов"
            duration="10 минут"
            lead="Когда вариантов больше двух, между if и else ставят elif — «иначе, если». Программа проверяет условия сверху вниз и выполняет первую подошедшую ветку."
          />
          <div className="space-y-5">
            <CodeBlock
              title="Пример · Оценка за тест"
              code={
                "score = int(input())\n\nif score >= 90:\n    print(\"Отлично\")\nelif score >= 70:\n    print(\"Хорошо\")\nelse:\n    print(\"Нужно повторить\")"
              }
              output="ввод 84 → Хорошо; ввод 95 → Отлично; ввод 40 → Нужно повторить"
            />
            <Callout icon={<Lightbulb className="h-4 w-4" />} title="Порядок важен">
              <p>
                Python выполняет только первую подошедшую ветку. Ставьте сначала более строгие
                условия: если написать <code>score &gt;= 70</code> раньше{" "}
                <code>score &gt;= 90</code>, то даже 95 получит «Хорошо» — до «Отлично» очередь
                не дойдёт.
              </p>
            </Callout>
          </div>
        </section>

        {/* Раздел 6: чётность */}
        <section className="scroll-mt-20" aria-label="Раздел 6">
          <SectionHeading
            num={6}
            id="s6"
            title="Чётность числа"
            duration="10 минут"
            lead="Соединяем остаток из первого урока с условиями: у чётного числа остаток от деления на 2 равен нулю."
          />
          <div className="space-y-5">
            <CodeBlock
              title="Пример · Остатки"
              code={"print(4 % 2)    # 0 — чётное\nprint(7 % 2)    # 1 — нечётное"}
              output={"0\n1"}
            />
            <Callout icon={<GraduationCap className="h-4 w-4" />} title="Важно для ЕГЭ">
              <p>
                Проверка <code>n % 2 == 0</code> — конструкция №1 в задачах на последовательности,
                суммы и подсчёт. Родня ей проверка последней цифры: <code>n % 10</code> — это
                последняя цифра числа.
              </p>
            </Callout>
          </div>
        </section>

        {/* Раздел 7: логические операции */}
        <section className="scroll-mt-20" aria-label="Раздел 7">
          <SectionHeading
            num={7}
            id="s7"
            title="Логические операции"
            duration="10 минут"
            lead="and, or и not — собираем сложные условия из простых: and истинна, когда оба условия истинны; or — когда хотя бы одно; not меняет результат на противоположный."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <CodeBlock
              title="Пример · and"
              code={
                "age = 20\n\nif age >= 18 and age <= 30:\n    print(\"Подходит\")\nelse:\n    print(\"Не подходит\")"
              }
              output="Подходит"
            />
            <CodeBlock
              title="Пример · or"
              code={
                "day = int(input())\n\nif day == 6 or day == 7:\n    print(\"Выходной\")\nelse:\n    print(\"Рабочий день\")"
              }
              output="ввод 7 → Выходной; ввод 3 → Рабочий день"
            />
          </div>
        </section>

        {/* Раздел 8: задачи ЕГЭ */}
        <section className="scroll-mt-20" aria-label="Раздел 8">
          <SectionHeading
            num={8}
            id="s8"
            title="Практика в стиле ЕГЭ"
            duration="15 минут"
            lead="От простых проверок — к экзаменационному мышлению: условие не просто печатает ответ, а изменяет данные. У каждой задачи — автопроверка по тестам."
          />
          <TaskTabs
            tasks={EXAM_TASKS_L2}
            withSolution
            stdinHint="Для задач с двумя числами нужны две строки ввода."
          />
        </section>

        {/* Раздел 9: самостоятельная работа */}
        <section className="scroll-mt-20" aria-label="Раздел 9">
          <SectionHeading
            num={9}
            id="s9"
            title="Самостоятельная работа"
            duration="10 минут"
            lead="Шесть задач без подсказок. Решайте сами — автопроверка сразу скажет, верно ли."
          />
          <TaskTabs
            tasks={SELF_TASKS_L2}
            noHint
            stdinHint="Каждая строка поля ввода — один input()."
          />
        </section>

        {/* Домашнее задание */}
        <Homework
          blocks={HOMEWORK_BLOCKS_L2}
          lead="Три блока — от базовых проверок к задаче на мышление. Решайте в любой среде или прямо здесь: у задач из разделов 8–9 есть автопроверка."
          calloutTitle="Подсказка к палиндрому"
          calloutText={
            <p>
              Первая цифра трёхзначного числа — это <code>n // 100</code>, последняя —{" "}
              <code>n % 10</code>. Палиндром определяется сравнением первой и последней цифр.
              Идеальное решение не обязательно: если ответ верный для трёхзначных чисел —
              засчитано. Разбор — на следующем занятии: это мостик к теме «цифры числа».
            </p>
          }
          wordProps={{
            blocks: HOMEWORK_BLOCKS_L2,
            hint: HOMEWORK_HINT_L2,
            fileName: HOMEWORK_FILE_NAME_L2,
            subtitle: "Python — Урок 2 · Условия и логика · Подготовка к ЕГЭ по информатике",
          }}
        />

        {/* Итоги урока */}
        <Checklist
          skills={SKILLS_L2}
          closingNote="И главное — уметь написать программу по схеме «ввод → условие → действие → вывод» без копирования готового решения. Тогда урок 2 пройден не зря."
          nextLabel="Следующий урок"
          nextTitle="Циклы for и while"
          nextText="Программы научатся повторять действия: перебор чисел, подсчёт суммы, поиск максимума — первые полноценные алгоритмические задачи ЕГЭ."
          nextBadge="Урок 3"
        />

        <footer className="border-t border-stone-200 pt-6 text-center text-[13px] text-stone-500">
          <p>
            Урок 2 · Условия и логика ·{" "}
            <a href="/" className="font-medium text-blue-700 underline">
              ← Урок 1: Знакомство с Python
            </a>
          </p>
          <p className="mt-1">
            Код выполняется прямо в браузере (Pyodide / WebAssembly). Прогресс хранится локально.
          </p>
        </footer>
      </main>
    </div>
  );
}
