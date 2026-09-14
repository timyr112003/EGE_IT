"use client";

import { useEffect } from "react";
import { Users } from "lucide-react";
import { initCollab, useCollab } from "@/lib/collab/store";
import { CollabPanel } from "./collab-panel";

export function CollabButton() {
  const connected = useCollab((s) => s.connected);
  const joined = useCollab((s) => s.joined);
  const users = useCollab((s) => s.users);
  const unread = useCollab((s) => s.unread);
  const setPanelOpen = useCollab((s) => s.setPanelOpen);

  // открываем соединение сразу при загрузке страницы
  useEffect(() => {
    initCollab();
  }, []);

  const online = joined ? Math.max(users.length, 1) : 0;

  return (
    <>
      <button
        onClick={() => setPanelOpen(true)}
        className="group relative flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-stone-700 shadow-sm transition-all hover:border-stone-400 hover:shadow"
        title="Совместная работа: чат, синхронизация кода, ведение урока"
        aria-label="Открыть панель совместной работы"
      >
        <Users className="h-4 w-4 text-stone-500 transition-colors group-hover:text-stone-700" />
        <span className="hidden md:inline">Вместе</span>
        {joined && online > 0 && (
          <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold leading-none text-white">
            {online}
          </span>
        )}
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#f8f7f4]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
        <span
          className={`absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full transition-colors ${
            connected ? (joined ? "bg-emerald-400" : "bg-amber-400") : "bg-transparent"
          }`}
          aria-hidden
        />
      </button>
      <CollabPanel />
    </>
  );
}
