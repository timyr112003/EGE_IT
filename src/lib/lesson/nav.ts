/*
 * Оглавление урока — единый источник для шапки и совместной работы
 * (подписи разделов в уведомлениях «ведёт урок»).
 */

export interface NavItem {
  id: string;
  label: string;
}

export const NAV: NavItem[] = [
  { id: "s1", label: "Что такое Python" },
  { id: "s2", label: "Арифметика" },
  { id: "s3", label: "Переменные и стиль" },
  { id: "s3b", label: "Строки и str()" },
  { id: "s4", label: "Ввод данных" },
  { id: "s5", label: "Числа и ошибки" },
  { id: "s6", label: "Задачи ЕГЭ" },
  { id: "s7", label: "Самостоятельная" },
  { id: "homework", label: "Домашка" },
];
