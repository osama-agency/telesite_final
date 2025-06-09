# 💰 Финансовая аналитика - Реализация

## Обзор

Успешно реализована полная система финансовой аналитики с себестоимостью товаров в турецких лирах (₺) и расчетом маржинальности, ROI и оборачиваемости.

## Что было сделано

### 1. База данных
- Добавлено поле `costPriceTRY` в таблицу `products` для хранения себестоимости в лирах
- Создана новая таблица `product_prices` для истории цен и курсов валют
- Выполнена миграция базы данных

### 2. Импорт данных
- Создан скрипт импорта себестоимости из предоставленной таблицы
- Успешно импортировано 25 товаров с себестоимостью в лирах
- Автоматический расчет себестоимости в рублях по курсу 2.13 ₽/₺

### 3. Backend API
Создан новый контроллер `priceController.ts` с endpoints:
- `GET /api/prices/analytics` - финансовая аналитика по всем товарам
- `GET /api/prices/history/:productId` - история цен товара
- `PUT /api/prices/cost-try/:productId` - обновление себестоимости в лирах
- `POST /api/prices/bulk-update` - массовое обновление цен

### 4. Финансовые метрики

API рассчитывает следующие показатели:
- **Себестоимость** в ₺ и ₽
- **Маржинальность** в % и абсолютных значениях
- **ROI** (Return on Investment) в %
- **Оборачиваемость** товаров
- **Прибыль** за период
- **Стоимость склада**
- **Потенциальная выручка**

### 5. Frontend страницы

Созданы компоненты:
- `src/app/[lang]/(dashboard)/(private)/financial-analytics/page.tsx` - основная страница
- `src/app/[lang]/(dashboard)/(private)/analytics-demo/page.tsx` - демо версия
- `src/components/financial/MarginChart.tsx` - график маржинальности
- `src/components/financial/TurnoverChart.tsx` - график оборачиваемости

## Пример данных из API

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalStockValue": "1208519.40",      // Стоимость склада
      "totalPotentialRevenue": "4730700.00", // Потенциальная выручка
      "totalSalesRevenue": "1239150.00",     // Выручка за 30 дней
      "totalProfit": "927445.80",            // Прибыль за 30 дней
      "averageMargin": "75.11",              // Средняя маржа %
      "averageROI": "334.98"                 // Средний ROI %
    },
    "products": [
      {
        "id": 10,
        "name": "Atominex 25 mg",
        "costPriceTRY": 765,      // Себестоимость в лирах
        "costPriceRUB": 1629.45,  // Себестоимость в рублях
        "retailPrice": 5500,      // Розничная цена
        "margin": 3870.55,        // Маржа в рублях
        "marginPercent": "70.37", // Маржа в %
        "roi": "237.54",          // ROI %
        "stockQuantity": 99,      // Остаток на складе
        "salesQuantity": 36,      // Продано за 30 дней
        "turnover": "0.36",       // Оборачиваемость
        "profit": "139339.80"     // Прибыль
      }
    ]
  }
}
```

## Топ-5 самых прибыльных товаров

| Товар | Себест. ₺ | Маржа % | ROI % | Прибыль |
|-------|-----------|---------|-------|---------|
| Atominex 25 mg | 765 ₺ | 70.37% | 237.54% | 139,340 ₽ |
| Atominex 40 mg | 416 ₺ | 82.28% | 464.28% | 135,759 ₽ |
| Atominex 80 mg | 770 ₺ | 71.48% | 250.59% | 82,198 ₽ |
| Attex 4 mg (сироп) | 280 ₺ | 87.83% | 721.60% | 73,161 ₽ |
| Atominex 60 mg | 595 ₺ | 76.96% | 333.98% | 67,722 ₽ |

## Как использовать

### 1. Просмотр аналитики
```bash
curl http://localhost:3011/api/prices/analytics
```

### 2. Обновление себестоимости
```bash
curl -X PUT http://localhost:3011/api/prices/cost-try/10 \
  -H "Content-Type: application/json" \
  -d '{"costPriceTRY": 800, "exchangeRate": 2.13}'
```

### 3. Массовое обновление цен
```bash
curl -X POST http://localhost:3011/api/prices/bulk-update \
  -H "Content-Type: application/json" \
  -d '{
    "exchangeRate": 2.13,
    "prices": [
      {"name": "Atominex 10 mg", "costPriceTRY": 455},
      {"name": "Atominex 25 mg", "costPriceTRY": 765}
    ]
  }'
```

## Доступ к страницам

- Финансовая аналитика: http://localhost:3000/ru/financial-analytics
- Демо страница: http://localhost:3000/ru/analytics-demo

## Следующие шаги

1. Добавить графики и визуализацию данных
2. Интегрировать с реальным API курсов валют ЦБ РФ
3. Добавить экспорт отчетов в Excel/PDF
4. Создать дашборд с ключевыми метриками
5. Добавить прогнозирование и ML-аналитику 
