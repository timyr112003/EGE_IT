"use client";

/*
 * Прогресс урока: какие задачи с автопроверкой уже решены.
 * Хранится в localStorage, подписка через useSyncExternalStore.
 * Данные подгружаются после монтирования, чтобы избежать
 * hydration mismatch (SSR всегда рендерит пустой прогресс).
 *
 * Поддержка нескольких уроков: у каждого урока свой ключ
 * в localStorage; ключ задачи определяется по префиксу id
 * (задачи урока 2 начинаются с «l2-»).
 */

import { useEffect, useState, useSyncExternalStore } from "react";

export const TOTAL_CHECKED_TASKS = 9; // урок 1: 4 задачи ЕГЭ + 5 самостоятельных
export const TOTAL_CHECKED_TASKS_L2 = 9; // урок 2: 3 задачи ЕГЭ + 6 самостоятельных

const KEY_L1 = "python-lesson-1-progress";
const KEY_L2 = "python-lesson-2-progress";

const EMPTY: string[] = [];

interface ProgressStore {
  key: string;
  solved: string[];
  listeners: Set<() => void>;
}

const stores = new Map<string, ProgressStore>();

function getStore(key: string): ProgressStore {
  let st = stores.get(key);
  if (!st) {
    st = { key, solved: EMPTY, listeners: new Set() };
    stores.set(key, st);
  }
  return st;
}

/** Ключ хранилища по id задачи (префикс «l2-» → урок 2). */
export function keyForTask(taskId: string): string {
  return taskId.startsWith("l2-") ? KEY_L2 : KEY_L1;
}

function load(st: ProgressStore): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(st.key);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : EMPTY;
  } catch {
    return EMPTY;
  }
}

function persist(st: ProgressStore) {
  try {
    window.localStorage.setItem(st.key, JSON.stringify(st.solved));
  } catch {
    /* приватный режим — просто не сохраняем */
  }
}

function emit(st: ProgressStore) {
  st.listeners.forEach((l) => l());
}

export function markSolved(taskId: string) {
  const st = getStore(keyForTask(taskId));
  if (st.solved.includes(taskId)) return;
  st.solved = [...st.solved, taskId];
  persist(st);
  emit(st);
}

function makeSubscribe(st: ProgressStore) {
  return (listener: () => void): (() => void) => {
    st.listeners.add(listener);
    return () => st.listeners.delete(listener);
  };
}

export function useLessonProgress(storageKey: string = KEY_L1): { solved: string[]; count: number } {
  const st = getStore(storageKey);
  const subscribe = makeSubscribe(st);
  const list = useSyncExternalStore(
    subscribe,
    () => st.solved,
    () => EMPTY,
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Загружаем сохранённый прогресс только после гидрации
    const stored = load(st);
    if (stored.length > 0) {
      st.solved = stored;
      emit(st);
    }
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return mounted ? { solved: list, count: list.length } : { solved: EMPTY, count: 0 };
}
