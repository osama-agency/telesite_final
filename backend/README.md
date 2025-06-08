# Backend API для Sneat E-commerce (TypeScript)

## 🏗️ Архитектура

**ВАЖНО**: Используется ТОЛЬКО TypeScript версия. Простые JavaScript серверы запрещены.

### Технологический стек
- **TypeScript** - строгая типизация (обязательно)
- **Express.js** - веб-фреймворк
- **PostgreSQL** - основная база данных
- **Prisma ORM** - современный ORM для TypeScript
- **Node-cron** - автоматические задачи

## 🚀 Быстрый старт

```bash
# 1. Установка зависимостей
cd backend
npm install

# 2. Настройка окружения
cp env.example .env
# Отредактируйте .env файл с вашими настройками

# 3. Настройка базы данных
npm run prisma:migrate
npm run prisma:generate

# 4. Компиляция TypeScript (обязательно!)
npm run build

# 5. Запуск сервера
npm start
# или используйте скрипт
./start.sh
```

Сервер запустится на порту **3011**.

## 📁 Структура проекта (TypeScript)

```
backend/
├── src/                    # ⚡ TypeScript исходный код
│   ├── controllers/        # Контроллеры с типизацией
│   ├── routes/            # Маршруты API
│   ├── utils/             # Утилиты и хелперы
│   ├── types/             # TypeScript типы и интерфейсы
│   ├── lib/               # Библиотеки (Prisma client)
│   ├── app.ts             # Настройка Express
│   └── server.ts          # Точка входа
├── dist/                  # 📦 Скомпилированный JavaScript (не редактировать!)
├── prisma/                # Схема БД и миграции
│   ├── schema.prisma      # Схема базы данных
│   └── migrations/        # История миграций
├── tsconfig.json          # ⚙️ Конфигурация TypeScript
└── package.json           # Зависимости и скрипты
```

## 🔄 Автоматическая синхронизация

Система автоматически синхронизирует данные каждые 5 минут:

- **Заказы**: https://strattera.tgapp.online/api/v1/orders
- **Товары**: https://strattera.tgapp.online/api/v1/products
- **Авторизация**: `Authorization: 8cM9wVBrY3p56k4L1VBpIBwOsw`

### Мониторинг синхронизации
```bash
# Просмотр логов синхронизации
tail -f server.log | grep -E "sync|Sync|cron|Cron"
```

## 📡 API Endpoints

### Основные endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/orders` | Список заказов из БД |
| GET | `/api/products` | Список товаров из БД |
| GET | `/api/currency/rates` | Курсы валют (ЦБ РФ) |
| POST | `/api/sync-orders` | Ручная синхронизация заказов |
| POST | `/api/sync-products` | Ручная синхронизация товаров |

[Полный список endpoints →](./BACKEND_DOCUMENTATION.md#-api-endpoints)

## 💱 Курсы валют

- **Источник**: ЦБ РФ
- **Формат**: 1 ₺ = 2.03 ₽ (правильный расчет с учетом номинала)
- **Обновление**: каждые 30 минут
- **Буфер**: +5% автоматически

## 🛠️ Команды разработчика

### Development
```bash
# Запуск с hot-reload (использует ts-node-dev)
npm run dev
# или прямой путь
./node_modules/.bin/ts-node-dev --respawn --transpile-only src/server.ts
```

### Production
```bash
# 1. Компиляция TypeScript (обязательно!)
npm run build

# 2. Запуск скомпилированного кода
npm start
# или
PORT=3011 node dist/server.js
```

### База данных
```bash
npm run prisma:studio     # GUI для просмотра БД
npm run prisma:migrate    # Применить миграции
npm run prisma:generate   # Сгенерировать типы Prisma
```

## 📝 Правила разработки

### ✅ ОБЯЗАТЕЛЬНО:
1. **Использовать TypeScript** для всех файлов
2. **Типизировать все** - Request, Response, модели
3. **Компилировать перед запуском** - `npm run build`
4. **Использовать Prisma** для работы с БД
5. **Логировать важные операции**

### ❌ ЗАПРЕЩЕНО:
1. **Создавать простые JS файлы** в src/
2. **Редактировать файлы в dist/** напрямую
3. **Использовать `any` тип** без крайней необходимости
4. **Игнорировать ошибки TypeScript**
5. **Запускать некомпилированный код**

## 🚨 Решение проблем

### "command not found"
```bash
# Используйте прямые пути для npm скриптов
./node_modules/.bin/ts-node-dev
./node_modules/.bin/prisma
./node_modules/.bin/tsc
```

### Ошибки компиляции
```bash
# Проверить ошибки TypeScript
npx tsc --noEmit

# Пересобрать проект
rm -rf dist
npm run build
```

### Порт занят
```bash
# Найти процесс на порту 3011
lsof -i :3011

# Убить процесс
kill -9 <PID>
```

## 📚 Документация

- [📖 Полная документация Backend](./BACKEND_DOCUMENTATION.md)
- [🔄 Детали реализации синхронизации](./SYNC_IMPLEMENTATION.md)
- [⚙️ Пример конфигурации](./env.example)

## ⚠️ Критически важно

1. **TypeScript обязателен** - это не опция, а требование
2. **Компиляция перед запуском** - всегда выполняйте `npm run build`
3. **Типы Prisma** - генерируйте после изменения схемы
4. **Не трогайте dist/** - только через компиляцию
5. **Проверяйте типы** - TypeScript должен компилироваться без ошибок

---

**Версия**: 2.0.0 (TypeScript Only)  
**Порт**: 3011  
**Последнее обновление**: 08.06.2025
