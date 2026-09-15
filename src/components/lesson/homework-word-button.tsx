"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";
import {
  HOMEWORK_BLOCKS,
  HOMEWORK_HINT,
  HOMEWORK_FILE_NAME,
  type HomeworkBlock,
} from "@/lib/lesson/homework-data";

interface HomeworkWordButtonProps {
  blocks?: HomeworkBlock[];
  hint?: string;
  fileName?: string;
  /** Подзаголовок под шапкой документа */
  subtitle?: string;
}

/*
 * Кнопка «Скачать ДЗ (Word)» — собирает настоящий .docx
 * (Times New Roman, A4, поля 2/3 см) прямо в браузере.
 */

function tr(
  text: string,
  opts?: { bold?: boolean; italics?: boolean; size?: number; color?: string }
) {
  return new TextRun({
    text,
    font: "Times New Roman",
    size: opts?.size ?? 28, // 14pt в полупунктах
    bold: opts?.bold ?? false,
    italics: opts?.italics ?? false,
    color: opts?.color,
  });
}

function para(children: TextRun[], opts?: { center?: boolean; before?: number; after?: number }) {
  return new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: opts?.before ?? 0, after: opts?.after ?? 120, line: 276 },
    children,
  });
}

export function HomeworkWordButton({
  blocks = HOMEWORK_BLOCKS,
  hint = HOMEWORK_HINT,
  fileName = HOMEWORK_FILE_NAME,
  subtitle = "Python — Урок 1 · Подготовка к ЕГЭ по информатике",
}: HomeworkWordButtonProps) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const children: Paragraph[] = [
        para([tr("Домашнее задание", { bold: true, size: 36 })], { center: true, after: 60 }),
        para(
          [tr(subtitle, { size: 24, color: "555555" })],
          { center: true, after: 240 }
        ),
        para([
          tr("Ученик: ______________________     Класс: ________     Дата: ____________", {
            size: 24,
          }),
        ], { after: 240 }),
      ];

      blocks.forEach((block, bi) => {
        children.push(
          para([tr(block.title, { bold: true, size: 28 })], { before: 200, after: 120 })
        );
        block.tasks.forEach((task, ti) => {
          children.push(
            para([tr(`${bi + 1}.${ti + 1}. `, { bold: true }), tr(task, { bold: true })], {
              before: 60,
              after: 40,
            })
          );
        });
      });

      children.push(
        para(
          [
            tr(
              "Как выполнять: программа читает данные через input() и печатает ответ через print(). Проверить решение можно на странице урока — редактор Python работает прямо в браузере.",
              { italics: true, size: 24, color: "555555" }
            ),
          ],
          { before: 240, after: 60 }
        ),
        para([tr("Подсказка: " + hint, { italics: true, size: 24, color: "555555" })], {
          after: 60,
        }),
        para([tr("Разбор решений и типичных ошибок — на следующем занятии.", { italics: true, size: 24, color: "555555" })], { after: 0 })
      );

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: 11906, height: 16838 }, // A4, твипы
                margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 },
              },
            },
            children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-[14px] font-bold text-stone-900 shadow-sm transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {busy ? "Готовлю файл…" : "Скачать ДЗ (Word)"}
    </button>
  );
}
