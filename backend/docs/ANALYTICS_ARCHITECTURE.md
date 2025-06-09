# Архитектура аналитики закупок и рентабельности

## Обзор

Система аналитики предоставляет полную информацию о рентабельности товаров, учитывая:
- Себестоимость в лирах и рублях
- Расходы на логистику
- Средние цены продаж
- Маржинальность
- Оборачиваемость товаров

## База данных

### Новые таблицы

#### 1. `expenses` - Расходы
```prisma
model Expense {
  id          String    @id @default(cuid())
  date        DateTime  @default(now())
  category    String    // 'Логистика', 'Закупка товаров', 'Прочее'
  amount      Decimal   @db.Decimal(10, 2)
  comment     String?
  productId   Int?      @map("product_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
}
```

#### 2. `exchange_rates` - Курсы валют
```prisma
model ExchangeRate {
  id            String    @id @default(cuid())
  currency      String    // 'TRY'
  rate          Decimal   @db.Decimal(10, 4)
  rateWithBuffer Decimal  @map("rate_with_buffer") @db.Decimal(10, 4)
  bufferPercent Decimal   @map("buffer_percent") @db.Decimal(5, 2) @default(5)
  source        String    @default("CBR")
  effectiveDate DateTime  @map("effective_date")
  createdAt     DateTime  @default(now()) @map("created_at")
}
```

### Существующие таблицы

- `products` - уже содержит `costPriceTRY` для себестоимости в лирах
- `orders` и `order_items` - для расчета продаж и средних цен

## API Endpoints

### Расходы

#### `GET /api/expenses`
Получение списка расходов с фильтрацией.

Параметры:
- `category` - фильтр по категории
- `productId` - фильтр по товару
- `from`, `to` - период (YYYY-MM-DD)
- `page`, `limit` - пагинация

Ответ:
```json
{
  "success": true,
  "data": {
    "expenses": [...],
    "total": 100,
    "totalAmount": 150000,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

#### `POST /api/expenses`
Создание нового расхода.

Тело запроса:
```json
{
  "category": "Логистика",
  "amount": 15000,
  "comment": "Доставка из Турции",
  "productId": null,
  "date": "2025-06-01"
}
```

#### `GET /api/expenses/categories`
Получение списка категорий расходов.

#### `GET /api/expenses/stats`
Статистика расходов по категориям за период.

### Аналитика товаров

#### `GET /api/analytics/products?from=YYYY-MM-DD&to=YYYY-MM-DD`
Получение полной аналитики по всем товарам.

Ответ включает для каждого товара:
- `productId`, `productName` - идентификация
- `stock`, `inTransit` - текущие остатки
- `costLira` - себестоимость в лирах
- `costRub` - полная себестоимость в рублях (с учетом курса и логистики)
- `avgRetailPrice` - средняя цена продажи за период
- `avgDailyConsumption` - среднее потребление в день
- `daysUntilZero` - дней до окончания запасов
- `margin` - маржа в рублях
- `marginPercent` - маржинальность в процентах
- `totalSales` - количество продаж
- `totalRevenue` - общая выручка
- `logisticsCostPerUnit` - расходы на логистику на единицу
- `deliveryCostPerUnit` - стоимость доставки клиенту (350₽)
- `fullCostPerUnit` - полная себестоимость с учетом всех расходов

Пример ответа:
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2025-05-01",
      "to": "2025-06-08"
    },
    "summary": {
      "totalProducts": 32,
      "avgMarginPercent": 350.5,
      "totalRevenue": 1624400,
      "totalMargin": 1200421.03,
      "criticalProducts": 2,
      "topPerformers": [...]
    },
    "products": [
      {
        "productId": 6,
        "productName": "Atominex 40 mg",
        "stock": 59,
        "inTransit": 0,
        "costLira": 416,
        "costRub": 932.09,
        "avgRetailPrice": 5000,
        "avgDailyConsumption": 1.34,
        "daysUntilZero": 43,
        "margin": 3717.91,
        "marginPercent": 289.99,
        "totalSales": 51,
        "totalRevenue": 255000,
        "logisticsCostPerUnit": 47.47,
        "deliveryCostPerUnit": 350,
        "fullCostPerUnit": 1282.09
      }
    ]
  }
}
```

#### `GET /api/analytics/products/:id`
Аналитика по конкретному товару.

#### `POST /api/analytics/exchange-rate`
Обновление курса валюты.

Тело запроса:
```json
{
  "rate": 2.0252,
  "bufferPercent": 5
}
```

## Расчет метрик

### Себестоимость в рублях (базовая)
```
costRub = costLira * exchangeRateWithBuffer + logisticsPerUnit
```

### Логистика на единицу
```
logisticsPerUnit = totalLogisticsCosts / totalUnitsSold
```

### Доставка клиенту
```
deliveryCostPerUnit = 350₽ (фиксированная ставка курьера)
```

### Полная себестоимость
```
fullCostPerUnit = costRub + deliveryCostPerUnit
```

### Средняя цена продажи
Рассчитывается как среднее арифметическое всех цен продаж товара за период.

### Маржинальность (с учетом ВСЕХ расходов)
```
margin = avgRetailPrice - fullCostPerUnit
marginPercent = (margin / fullCostPerUnit) * 100
```

### Дней до нуля
```
daysUntilZero = stock / avgDailyConsumption
```

## Пример расчета полной себестоимости

Для товара **Atominex 40 mg**:

1. **Базовая себестоимость**:
   - Закупка: 416 ₺ × 2.1264 = 884.62 ₽
   - Логистика закупки: 47.47 ₽
   - Итого базовая: 932.09 ₽

2. **Доставка клиенту**:
   - Курьерская доставка: 350 ₽/шт

3. **Полная себестоимость**:
   - 932.09 + 350 = 1,282.09 ₽

4. **Маржинальность**:
   - Розничная цена: 5,000 ₽
   - Маржа: 5,000 - 1,282.09 = 3,717.91 ₽
   - Маржинальность: 289.99%

**Важно**: Без учета доставки клиенту маржинальность была бы 436.43%, но с учетом доставки она снижается до 289.99% (разница -146.44%).

## Сервисы

### ProductAnalyticsService
Основной сервис для расчета аналитики:
- `getProductsAnalytics(from, to)` - аналитика по всем товарам
- `getProductAnalytics(productId, from, to)` - аналитика по товару
- `updateExchangeRate(rate, bufferPercent)` - обновление курса
- Константа `DELIVERY_COST_PER_UNIT = 350` - стоимость доставки клиенту

## Интеграция с существующей системой

1. **Не изменяет** существующую логику синхронизации заказов и товаров
2. **Дополняет** систему новыми таблицами и API endpoints
3. **Использует** существующие данные из `orders`, `order_items`, `products`
4. **Расширяет** функциональность без breaking changes

## Примеры использования

### Добавление расхода на логистику
```bash
curl -X POST http://localhost:3011/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Логистика",
    "amount": 15000,
    "comment": "Доставка партии товаров из Турции",
    "date": "2025-06-01"
  }'
```

### Получение аналитики за месяц
```bash
curl "http://localhost:3011/api/analytics/products?from=2025-05-01&to=2025-06-01"
```

### Обновление курса валюты
```bash
curl -X POST http://localhost:3011/api/analytics/exchange-rate \
  -H "Content-Type: application/json" \
  -d '{"rate": 2.0252, "bufferPercent": 5}'
``` 
