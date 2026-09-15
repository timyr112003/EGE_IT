# Быстрая инструкция по развёртыванию на сервере (Ubuntu/Debian)

Полная версия инструкции — в файле `INSTRUKCIYA-server.pdf`.

## 1. Установить Bun

```bash
curl -fsSL https://bun.sh/install | bash
cp ~/.bun/bin/bun /usr/local/bin/bun
```

## 2. Скопировать проект в /opt/urok

Содержимое архива (urok-python-server.zip) — в папку /opt/urok:

```bash
apt update && apt install -y unzip
unzip urok-python-server.zip -d /opt/urok
cd /opt/urok
```

## 3. Собрать и запустить вручную (первая проверка)

```bash
cd /opt/urok
bun install
bunx prisma generate
bun run build
bun run start            # сайт, порт 3000 (Ctrl+C — остановить)

cd mini-services/collab-service
bun install              # однократно, для сервиса совместной работы
bun index.ts             # совместная работа, порт 3003 (Ctrl+C — остановить)
```

Откройте в браузере: http://IP-СЕРВЕРА:3000 — сайт должен работать.

## 4. Настроить автозапуск (Caddy + systemd)

```bash
apt install -y caddy
cp /opt/urok/deploy/Caddyfile /etc/caddy/Caddyfile
systemctl restart caddy

cp /opt/urok/deploy/urok-web.service /etc/systemd/system/
cp /opt/urok/deploy/urok-collab.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now urok-web urok-collab

# проверить статус
systemctl status urok-web --no-pager
systemctl status urok-collab --no-pager
```

Сайт: http://IP-СЕРВЕРА/  (порт 80)
Совместная работа: кнопка «Вместе» в шапке сайта.

## 5. Если что-то не работает

```bash
systemctl status urok-web          # статус сайта
systemctl status urok-collab       # статус совместной работы
tail -50 /var/log/urok-web.err.log
tail -50 /var/log/urok-collab.err.log
ss -tlnp | grep -E ':(80|3000|3003)'   # порты должны слушать caddy, bun, bun
```

Обновление сайта: загрузить новый архив, распаковать с заменой в /opt/urok,
повторить шаг 3 (bun install, bun run build), затем
`systemctl restart urok-web urok-collab`.

## 6. Вариант Railway (GitHub → автодеплой)

Если сайт развёрнут на Railway (как в основном сценарии):

- **Урок 1** — маршрут `/`, **Урок 2** — маршрут `/urok-2`. Ничего дополнительно
  настраивать не нужно: оба урока собираются одной сборкой.
- **Коллаборация на отдельном сервисе Railway**: в переменных основного сервиса
  задайте `NEXT_PUBLIC_COLLAB_URL=https://адрес-collab-сервиса.up.railway.app` —
  тогда Socket.IO подключится напрямую через путь `/socket.io/` (не через
  `XTransformPort`). Без этой переменной код работает по старой схеме
  Caddy + `XTransformPort=3003` (VPS-вариант).
- После изменения переменных Railway может пересобрать из кэша: держите
  переменную `NO_CACHE=1`, чтобы `bun run build` выполнялся заново.
- Комнаты коллаборации изолированы: урок 1 — `?room=urok-1` (по умолчанию),
  урок 2 — `?room=urok-2` (по умолчанию на странице /urok-2).

