# 🚀 Быстрый запуск Backend (TypeScript)

## Запуск за 30 секунд

```bash
# В директории backend/
./start.sh
```

## Ручной запуск

```bash
# 1. Компиляция TypeScript
npm run build

# 2. Запуск сервера
PORT=3011 node dist/server.js
```

## Development режим

```bash
# С автоперезагрузкой
npm run dev

# Или напрямую
./node_modules/.bin/ts-node-dev --respawn --transpile-only src/server.ts
```

## Проверка работы

```bash
# Health check
curl http://localhost:3011/health

# Курсы валют
curl http://localhost:3011/api/currency/rates

# Товары
curl http://localhost:3011/api/products
```

## Остановка сервера

```bash
# Найти процесс
lsof -i :3011

# Остановить
kill <PID>
```

## ⚠️ Помни

- **ТОЛЬКО TypeScript** - никаких простых JS серверов
- **Порт 3011** - всегда
- **Компилировать перед запуском** - `npm run build`
- **Логи в server.log** - для отладки

---
Сервер: http://localhost:3011 
