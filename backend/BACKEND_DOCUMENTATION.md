# 📚 Полная документация Backend API (TypeScript)

## 🏗️ Архитектура

### Технологический стек
- **TypeScript** - строгая типизация для надежности
- **Express.js** - веб-фреймворк
- **PostgreSQL** - основная база данных
- **Prisma ORM** - работа с БД
- **Node-cron** - планировщик задач
- **Axios** - HTTP клиент

### Структура проекта
```
backend/
├── src/                    # Исходный код TypeScript
│   ├── controllers/        # Контроллеры (бизнес-логика)
│   ├── routes/            # Маршруты API
│   ├── utils/             # Утилиты и хелперы
│   ├── types/             # TypeScript типы
│   ├── lib/               # Библиотеки (Prisma client)
│   ├── app.ts             # Настройка Express
│   └── server.ts          # Точка входа
├── dist/                  # Скомпилированный JavaScript
├── prisma/                # Схема БД и миграции
│   ├── schema.prisma      # Схема базы данных
│   └── migrations/        # История миграций
├── uploads/               # Загруженные файлы
├── tsconfig.json          # Конфигурация TypeScript
├── package.json           # Зависимости и скрипты
└── .env                   # Переменные окружения
```

## 🚀 Установка и запуск

### 1. Установка зависимостей
```bash
cd backend
npm install
```

### 2. Настройка окружения
```bash
# Скопируйте пример конфигурации
cp env.example .env

# Отредактируйте .env файл
DATABASE_URL="postgresql://myshopuser:MyStrongPass123@localhost:5432/myshop?schema=public"
PORT=3011
STRATTERA_API_URL=https://strattera.tgapp.online/api/v1/orders
STRATTERA_API_TOKEN=8cM9wVBrY3p56k4L1VBpIBwOsw
```

### 3. Настройка базы данных
```bash
# Применить миграции
npm run prisma:migrate

# Сгенерировать Prisma Client
npm run prisma:generate

# Открыть GUI для БД (опционально)
npm run prisma:studio
```

### 4. Запуск сервера

#### Production режим
```bash
# Компиляция TypeScript
npm run build

# Запуск сервера
npm start
# или
PORT=3011 node dist/server.js
```

#### Development режим
```bash
# С автоматической перезагрузкой
npm run dev
# или
./node_modules/.bin/ts-node-dev --respawn --transpile-only src/server.ts
```

#### Использование скрипта
```bash
# Делаем скрипт исполняемым (один раз)
chmod +x start.sh

# Запуск
./start.sh
```

## 📡 API Endpoints

### Заказы
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/orders` | Получить список заказов |
| GET | `/api/orders/:id` | Получить детали заказа |
| GET | `/api/orders/stats` | Статистика заказов |
| PUT | `/api/orders/:id` | Обновить заказ |
| PUT | `/api/orders/:id/status` | Обновить статус заказа |
| POST | `/api/orders/:id/comment` | Добавить комментарий |

### Товары
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/products` | Получить список товаров |
| GET | `/api/products/:id` | Получить товар по ID |
| PUT | `/api/products/:id/stock` | Обновить остаток |
| PUT | `/api/products/:id/price` | Обновить цену |
| PUT | `/api/products/:id/cost` | Обновить себестоимость |
| PUT | `/api/products/:id/analytics` | Обновить аналитику |
| PATCH | `/api/products/:id/hide` | Скрыть/показать товар |

### Синхронизация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/sync-orders` | Синхронизировать заказы |
| POST | `/api/sync-products` | Синхронизировать товары |

### Валюта
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/currency/rates` | Получить курсы валют |
| POST | `/api/currency/refresh` | Обновить курсы |

### Пользователи
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/user/profile/:userId` | Получить профиль |
| PUT | `/api/user/profile/:userId` | Обновить профиль |
| POST | `/api/user/profile/:userId/avatar` | Загрузить аватар |
| DELETE | `/api/user/profile/:userId/avatar` | Сбросить аватар |

## 🔄 Автоматическая синхронизация

### Как работает
1. При запуске сервера запускаются cron задачи
2. Каждые 5 минут выполняется синхронизация:
   - Заказы из https://strattera.tgapp.online/api/v1/orders
   - Товары из https://strattera.tgapp.online/api/v1/products
3. Данные сохраняются в PostgreSQL с использованием `upsert`
4. Пользовательские изменения не перезаписываются

### Мониторинг синхронизации
```bash
# Просмотр логов синхронизации
tail -f server.log | grep -E "sync|Sync|cron|Cron"

# Проверка количества записей в БД
PGPASSWORD=MyStrongPass123 psql -h localhost -U myshopuser -d myshop -c "SELECT COUNT(*) FROM orders;"
PGPASSWORD=MyStrongPass123 psql -h localhost -U myshopuser -d myshop -c "SELECT COUNT(*) FROM products;"
```

## 💱 Курсы валют

### Автоматическое обновление
- Источник: ЦБ РФ (https://www.cbr-xml-daily.ru/daily_json.js)
- Обновление: каждые 30 минут
- Буфер: автоматически +5% к курсу
- Формат: 1 ₺ = X.XXXX ₽

### API ответ
```json
{
  "success": true,
  "data": {
    "current": 2.0252,
    "currentWithBuffer": 2.1264,
    "average30Days": 2.0455,
    "buffer": 0.05,
    "lastUpdate": "2025-06-08T10:57:08.167Z",
    "source": "ЦБ РФ",
    "nextUpdate": "2025-06-08T11:27:08.167Z"
  }
}
```

## 🗄️ База данных

### Основные таблицы

#### orders
- Заказы клиентов
- Связь с order_items (1:N)
- Поля: статус, сумма, клиент, даты

#### products
- Каталог товаров
- Аналитические поля
- Остатки и рекомендации

#### order_items
- Товары в заказах
- Связь с orders

#### users
- Профили пользователей
- Аватары и контакты

### Работа с миграциями
```bash
# Создать новую миграцию
npm run prisma:migrate dev --name описание_изменений

# Применить миграции в production
npm run prisma:migrate deploy

# Сбросить БД (осторожно!)
npm run db:reset
```

## 🛠️ Разработка

### Добавление нового endpoint

1. Создайте контроллер в `src/controllers/`:
```typescript
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const myController = async (req: Request, res: Response) => {
  try {
    // Логика
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

2. Добавьте маршрут в `src/routes/`:
```typescript
import { Router } from 'express';
import { myController } from '../controllers/myController';

const router = Router();
router.get('/my-endpoint', myController);
export default router;
```

3. Подключите в `src/app.ts`:
```typescript
import myRoutes from './routes/myRoutes';
app.use('/api', myRoutes);
```

### Типизация

Всегда используйте строгую типизацию:
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  // ...
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## 📝 Логирование

### Просмотр логов
```bash
# Все логи
tail -f server.log

# Только ошибки
tail -f server.log | grep -E "ERROR|Error|❌"

# Синхронизация
tail -f server.log | grep -E "sync|Sync"

# API запросы
tail -f server.log | grep "HTTP"
```

### Уровни логирования
- 🚀 Запуск/остановка
- ✅ Успешные операции
- ⚠️ Предупреждения
- ❌ Ошибки
- 🔄 Синхронизация
- 💱 Валютные операции
- 📦 Операции с данными

## 🚨 Решение проблем

### Ошибка "command not found"
```bash
# Используйте прямые пути
./node_modules/.bin/ts-node-dev
./node_modules/.bin/prisma
```

### Порт занят
```bash
# Найти процесс
lsof -i :3011

# Убить процесс
kill -9 <PID>
```

### Ошибки компиляции TypeScript
```bash
# Проверить ошибки
npx tsc --noEmit

# Пересобрать
rm -rf dist
npm run build
```

### Проблемы с БД
```bash
# Проверить подключение
npm run prisma:studio

# Пересоздать клиент
npm run prisma:generate
```

## 📋 Чек-лист запуска

- [ ] PostgreSQL запущен
- [ ] .env файл настроен
- [ ] Зависимости установлены (`npm install`)
- [ ] Миграции применены (`npm run prisma:migrate`)
- [ ] TypeScript скомпилирован (`npm run build`)
- [ ] Порт 3011 свободен
- [ ] Сервер запущен (`npm start`)

## ⚠️ Важные правила

1. **ВСЕГДА используйте TypeScript** - никаких простых JS файлов
2. **Типизируйте все** - Request, Response, данные из БД
3. **Используйте Prisma** для всех операций с БД
4. **Не изменяйте** dist/ напрямую - только через компиляцию
5. **Тестируйте** изменения в dev режиме перед production
6. **Логируйте** важные операции для отладки
7. **Обрабатывайте ошибки** с try/catch
8. **Валидируйте** входные данные

## 🔐 Безопасность

- Храните секреты в .env файле
- Не коммитьте .env в git
- Используйте CORS для ограничения доступа
- Валидируйте все входные данные
- Обновляйте зависимости регулярно

---

**Версия документации**: 1.0.0  
**Последнее обновление**: 08.06.2025  
**Автор**: Backend Team 
