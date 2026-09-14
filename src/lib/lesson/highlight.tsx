import type { ReactNode } from "react";

/*
 * Лёгкая подсветка синтаксиса Python (без внешних зависимостей).
 * Цвета согласованы с темой oneDark в редакторе.
 */

const PATTERN = new RegExp(
  [
    "(#[^\\n]*)", // 1 комментарий
    "(\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?''')", // 2 тройные строки
    "(\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*')", // 3 строки
    "\\b(\\d+(?:\\.\\d+)?)\\b", // 4 числа
    "\\b(print|input|int|float|str|len|range|abs|round|max|min|sum|type|bool)\\b", // 5 встроенные функции
    "\\b(if|elif|else|while|for|in|def|return|import|from|and|or|not|True|False|None|break|continue|pass|is)\\b", // 6 ключевые слова
  ].join("|"),
  "g",
);

const COLORS = {
  plain: "#abb2bf",
  comment: "#7f848e",
  string: "#98c379",
  number: "#d19a66",
  builtin: "#61afef",
  keyword: "#c678dd",
};

export function tokenizePython(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  const push = (text: string, color?: string) => {
    if (!text) return;
    nodes.push(
      color ? (
        <span key={key++} style={{ color }}>
          {text}
        </span>
      ) : (
        <span key={key++}>{text}</span>
      ),
    );
  };

  PATTERN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PATTERN.exec(code)) !== null) {
    push(code.slice(lastIndex, m.index));
    const [full, comment, triple, str, num, builtin, keyword] = m;
    if (comment) push(full, COLORS.comment);
    else if (triple || str) push(full, COLORS.string);
    else if (num) push(full, COLORS.number);
    else if (builtin) push(full, COLORS.builtin);
    else if (keyword) push(full, COLORS.keyword);
    else push(full);
    lastIndex = m.index + full.length;
  }
  push(code.slice(lastIndex));
  return nodes;
}
