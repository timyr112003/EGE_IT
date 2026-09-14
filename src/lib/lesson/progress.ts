"use client";

/*
 * Прогресс урока: какие задачи с автопроверкой уже решены.
 * Хранится в localStorage, подписка через useSyncExternalStore.
 * Данные подгружаются после монтирования, чтобы избежать
 * hydration mismatch (SSR всегда рендерит пустой прогресс).
 */

import { useEffect, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "python-lesson-1-progress";

export const TOTAL_CHECKED_TASKS = 9; // 4 задачи ЕГЭ + 5 самостоятельных

const EMPTY: string[] = [];

let solved: string[] = EMPTY;
const listeners = new Set<() => void>();

function load(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : EMPTY;
  } catch {
    return EMPTY;
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
  } catch {
    /* приватный режим — просто не сохраняем */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function markSolved(taskId: string) {
  if (solved.includes(taskId)) return;
  solved = [...solved, taskId];
  persist();
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string[] {
  return solved;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

export function useLessonProgress(): { solved: string[]; count: number } {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Загружаем сохранённый прогресс только после гидрации
    const stored = load();
    if (stored.length > 0) {
      solved = stored;
      emit();
    }
    setMounted(true);
  }, []);
  return mounted ? { solved: list, count: list.length } : { solved: EMPTY, count: 0 };
}
