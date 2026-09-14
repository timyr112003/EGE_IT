"use client";

/*
 * Панель совместной работы: участники, приглашение по ссылке,
 * чат, общая доска заметок и переключатели режимов.
 */

import { useEffect, useRef, useState } from "react";
import {
  Users,
  Link2,
  Copy,
  Check,
  Send,
  StickyNote,
  MonitorPlay,
  Eye,
  Share2,
  Code2,
  WifiOff,
  LogIn,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollab, type ChatMsg } from "@/lib/collab/store";

function timeStr(ts: number): string {
  return new Date(ts).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatLine({ msg }: { msg: ChatMsg }) {
  if (msg.system) {
    return (
      <p className="px-1 py-0.5 text-center text-[11.5px] italic text-stone-400">{msg.text}</p>
    );
  }
  return (
    <div className="px-1">
      <p className="text-[11.5px] font-semibold" style={{ color: msg.color }}>
        {msg.name} <span className="font-normal text-stone-400">{timeStr(msg.ts)}</span>
      </p>
      <p className="break-words text-[13px] leading-snug text-stone-700">{msg.text}</p>
    </div>
  );
}

export function CollabPanel() {
  const s = useCollab();
  const [name, setName] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // подставляем сохранённое имя
  useEffect(() => {
    const saved = localStorage.getItem("collab-name");
    if (saved) setName(saved);
  }, []);

  // автоскролл чата
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [s.messages.length, s.panelOpen]);

  const join = () => {
    const n = name.trim();
    if (!n) return;
    localStorage.setItem("collab-name", n);
    s.join(n);
  };

  const copyInvite = async () => {
    const url = `${window.location.origin}/?room=${encodeURIComponent(s.room)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Sheet open={s.panelOpen} onOpenChange={s.setPanelOpen}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto thin-scroll sm:max-w-md">
        <SheetHeader className="pb-2 text-left">
          <SheetTitle className="flex items-center gap-2 pr-8 text-[16px]">
            <Users className="h-4.5 w-4.5 shrink-0 text-amber-500" />
            Совместная работа
            {s.joined ? (
              <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                онлайн: {Math.max(s.users.length, 1)}
              </span>
            ) : s.connected ? (
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                соединение есть
              </span>
            ) : (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                <WifiOff className="h-3 w-3" /> офлайн
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="text-[12.5px] leading-snug">
            Поделитесь ссылкой — другой человек откроет сайт, и вы сможете работать
            вместе: видеть код друг друга, общаться в чате и вести урок.
          </SheetDescription>
        </SheetHeader>

        {/* Вход */}
        {!s.joined ? (
          <div className="rounded-xl border border-amber-300/70 bg-amber-50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-amber-900">
              <LogIn className="h-4 w-4" />
              Представьтесь, чтобы присоединиться
            </p>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && join()}
                placeholder="Ваше имя"
                maxLength={24}
                className="bg-white"
              />
              <Button
                onClick={join}
                disabled={!name.trim() || !s.connected}
                className="shrink-0 bg-stone-900 text-amber-300 hover:bg-stone-800"
              >
                Войти
              </Button>
            </div>
            {!s.connected && (
              <p className="mt-2 text-[12px] text-amber-800">
                Устанавливаю соединение с сервером…
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Участники + приглашение */}
            <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {s.users.map((u) => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-stone-700 shadow-sm ring-1 ring-stone-200"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: u.color }}
                    />
                    {u.name}
                    {u.id === s.me?.id && (
                      <span className="text-[10.5px] font-normal text-stone-400">(вы)</span>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <code className="rounded-md bg-white px-2 py-1 font-mono text-[12px] text-stone-600 ring-1 ring-stone-200">
                  комната: {s.room}
                </code>
                <Button
                  onClick={copyInvite}
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1 gap-1.5 border-stone-300 text-[12.5px]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Ссылка скопирована
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3.5 w-3.5" /> <Copy className="h-3.5 w-3.5" />
                      Скопировать ссылку-приглашение
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Режимы */}
            <div className="mt-3 space-y-2.5 rounded-xl border border-stone-200 p-4">
              <p className="text-[12px] font-bold uppercase tracking-wider text-stone-400">
                Режимы
              </p>
              <label className="flex cursor-pointer items-start gap-3">
                <Switch checked={s.sharing} onCheckedChange={s.setSharing} className="mt-0.5" />
                <span className="flex items-start gap-2">
                  <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    <span className="block text-[13px] font-semibold text-stone-800">
                      Синхронизировать код
                    </span>
                    <span className="block text-[12px] leading-snug text-stone-500">
                      Участники видят код в ваших редакторах в реальном времени
                    </span>
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <Switch checked={s.leading} onCheckedChange={s.setLeading} className="mt-0.5" />
                <span className="flex items-start gap-2">
                  <MonitorPlay className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    <span className="block text-[13px] font-semibold text-stone-800">
                      Вести урок
                    </span>
                    <span className="block text-[12px] leading-snug text-stone-500">
                      Другие увидят, к какому разделу вы переходите
                    </span>
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <Switch checked={s.following} onCheckedChange={s.setFollowing} className="mt-0.5" />
                <span className="flex items-start gap-2">
                  <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>
                    <span className="block text-[13px] font-semibold text-stone-800">
                      Следовать за ведущим
                    </span>
                    <span className="block text-[12px] leading-snug text-stone-500">
                      Страница сама перейдёт к разделу, куда ведёт учитель
                    </span>
                  </span>
                </span>
              </label>
            </div>

            {/* Чат */}
            <div className="mt-3 flex min-h-[220px] flex-col rounded-xl border border-stone-200 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-stone-400">
                <Code2 className="h-3.5 w-3.5" /> Чат
              </p>
              <ScrollArea className="h-40 flex-1 pr-2">
                <div className="space-y-1.5">
                  {s.messages.length === 0 && (
                    <p className="py-6 text-center text-[12.5px] text-stone-400">
                      Сообщений пока нет — напишите первое
                    </p>
                  )}
                  {s.messages.map((m) => (
                    <ChatLine key={m.id} msg={m} />
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="mt-2 flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      s.sendChat(chatInput);
                      setChatInput("");
                    }
                  }}
                  placeholder="Сообщение…"
                  maxLength={500}
                />
                <Button
                  onClick={() => {
                    s.sendChat(chatInput);
                    setChatInput("");
                  }}
                  disabled={!chatInput.trim()}
                  size="icon"
                  className="h-9 w-9 shrink-0 bg-stone-900 text-amber-300 hover:bg-stone-800"
                  aria-label="Отправить"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Общая доска заметок */}
            <div className="mt-3 mb-6 rounded-xl border border-amber-300/60 bg-amber-50/60 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-amber-700">
                <StickyNote className="h-3.5 w-3.5" /> Общая доска заметок
              </p>
              <textarea
                ref={notesRef}
                value={s.notes}
                onChange={(e) => s.setNotes(e.target.value)}
                rows={5}
                placeholder="Записи видны всем участникам: план, вопросы, задания…"
                className="thin-scroll w-full resize-y rounded-lg border border-amber-200 bg-white p-2.5 text-[13px] leading-relaxed text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none"
              />
              <p className="mt-1.5 text-[11px] text-amber-700/80">
                Сохраняется на сервере и синхронизируется между участниками
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
