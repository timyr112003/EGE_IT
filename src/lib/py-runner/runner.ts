"use client";

/*
 * Менеджер выполнения Python-кода на главном потоке.
 * Держит единственный Web Worker, сериализует запуски и рассылает
 * события вывода (stdout/stderr) подписчикам конкретного запуска.
 */

import { useSyncExternalStore } from "react";

export type PyStatus = "idle" | "loading" | "ready" | "running";

export interface RunHandlers {
  onStdout?: (text: string, echo: boolean) => void;
  onStderr?: (text: string) => void;
  onSys?: (text: string) => void;
}

export interface RunResult {
  ok: boolean;
  error?: string; // полный traceback, если ошибка
}

interface RunEntry extends RunHandlers {
  resolve: (result: RunResult) => void;
}

class PyRunner {
  private worker: Worker | null = null;
  private loadPromise: Promise<Worker> | null = null;
  private runs = new Map<number, RunEntry>();
  private nextId = 1;
  private status: PyStatus = "idle";
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getStatus = (): PyStatus => this.status;

  private setStatus(s: PyStatus) {
    this.status = s;
    this.listeners.forEach((l) => l());
  }

  private ensureWorker(): Promise<Worker> {
    if (this.worker) return Promise.resolve(this.worker);
    if (this.loadPromise) return this.loadPromise;

    if (this.status === "idle") this.setStatus("loading");

    // Воркер — статический файл из /public (vanilla JS + importScripts),
    // чтобы не зависеть от особенностей сборки Turbopack.
    const worker = new Worker("/py-worker.js");

    worker.onmessage = (e: MessageEvent) => this.handleMessage(e.data);

    this.worker = worker;
    this.loadPromise = new Promise<Worker>((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data?.type === "ready") {
          worker.removeEventListener("message", handler);
          this.setStatus("ready");
          resolve(worker);
        }
      };
      worker.addEventListener("message", handler);
    });

    // Сразу запускаем загрузку Pyodide в воркере, иначе получим deadlock:
    // run() ждёт 'ready', а воркер ждёт первое сообщение.
    worker.postMessage({ type: "preload" });

    return this.loadPromise;
  }

  private handleMessage(msg: any) {
    const entry = this.runs.get(msg?.id);
    if (!entry) return;
    switch (msg.type) {
      case "stdout":
        entry.onStdout?.(msg.text as string, Boolean(msg.echo));
        break;
      case "stderr":
        entry.onStderr?.(msg.text as string);
        break;
      case "sys":
        entry.onSys?.(msg.text as string);
        break;
      case "done":
        this.runs.delete(msg.id);
        if (this.runs.size === 0) this.setStatus("ready");
        entry.resolve({ ok: true });
        break;
      case "error":
        this.runs.delete(msg.id);
        if (this.runs.size === 0) this.setStatus("ready");
        entry.resolve({ ok: false, error: String(msg.message ?? "Ошибка") });
        break;
    }
  }

  /** Прогреть Pyodide заранее (например, по клику «Начать урок»). */
  async preload(): Promise<void> {
    try {
      const worker = await this.ensureWorker();
      worker.postMessage({ type: "preload" });
    } catch {
      /* молча: статус останется loading, попробует снова при запуске */
    }
  }

  /** Запустить программу. Вызовы input() читают строки из stdin (по \n). */
  async run(code: string, stdin: string, handlers: RunHandlers = {}): Promise<RunResult> {
    let worker: Worker;
    try {
      worker = await this.ensureWorker();
    } catch (e) {
      return { ok: false, error: "Не удалось запустить Python в браузере." };
    }
    const id = this.nextId++;
    this.setStatus("running");
    return new Promise<RunResult>((resolve) => {
      this.runs.set(id, {
        ...handlers,
        resolve: (result) => {
          resolve(result);
        },
      });
      worker.postMessage({ type: "run", id, code, stdin });
    });
  }

  /** Аварийная остановка: терминируем воркер (например, бесконечный цикл). */
  stop(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.loadPromise = null;
    }
    // Разрешаем все висящие промисы
    for (const [, entry] of this.runs) {
      entry.resolve({ ok: false, error: "__INTERRUPTED__" });
    }
    this.runs.clear();
    this.setStatus("idle");
  }
}

export const pyRunner = new PyRunner();

/** Реактивный статус Python-движка для UI. */
export function usePyStatus(): PyStatus {
  return useSyncExternalStore(pyRunner.subscribe, pyRunner.getStatus, pyRunner.getStatus);
}
