/*
 * Понятные объяснения частых ошибок Python для новичка.
 * Возвращаем заголовок + совет по последней строке traceback.
 */

export interface ErrorExplanation {
  title: string;
  advice: string;
}

interface HintRule {
  pattern: RegExp;
  build: (match: RegExpMatchArray) => ErrorExplanation;
}

const RULES: HintRule[] = [
  {
    pattern: /EOFError:\s*EOF when reading a line/,
    build: () => ({
      title: "Программа запросила ввод, но строки закончились",
      advice:
        "Программа вызвала input(), а в поле «Ввод данных» больше нет строк. Добавьте ещё одну строку — каждая строка в этом поле является ответом на один input().",
    }),
  },
  {
    pattern: /NameError:\s*name\s+'(.+?)'\s+is not defined/,
    build: (m) => ({
      title: `Имя «${m[1]}» не определено`,
      advice:
        "Python не нашёл переменную с таким именем. Проверьте, нет ли опечатки, и помните: переменную нужно создать до того, как вы её используете, например " +
        `${m[1]} = ...`,
    }),
  },
  {
    pattern: /SyntaxError/,
    build: () => ({
      title: "Синтаксическая ошибка",
      advice:
        "Python не смог разобрать инструкцию. Чаще всего забывают закрыть скобку или кавычку, ставят = вместо == или пропускают двоеточие в конце строки. Посмотрите на строку, указанную в traceback выше.",
    }),
  },
  {
    pattern:
      /TypeError:\s*can only concatenate str\s*\(not\s+"(\w+)"\)\s+to str/,
    build: (m) => ({
      title: "Нельзя складывать текст и число",
      advice: `Вы пытаетесь применить + к строке и к ${m[1]}. Либо приведите число к тексту — str(x), либо читайте ввод как число — int(input()).`,
    }),
  },
  {
    pattern: /ValueError:\s*invalid literal for int\(\)/,
    build: () => ({
      title: "int() получил не число",
      advice:
        "Функция int() умеет превращать в целое число только строки вида «42». Проверьте, что в поле ввода вы указали именно целое число, без букв и пробелов.",
    }),
  },
  {
    pattern: /ZeroDivisionError/,
    build: () => ({
      title: "Деление на ноль",
      advice:
        "Делить на ноль нельзя — это правило работает и в математике, и в Python. Проверьте значение делителя перед делением.",
    }),
  },
  {
    pattern: /IndentationError|Unexpected indent/,
    build: () => ({
      title: "Ошибка отступов",
      advice:
        "Python чувствителен к пробелам в начале строки. В простых программах отступы в начале строки не нужны — уберите лишние пробелы слева.",
    }),
  },
];

export function explainError(traceback: string): ErrorExplanation | null {
  for (const rule of RULES) {
    const match = traceback.match(rule.pattern);
    if (match) return rule.build(match);
  }
  return null;
}

/** Последняя значимая строка traceback — краткое описание ошибки. */
export function errorSummary(traceback: string): string {
  const lines = traceback
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines[lines.length - 1] ?? "Неизвестная ошибка";
}
