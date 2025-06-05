# Система синхронизации заказов

Эта система позволяет автоматически синхронизировать данные заказов из внешнего API (`https://strattera.tgapp.online/api/v1/products`) в локальную базу данных PostgreSQL для конкретных пользователей (админов) с автоматическим обновлением каждые 5 минут.

## 🏗️ Архитектура

- **Модель**: `SyncedOrder` - хранит синхронизированные заказы для каждого пользователя
- **Контроллер**: `SyncController` - обрабатывает синхронизацию и API запросы
- **Планировщик**: `SyncScheduler` - автоматическая синхронизация каждые 5 минут
- **Frontend**: Обновленная таблица заказов с кнопкой ручной синхронизации

## 📋 Требования

1. **Node.js** >= 18.0.0
2. **PostgreSQL** база данных
3. **npm** >= 8.0.0

## 🚀 Установка и настройка

### 1. Установите зависимости

```bash
cd backend
npm install
```

### 2. Настройте переменные окружения

Создайте файл `.env` в папке `backend/`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sneat_db
DB_USER=your_username
DB_PASSWORD=your_password

# API
PORT=3001
NODE_ENV=development

# Sync Scheduler
ENABLE_SYNC_SCHEDULER=true
TZ=Europe/Moscow

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Запустите миграции

```bash
cd backend
npm run db:migrate
```

### 4. Создайте пользователя (если не существует)

Вставьте тестового пользователя в базу данных:

```sql
INSERT INTO users (id, email, password, created_at, updated_at) 
VALUES (1, 'admin@example.com', 'hashed_password', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

### 5. Запустите backend сервер

```bash
cd backend
npm run dev
```

## 📡 API Endpoints

### Синхронизация заказов
```
POST /api/sync/orders
Content-Type: application/json

{
  "userId": 1
}
```

### Получение синхронизированных заказов
```
GET /api/sync/orders/:userId?page=1&limit=20&dateFrom=2024-01-01&dateTo=2024-12-31
```

### Ручной запуск автоматической синхронизации
```
POST /api/sync/auto
```

## ⚙️ Настройка автоматической синхронизации

### Включение планировщика

1. **В production**: Планировщик запускается автоматически
2. **В development**: Установите `ENABLE_SYNC_SCHEDULER=true` в `.env`

### Изменение расписания

Отредактируйте файл `backend/src/utils/syncScheduler.js`:

```javascript
// Каждые 5 минут (по умолчанию)
cron.schedule('*/5 * * * *', ...)

// Каждые 10 минут
cron.schedule('*/10 * * * *', ...)

// Каждый час
cron.schedule('0 * * * *', ...)

// Каждые 30 секунд (для тестирования)
cron.schedule('*/30 * * * * *', ...)
```

## 🖥️ Frontend интеграция

Frontend компонент автоматически:
- Загружает данные из локальной базы
- Фильтрует по периодам (сегодня, вчера, неделя, 30 дней, свой период)
- Предоставляет кнопку ручной синхронизации
- Показывает состояния загрузки и ошибок

## 🔍 Мониторинг и логи

### Проверка статуса планировщика

```bash
# В консоли сервера вы увидите:
🚀 Sync scheduler started successfully
⏰ Will sync every 5 minutes
🕐 Next sync at: 2024-12-05T15:25:00.000Z

# При каждой синхронизации:
🔄 [2024-12-05T15:25:00.000Z] Starting automatic sync...
✅ [2024-12-05T15:25:02.000Z] Automatic sync completed successfully
📊 Sync results: [...]
```

### Health Check

```
GET /health
```

Возвращает статус базы данных и другую информацию о системе.

## 🛠️ Структура данных

### Таблица `synced_orders`

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INTEGER | Внутренний ID |
| `external_order_id` | INTEGER | ID заказа из внешнего API |
| `user_id` | INTEGER | ID пользователя (админа) |
| `paid_at` | DATE | Дата оплаты заказа |
| `client_id` | INTEGER | ID клиента |
| `full_name` | VARCHAR(500) | ФИО клиента |
| `address` | TEXT | Адрес доставки |
| `shipping_cost` | DECIMAL(10,2) | Стоимость доставки (₺) |
| `product_name` | VARCHAR(500) | Название товара |
| `quantity` | INTEGER | Количество |
| `price` | DECIMAL(10,2) | Цена товара (₺) |
| `last_synced_at` | DATE | Время последней синхронизации |

### Индексы

- `user_id` - для быстрой фильтрации по пользователю
- `external_order_id` - уникальный индекс для предотвращения дублей
- `paid_at` - для фильтрации по датам
- `user_id, paid_at` - составной индекс для оптимизации запросов

## 🔧 Устранение неполадок

### Планировщик не запускается

1. Проверьте переменную `ENABLE_SYNC_SCHEDULER=true`
2. Убедитесь что установлен пакет `node-cron`
3. Проверьте логи сервера

### Ошибки синхронизации

1. **Cannot connect to external API**: Проверьте интернет соединение
2. **HTTP error! status: 500**: Проблемы с внешним API
3. **Database connection error**: Проверьте настройки БД

### Нет данных в таблице

1. Запустите ручную синхронизацию: `POST /api/sync/orders`
2. Проверьте что пользователь существует в таблице `users`
3. Проверьте логи синхронизации

## 📊 Производительность

- **Upsert операции** предотвращают дублирование
- **Индексы** обеспечивают быстрые запросы
- **Пагинация** для больших объемов данных
- **Задержки между пользователями** при массовой синхронизации

## 🔐 Безопасность

- Данные привязаны к конкретному пользователю
- Валидация входящих данных
- Rate limiting на API endpoints
- Graceful handling ошибок

## 📈 Масштабирование

Для больших объемов данных рассмотрите:
- Разделение синхронизации по пользователям
- Использование очередей (Redis/Bull)
- Кеширование частых запросов
- Оптимизацию индексов 
