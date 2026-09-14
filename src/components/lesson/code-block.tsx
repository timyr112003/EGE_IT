"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { tokenizePython } from "@/lib/lesson/highlight";

interface CodeBlockProps {
  code: string;
  /** Подпись в шапке «окна», по умолчанию «Python» */
  title?: string;
  /** Ожидаемый вывод программы — показывается под кодом */
  output?: string;
  className?: string;
}

export function CodeBlock({ code, title = "Python", output, className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-stone-800 shadow-md ${className}`}>
      <div className="flex items-center justify-between bg-[#21252b] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 hidden items-center gap-1.5 text-xs text-stone-400 sm:flex">
            <Terminal className="h-3.5 w-3.5" />
            {title}
          </span>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-stone-400 transition-colors hover:bg-white/10 hover:text-stone-200"
          aria-label="Скопировать код"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Скопировано</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Копировать
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[#282c34] p-4 text-[13.5px] leading-relaxed thin-scroll dark-scroll">
        <code className="font-mono">{tokenizePython(code)}</code>
      </pre>
      {output !== undefined && (
        <div className="border-t border-stone-700/60 bg-[#1b1e23] px-4 py-3">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-stone-500">
            Вывод
          </p>
          <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-emerald-300/90">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
