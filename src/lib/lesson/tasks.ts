"use client";

/*
 * Типы задач урока и данные разделов «Задачи в стиле ЕГЭ»
 * и «Самостоятельная работа».
 */

export interface TestCase {
  stdin: string;
  expected: string;
}

export interface LessonTask {
  id: string;
  shortTitle: string;
  statement: string;
  /** Текстовая подсказка (для задач с подсказками) */
  hint?: string;
  /** Готовое решение (показывается в спойлере) */
  solution?: string;
  starterCode: string;
  initialStdin?: string;
  tests?: TestCase[];
}

export const EXAM_TASKS: LessonTask[] = [
  {
    id: "exam-1",
    shortTitle: "Сумма чисел",
    statement:
      "Пользователь вводит два числа (каждое на своей строке). Выведите их сумму.",
    hint: "Считайте каждое число отдельным input() и не забудьте превратить текст в число: int(input()).",
    solution: "a = int(input())\nb = int(input())\n\nprint(a + b)",
    starterCode: "# Считайте два числа и выведите их сумму\n\n",
    tests: [
      { stdin: "5\n10", expected: "15" },
      { stdin: "3\n4", expected: "7" },
    ],
  },
  {
    id: "exam-2",
    shortTitle: "Площадь прямоугольника",
    statement:
      "Вводится длина и ширина прямоугольника (каждое число на своей строке). Найдите его площадь.",
    hint: "Площадь = длина × ширина. Операция умножения в Python — звёздочка *.",
    solution: "a = int(input())\nb = int(input())\n\nprint(a * b)",
    starterCode: "# Введите длину и ширину, выведите площадь\n\n",
    tests: [
      { stdin: "4\n5", expected: "20" },
      { stdin: "7\n3", expected: "21" },
    ],
  },
  {
    id: "exam-3",
    shortTitle: "Полные часы",
    statement:
      "Вводится количество минут. Сколько это полных часов? (Неполный час отбрасывается.)",
    hint: "Полных часов — это целочисленное деление: minutes // 60.",
    solution: "minutes = int(input())\n\nprint(minutes // 60)",
    starterCode: "# Выведите количество полных часов\n\n",
    tests: [
      { stdin: "130", expected: "2" },
      { stdin: "120", expected: "2" },
      { stdin: "59", expected: "0" },
    ],
  },
  {
    id: "exam-4",
    shortTitle: "Остаток минут",
    statement:
      "Вводится количество минут. Сколько минут останется после выделения полных часов?",
    hint: "Остаток от деления на 60 — это операция %: minutes % 60.",
    solution: "minutes = int(input())\n\nprint(minutes % 60)",
    starterCode: "# Выведите остаток минут после выделения полных часов\n\n",
    tests: [
      { stdin: "130", expected: "10" },
      { stdin: "59", expected: "59" },
      { stdin: "120", expected: "0" },
    ],
  },
];

export const SELF_TASKS: LessonTask[] = [
  {
    id: "self-1",
    shortTitle: "Квадрат числа",
    statement: "Вводится число. Выведите его квадрат.",
    starterCode: "# Введите число и выведите его квадрат\n\n",
    tests: [
      { stdin: "5", expected: "25" },
      { stdin: "-3", expected: "9" },
    ],
  },
  {
    id: "self-2",
    shortTitle: "Три действия",
    statement:
      "Вводятся два числа. Выведите их сумму, разность и произведение — каждое на своей строке.",
    starterCode: "# Выведите сумму, разность и произведение двух чисел\n\n",
    tests: [
      { stdin: "8\n3", expected: "11\n5\n24" },
      { stdin: "10\n2", expected: "12\n8\n20" },
    ],
  },
  {
    id: "self-3",
    shortTitle: "Полные минуты",
    statement: "Вводится количество секунд. Выведите количество полных минут.",
    starterCode: "# Переведите секунды в полные минуты\n\n",
    tests: [
      { stdin: "125", expected: "2" },
      { stdin: "60", expected: "1" },
      { stdin: "59", expected: "0" },
    ],
  },
  {
    id: "self-4",
    shortTitle: "Остаток секунд",
    statement:
      "Вводится количество секунд. Выведите количество секунд, оставшихся после выделения полных минут.",
    starterCode: "# Выведите остаток секунд после выделения полных минут\n\n",
    tests: [
      { stdin: "125", expected: "5" },
      { stdin: "60", expected: "0" },
      { stdin: "59", expected: "59" },
    ],
  },
  {
    id: "self-5",
    shortTitle: "Стоимость покупки",
    statement:
      "В магазине товар стоит x рублей. Покупатель купил n товаров. Введите x и n и выведите стоимость всей покупки.",
    starterCode: "# Считайте цену товара и количество, выведите стоимость\n\n",
    tests: [
      { stdin: "150\n3", expected: "450" },
      { stdin: "99\n4", expected: "396" },
    ],
  },
];

/** Свободная практика раздела «Числа и арифметика» */
export const ARITHMETIC_STARTER = `# Выполняйте задания по порядку и запускайте программу:

# 1) Посчитайте сумму 27 и 15

# 2) Посчитайте произведение 12 и 8

# 3) Найдите остаток от деления 25 на 4

# 4) Найдите целую часть от деления 25 на 4

# 5) Возведите 3 в пятую степень

# Подсказка: каждая задача решается одной строкой
# вида print(...) с операцией + * // % **
`;

/** Практика раздела «Переменные» — часть 1 */
export const VARIABLES_STARTER_1 = `# Создайте переменные и выведите каждую на экран:
age = 16
height = 175
name = "Alex"

print(age)
print(height)
print(name)

# Попробуйте поменять значения и запустить снова
`;

/** Практика раздела «Переменные» — часть 2 */
export const VARIABLES_STARTER_2 = `a = 10
b = 20

# Выведите a + b, затем a * b, затем b - a:

`;
