# 🔄 Перезапуск серверов при проблемах

## Если заказы/данные не загружаются

### 1. Проверка статуса серверов
```bash
ps aux | grep -E "(next|node.*server)" | grep -v grep
```

### 2. Остановка всех серверов
```bash
# Останавливаем Next.js
pkill -f "next dev"

# Останавливаем backend (если нужно)
pkill -f "node dist/server.js"
```

### 3. Запуск backend (из папки backend/)
```bash
cd backend
npm run build
PORT=3011 node dist/server.js &
```

### 4. Запуск frontend (из корня проекта)
```bash
./node_modules/.bin/next dev --turbopack &
```

### 5. Проверка работоспособности
```bash
# Backend API
curl localhost:3011/health

# Frontend через proxy
curl localhost:3000/api/orders | head -c 100

# Frontend страница
curl localhost:3000/ru/orders
```

## Порты и URL

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3011
- **API через proxy**: http://localhost:3000/api/*

## Конфигурация проксирования

В `next.config.ts` настроен rewrite:
```typescript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3011/api/:path*'
    }
  ]
}
```

## Типичные проблемы

1. **Ошибка "Unexpected token '<'"** - backend не отвечает или проксирование не работает
2. **Пустые данные** - backend работает, но данные не синхронизированы
3. **502 Bad Gateway** - backend сервер недоступен

## Логи и отладка

```bash
# Логи Next.js - видны в терминале где запущен
# Логи backend - см вывод node dist/server.js

# Проверка процессов
lsof -i :3000
lsof -i :3011
``` 
