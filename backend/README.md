# Sneat Backend API

Backend API для приложения Sneat e-commerce с PostgreSQL и Prisma.

## Функции

- 🗄️ **PostgreSQL** - основная база данных
- 📊 **Prisma ORM** - современный ORM для TypeScript
- 🔄 **Синхронизация заказов** - импорт заказов из внешнего API
- 🚀 **TypeScript** - полная типизация
- 🐳 **Docker** - готовые контейнеры для деплоя

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

Скопируйте `.env` файл:
```bash
cp env.example .env
```

Настройте `DATABASE_URL` в `.env`:
```env
DATABASE_URL="postgresql://myshopuser:MyStrongPass123@localhost:5432/myshop?schema=public"
```

### 3. Миграции базы данных

```bash
# Генерация Prisma клиента
npm run prisma:generate

# Запуск миграций
npm run prisma:migrate
```

### 4. Запуск сервера

```bash
# Development режим
npm run dev

# Production режим
npm run build
npm start
```

Сервер будет доступен на `http://localhost:3011`

## API Endpoints

### Health Check
```
GET /health
```

### Синхронизация заказов
```
POST /api/sync-orders
Headers:
  Authorization: 8cM9wVBrY3p56k4L1VBpIBwOsw
  Content-Type: application/json
```

Возвращает:
```json
{
  "imported": 451
}
```

**Пример тестирования:**
```bash
curl -X POST http://localhost:3011/api/sync-orders \
  -H "Authorization: 8cM9wVBrY3p56k4L1VBpIBwOsw"
```

## Docker Deployment

### Запуск с Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Только PostgreSQL
docker-compose up postgres -d

# Остановка
docker-compose down
```

### Сервисы:
- **postgres** - PostgreSQL 16 база данных (порт 5432)
- **app** - Backend приложение (порт 3011)

## Scripts

```bash
# Development
npm run dev                 # Запуск с hot reload

# Database
npm run prisma:migrate      # Создание и применение миграций
npm run prisma:generate     # Генерация Prisma клиента
npm run prisma:studio       # GUI для базы данных
npm run db:push             # Push изменений в БД без миграций
npm run db:reset            # Сброс базы данных

# Build
npm run build              # Компиляция TypeScript
npm start                  # Запуск production build

# Testing
npm test                   # Запуск тестов
npm run test:watch         # Тесты в watch режиме
```

## Переменные окружения

```env
# Server
NODE_ENV=development
PORT=3011
HOST=localhost

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"

# External API
STRATTERA_API_URL=https://strattera.tgapp.online/api/v1/orders
STRATTERA_API_TOKEN=your_authorization_token_here

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Структура проекта

```
backend/
├── prisma/
│   └── schema.prisma          # Prisma схема
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Prisma клиент
│   ├── types/
│   │   └── index.ts           # TypeScript типы
│   ├── controllers/
│   │   └── syncController.ts  # Контроллер синхронизации
│   ├── routes/
│   │   └── sync.ts           # Маршруты API
│   ├── app.ts                # Express приложение
│   └── server.ts             # Сервер
├── docker-compose.yml        # Docker Compose
├── Dockerfile               # Docker образ
└── package.json            # Dependencies
```

## Модели базы данных

### Order
- `id` - уникальный ID
- `externalId` - ID из внешнего API
- `customerName` - имя клиента
- `customerEmail` - email клиента
- `customerPhone` - телефон клиента
- `status` - статус заказа
- `total` - общая сумма
- `currency` - валюта
- `orderDate` - дата заказа
- `items[]` - элементы заказа

### OrderItem
- `id` - уникальный ID
- `orderId` - ID заказа
- `productId` - ID товара
- `name` - название товара
- `quantity` - количество
- `price` - цена за единицу
- `total` - общая стоимость

## Разработка

Backend готов для деплоя и дальнейшей разработки. Архитектура позволяет легко добавлять новые endpoints и модели данных.

### Добавление новых endpoints:
1. Создайте контроллер в `src/controllers/`
2. Добавьте маршруты в `src/routes/`
3. Подключите роуты в `src/app.ts`

### Добавление новых моделей:
1. Обновите `prisma/schema.prisma`
2. Запустите `npm run prisma:migrate`
3. Обновите типы в `src/types/`

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- MongoDB (optional)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your database credentials
```

4. **Create PostgreSQL database**
```bash
createdb sneat_db
# Or use your PostgreSQL client to create the database
```

5. **Run migrations**
```bash
npm run migrate
```

6. **Seed the database (optional)**
```bash
npm run seed
```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in .env)

## 📚 API Documentation

Once the server is running, you can access:
- API Documentation: `http://localhost:3000/api-docs`
- Health Check: `http://localhost:3000/health`

## 🔗 API Endpoints

### Products
- `GET /api/v1/products` - Get all products (paginated)
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/low-stock` - Get low stock products
- `POST /api/v1/products/bulk` - Bulk create/update products
- `PUT /api/v1/products/:id/stock` - Update product stock

### Customer Orders
- `GET /api/v1/orders` - Get all orders (paginated)
- `GET /api/v1/orders/:id` - Get order by ID
- `POST /api/v1/orders` - Create new order
- `PUT /api/v1/orders/:id/status` - Update order status
- `GET /api/v1/orders/statistics` - Get order statistics

### Warehouse Orders
- `GET /api/v1/warehouse-orders` - Get all warehouse orders
- `GET /api/v1/warehouse-orders/:id` - Get warehouse order by ID
- `POST /api/v1/warehouse-orders` - Create new warehouse order
- `POST /api/v1/warehouse-orders/:id/receive` - Receive items
- `GET /api/v1/warehouse-orders/pending` - Get pending deliveries

### Expenses
- `GET /api/v1/expenses` - Get all expenses (paginated)
- `GET /api/v1/expenses/:id` - Get expense by ID
- `POST /api/v1/expenses` - Create new expense
- `PUT /api/v1/expenses/:id` - Update expense
- `DELETE /api/v1/expenses/:id` - Delete expense
- `GET /api/v1/expenses/by-category` - Get expenses by category
- `GET /api/v1/expenses/by-date-range` - Get expenses by date range

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Database and app configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── migrations/     # Database migrations
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── seeders/        # Database seeders
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🔧 Configuration

Key environment variables:

```env
# Server
NODE_ENV=development
PORT=3000

# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/sneat_db

# Security
JWT_SECRET=your-secret-key
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

## 📝 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Undo last migration
- `npm run seed` - Run database seeders
- `npm run seed:undo` - Undo all seeds
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection protection (via Sequelize)
- XSS protection

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

1. Set production environment variables
2. Run migrations: `npm run migrate`
3. Start server: `npm start`

### Docker Support

```bash
# Build image
docker build -t sneat-backend .

# Run container
docker run -p 3000:3000 --env-file .env sneat-backend
```

## 📊 Database Schema

### Products
- id, name, sku, description, price, cost, stock, minStock, category, brand, etc.

### Customer Orders
- id, orderNumber, customerName, customerEmail, status, totalAmount, etc.

### Customer Order Items
- id, orderId, productId, quantity, price, discount, etc.

### Warehouse Orders
- id, orderNumber, supplierName, status, expectedDeliveryDate, etc.

### Warehouse Order Items
- id, warehouseOrderId, productId, quantity, unitCost, receivedQuantity, etc.

### Expenses
- id, description, amount, category, date, vendor, paymentMethod, etc.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@sneat.com or open an issue in the repository. 
