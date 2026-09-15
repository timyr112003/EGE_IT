"use client";

/*
 * Реестр решений домашнего задания для панели сдачи учителю.
 * HomeworkInteractive регистрирует каждую задачу (код, ввод, отметка
 * «решено»), панель сдачи читает все записи одним вызовом.
 *
 * Хранилище модульное (живёт, пока открыта страница): данные ДЗ
 * дублируются в localStorage через persistKey редакторов, а отметки
 * «решено» — отдельно, поэтому после перезагрузки страницы всё
 * восстанавливается.
 */

export interface HwEntry {
  /** Номер задачи для учителя: «1.1», «4.2»… */
  num: string;
  title: string;
  code: string;
  stdin: string;
  solved: boolean;
}

type Key = string; // `${prefix}|${blockIndex}|${taskIndex}`

const entries = new Map<Key, HwEntry>();
const listeners = new Set<() => void>();
let version = 0;

function keyOf(prefix: string, b: number, t: number): Key {
  return `${prefix}|${b}|${t}`;
}

function emit() {
  version++;
  listeners.forEach((l) => l());
}

/** Создать запись, если её ещё нет (при монтировании карточки). */
export function hwEnsure(
  prefix: string,
  b: number,
  t: number,
  init: { num: string; title: string; code: string; stdin: string },
) {
  const k = keyOf(prefix, b, t);
  if (!entries.has(k)) {
    entries.set(k, { ...init, solved: false });
    emit();
  }
}

/** Обновить запись (код, ввод, отметка решённости). */
export function hwUpdate(
  prefix: string,
  b: number,
  t: number,
  patch: Partial<Omit<HwEntry, "num">> & { num?: string },
) {
  const k = keyOf(prefix, b, t);
  const cur = entries.get(k);
  entries.set(k, { num: "", title: "", code: "", stdin: "", solved: false, ...cur, ...patch });
  emit();
}

/** Удалить записи префикса (при размонтировании секции ДЗ). */
export function hwClear(prefix: string) {
  let changed = false;
  for (const k of entries.keys()) {
    if (k.startsWith(`${prefix}|`)) {
      entries.delete(k);
      changed = true;
    }
  }
  if (changed) emit();
}

/** Все записи префикса — в порядке регистрации. */
export function hwEntries(prefix: string): HwEntry[] {
  return [...entries.entries()]
    .filter(([k]) => k.startsWith(`${prefix}|`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, v]) => v);
}

/** Одна запись по индексам блока и задачи. */
export function hwGet(prefix: string, b: number, t: number): HwEntry | undefined {
  return entries.get(keyOf(prefix, b, t));
}

/** Сколько задач заполнено (код отличается от шаблона) или отмечено решёнными. */
export function hwFilledCount(prefix: string, starters: string[]): number {
  const list = hwEntries(prefix);
  return list.filter((e, i) => {
    const starter = starters[i] ?? "";
    return e.solved || (e.code.trim().length > 0 && e.code !== starter);
  }).length;
}

/** Версия хранилища — для useSyncExternalStore. */
export function getHwVersion(): number {
  return version;
}

export function subscribeHw(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
