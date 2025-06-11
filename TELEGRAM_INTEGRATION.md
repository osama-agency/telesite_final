# Интеграция с Telegram для системы закупок

## Обзор

Система автоматически отправляет уведомления о новых закупках в Telegram чат и позволяет управлять статусами через интерактивные кнопки.

## Конфигурация

### Telegram Bot
- **Bot Token**: `8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M`
- **Chat ID**: `-4729817036`
- **Bot Username**: `@teleskald_bot`

## Функциональность

### 1. Автоматические уведомления о закупках

При создании новой закупки автоматически отправляется сообщение в Telegram с деталями:

```
🔥 СРОЧНАЯ ЗАКУПКА #1749666493522

💰 Итого: 23650 ₺
📊 Статус: Создана

📋 СПИСОК ТОВАРОВ:
• Atominex 40 mg — 15 шт. × 850 ₺ = 12750 ₺ (себестоимость)
• Attex 40 mg — 10 шт. × 650 ₺ = 6500 ₺ (себестоимость)
• Atominex 25 mg — 8 шт. × 550 ₺ = 4400 ₺ (себестоимость)

⏰ Создано: 11.06.2025, 21:28
[✅ Принять]
```

### 2. Интерактивные кнопки статусов

Последовательность статусов:
1. **Создана** → Кнопка "✅ Принять"
2. **Принята** → Кнопка "📦 Товар готов"
3. **Готов** → Кнопка "💰 Нужна оплата"
4. **Ожидает оплаты** → Кнопка "💳 Я оплатил"
5. **В пути** → Финальный статус (без кнопок)

### 3. Webhook обработка (для production)

Для работы кнопок на production сервере нужно настроить webhook:

```javascript
// backend/setup-telegram-webhook.js
const WEBHOOK_URL = 'https://your-domain.com/api/telegram/webhook';

// Установить webhook:
node setup-telegram-webhook.js

// Удалить webhook (для локальной разработки):
node setup-telegram-webhook.js delete
```

## API Endpoints

### Создание закупки с уведомлением
```bash
POST /api/purchases
{
  "isUrgent": true,
  "items": [
    {
      "productId": 1,
      "name": "Товар 1",
      "quantity": 10,
      "price": 850,
      "total": 8500
    }
  ]
}
```

### Обработка webhook от Telegram
```bash
POST /api/telegram/webhook
```

### Тестовое сообщение
```bash
POST /api/telegram/test
```

## Локальная разработка

1. Webhook должен быть удален для локальной работы:
   ```bash
   cd backend
   node setup-telegram-webhook.js delete
   ```

2. Запустить сервер закупок:
   ```bash
   cd backend
   node purchases-server.js
   ```

3. Сервер работает на порту 3010 (не 3011)

## Production настройка

1. Установить webhook на ваш домен:
   ```javascript
   // Отредактировать backend/setup-telegram-webhook.js
   const WEBHOOK_URL = 'https://yourdomain.com/api/telegram/webhook';
   ```

2. Запустить настройку:
   ```bash
   node setup-telegram-webhook.js
   ```

3. Убедиться что endpoint `/api/telegram/webhook` доступен извне

## Тестирование

### Создать тестовую закупку:
```bash
curl -X POST http://localhost:3010/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "isUrgent": true,
    "items": [
      {"productId": 1, "name": "Test Product", "quantity": 5, "price": 100, "total": 500}
    ]
  }'
```

### Отправить тестовое сообщение:
```bash
curl -X POST http://localhost:3010/api/telegram/test
```

## Структура кода

- `backend/purchases-server.js` - основной сервер с API и Telegram интеграцией
- `backend/telegram-webhook.js` - обработчики webhook (не используется в текущей версии)
- `backend/setup-telegram-webhook.js` - настройка webhook для production

## Безопасность

⚠️ **Важно**: В production окружении обязательно:
1. Вынести токен бота в переменные окружения
2. Проверять подпись webhook запросов от Telegram
3. Ограничить доступ к webhook endpoint только от IP Telegram 
