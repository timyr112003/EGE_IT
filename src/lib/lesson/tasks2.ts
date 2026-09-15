/*
 * Урок 2 «Условия и логика» — задачи с автопроверкой.
 * Префикс id «l2-» обязателен: по нему markSolved определяет,
 * в какой ключ localStorage записывать прогресс.
 */

import type { LessonTask } from "./tasks";

export const EXAM_TASKS_L2: LessonTask[] = [
  {
    id: "l2-exam-1",
    shortTitle: "Плюс один",
    statement:
      "Вводится число. Если оно положительное — увеличьте его на 1, иначе оставьте без изменений. Выведите результат.",
    hint: "Команда print(n) должна стоять без отступа — она общая для обеих веток и выполняется всегда.",
    solution: "n = int(input())\n\nif n > 0:\n    n = n + 1\n\nprint(n)",
    starterCode: "# Если число положительное — увеличьте его на 1\n\n",
    tests: [
      { stdin: "5", expected: "6" },
      { stdin: "-2", expected: "-2" },
      { stdin: "0", expected: "0" },
    ],
  },
  {
    id: "l2-exam-2",
    shortTitle: "Половина или утроение",
    statement:
      "Вводится число. Если оно чётное — разделите его на 2, иначе умножьте на 3. Выведите результат.",
    hint: "Чётность проверяется через n % 2 == 0, а деление пополам делайте целочисленным: n // 2.",
    solution:
      "n = int(input())\n\nif n % 2 == 0:\n    n = n // 2\nelse:\n    n = n * 3\n\nprint(n)",
    starterCode: "# Чётное — пополам (//2), нечётное — умножить на 3\n\n",
    tests: [
      { stdin: "8", expected: "4" },
      { stdin: "7", expected: "21" },
      { stdin: "10", expected: "5" },
    ],
  },
  {
    id: "l2-exam-3",
    shortTitle: "Наибольшее из двух",
    statement: "Вводятся два числа (каждое на своей строке). Выведите большее из них.",
    hint: "Сравните a и b: если a больше — печатайте a, иначе печатайте b.",
    solution:
      "a = int(input())\nb = int(input())\n\nif a > b:\n    print(a)\nelse:\n    print(b)",
    starterCode: "# Выведите большее из двух чисел\n\n",
    tests: [
      { stdin: "7\n9", expected: "9" },
      { stdin: "4\n11", expected: "11" },
      { stdin: "5\n5", expected: "5" },
    ],
  },
];

export const SELF_TASKS_L2: LessonTask[] = [
  {
    id: "l2-self-1",
    shortTitle: "Положительное?",
    statement:
      "Вводится число. Выведите «Да», если оно положительное, и «Нет» в остальных случаях.",
    starterCode: "",
    tests: [
      { stdin: "5", expected: "Да" },
      { stdin: "-5", expected: "Нет" },
    ],
  },
  {
    id: "l2-self-2",
    shortTitle: "Отрицательное?",
    statement:
      "Вводится число. Выведите «Да», если оно отрицательное, и «Нет» в остальных случаях.",
    starterCode: "",
    tests: [
      { stdin: "-3", expected: "Да" },
      { stdin: "4", expected: "Нет" },
    ],
  },
  {
    id: "l2-self-3",
    shortTitle: "Чётное?",
    statement: "Вводится число. Выведите «Да», если оно чётное, и «Нет» в остальных случаях.",
    starterCode: "",
    tests: [
      { stdin: "10", expected: "Да" },
      { stdin: "11", expected: "Нет" },
    ],
  },
  {
    id: "l2-self-4",
    shortTitle: "Меньшее из двух",
    statement: "Вводятся два числа (каждое на своей строке). Выведите меньшее из них.",
    starterCode: "",
    tests: [
      { stdin: "4\n11", expected: "4" },
      { stdin: "8\n2", expected: "2" },
    ],
  },
  {
    id: "l2-self-5",
    shortTitle: "Возраст и категория",
    statement:
      "Вводится возраст. Меньше 7 — выведите «Дошкольник», от 7 до 17 — «Школьник», 18 и больше — «Взрослый».",
    starterCode: "",
    tests: [
      { stdin: "12", expected: "Школьник" },
      { stdin: "6", expected: "Дошкольник" },
      { stdin: "30", expected: "Взрослый" },
    ],
  },
  {
    id: "l2-self-6",
    shortTitle: "Три случая",
    statement:
      "Вводятся два числа. Если первое больше второго — выведите «Первое». Если второе больше — «Второе». Если равны — «Равны».",
    starterCode: "",
    tests: [
      { stdin: "5\n5", expected: "Равны" },
      { stdin: "7\n3", expected: "Первое" },
      { stdin: "3\n7", expected: "Второе" },
    ],
  },
];
