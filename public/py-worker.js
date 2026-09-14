/*
 * Python Web Worker (vanilla JS, собирается без бандлера).
 * Загружает Pyodide через importScripts и выполняет пользовательский код
 * в изолированном пространстве имён.
 *
 * Протокол:
 *  main -> worker : { type: 'run', id, code, stdin }
 *                   { type: 'preload' }
 *  worker -> main : { type: 'ready' }
 *                   { type: 'stdout', id, text, echo? }
 *                   { type: 'stderr', id, text }
 *                   { type: 'sys', id, text }
 *                   { type: 'done', id }
 *                   { type: 'error', id, message }
 */

/* eslint-disable */
var pyodide = null;
var loadPromise = null;
var busy = false;
var pending = [];
var MAX_OUTPUT_CHARS = 100000;

function post(msg) {
  self.postMessage(msg);
}

function load() {
  if (pyodide) return Promise.resolve(pyodide);
  if (!loadPromise) {
    loadPromise = new Promise(function (resolve, reject) {
      try {
        importScripts("/pyodide/pyodide.js");
      } catch (e) {
        reject(new Error("Не удалось загрузить Pyodide: " + e.message));
        return;
      }
      if (typeof loadPyodide !== "function") {
        reject(new Error("loadPyodide не найден после загрузки pyodide.js"));
        return;
      }
      loadPyodide({ indexURL: "/pyodide/" })
        .then(function (py) {
          // Изоляция запусков: каждый exec получает чистое пространство имён,
          // чтобы переменные из прошлых программ не «перетекали» в новые.
          py.runPython(
            'import builtins\n\n' +
            'def _run_user_code(code):\n' +
            '    g = {"__name__": "__main__", "__builtins__": builtins}\n' +
            '    exec(compile(code, "программа.py", "exec"), g)\n'
          );
          pyodide = py;
          post({ type: "ready" });
          resolve(py);
        })
        .catch(reject);
    });
  }
  return loadPromise;
}

function runTask(task) {
  var id = task.id;
  var code = task.code;
  var stdin = task.stdin;
  return load()
    .then(function (py) {
      var outChars = 0;
      var truncated = false;
      var lines = stdin.split("\n");

      py.setStdout({
        batched: function (s) {
          if (outChars >= MAX_OUTPUT_CHARS) {
            if (!truncated) {
              truncated = true;
              post({
                type: "sys",
                id: id,
                text: "— вывод обрезан: программа напечатала слишком много текста —",
              });
            }
            return;
          }
          outChars += s.length + 1;
          post({ type: "stdout", id: id, text: s + "\n" });
        },
      });

      py.setStderr({
        batched: function (s) {
          if (outChars >= MAX_OUTPUT_CHARS) return;
          outChars += s.length + 1;
          post({ type: "stderr", id: id, text: s + "\n" });
        },
      });

      py.setStdin({
        stdin: function () {
          if (lines.length === 0) return ""; // EOF -> Python бросит EOFError
          var line = lines.shift();
          // Эхо ввода: показываем в консоли, как при печати с клавиатуры
          post({ type: "stdout", id: id, text: line + "\n", echo: true });
          return line + "\n";
        },
      });

      var runFn = py.globals.get("_run_user_code");
      try {
        runFn(code);
        post({ type: "done", id: id });
      } finally {
        if (runFn && runFn.destroy) runFn.destroy();
      }
    })
    .catch(function (err) {
      var message = err && err.message ? String(err.message) : String(err);
      post({ type: "error", id: id, message: message });
    });
}

function pump() {
  if (busy) return;
  busy = true;
  var next = function () {
    if (pending.length === 0) {
      busy = false;
      return;
    }
    var task = pending.shift();
    var p;
    if (task.type === "run") {
      p = runTask(task);
    } else if (task.type === "preload") {
      p = load();
    } else {
      p = Promise.resolve();
    }
    p.then(next, next);
  };
  next();
}

self.onmessage = function (e) {
  pending.push(e.data);
  pump();
};
