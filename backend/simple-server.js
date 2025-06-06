const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3010;

app.use(cors());
app.use(express.json());

// Mock orders data
const mockOrders = [
  {
    id: '1',
    externalId: '1192',
    customerName: 'Островский Данил Игоревич',
    customerEmail: 'danil@example.com',
    customerPhone: '+7 921 123 45 67',
    status: 'shipped',
    total: '6000',
    currency: 'RUB',
    orderDate: '2025-06-05T10:00:00Z',
    createdAt: '2025-06-05T10:00:00Z',
    updatedAt: '2025-06-05T10:00:00Z',
    items: [
      {
        id: '1',
        orderId: '1',
        productId: '1',
        name: 'Atomineх 25 mg',
        quantity: 1,
        price: '6000',
        total: '6000',
        createdAt: '2025-06-05T10:00:00Z',
        updatedAt: '2025-06-05T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    externalId: '1193',
    customerName: 'Петров Иван Сергеевич',
    customerEmail: 'ivan@example.com',
    customerPhone: '+7 921 987 65 43',
    status: 'processing',
    total: '12500',
    currency: 'RUB',
    orderDate: '2025-06-04T14:30:00Z',
    createdAt: '2025-06-04T14:30:00Z',
    updatedAt: '2025-06-04T14:30:00Z',
    items: [
      {
        id: '2',
        orderId: '2',
        productId: '2',
        name: 'Препарат XYZ 50 mg',
        quantity: 2,
        price: '6250',
        total: '12500',
        createdAt: '2025-06-04T14:30:00Z',
        updatedAt: '2025-06-04T14:30:00Z'
      }
    ]
  },
  {
    id: '3',
    externalId: '1194',
    customerName: 'Сидорова Анна Владимировна',
    customerEmail: 'anna@example.com',
    customerPhone: '+7 921 555 44 33',
    status: 'cancelled',
    total: '3200',
    currency: 'RUB',
    orderDate: '2025-06-03T09:15:00Z',
    createdAt: '2025-06-03T09:15:00Z',
    updatedAt: '2025-06-03T09:15:00Z',
    items: [
      {
        id: '3',
        orderId: '3',
        productId: '3',
        name: 'Витамины D3',
        quantity: 1,
        price: '3200',
        total: '3200',
        createdAt: '2025-06-03T09:15:00Z',
        updatedAt: '2025-06-03T09:15:00Z'
      }
    ]
  }
];

// GET /api/orders
app.get('/api/orders', (req, res) => {
  console.log('📋 Orders request received');

  const response = {
    success: true,
    data: {
      orders: mockOrders,
      pagination: {
        page: 1,
        limit: 1000,
        total: mockOrders.length,
        pages: 1
      }
    }
  };

  res.json(response);
});

// POST /api/sync-orders
app.post('/api/sync-orders', (req, res) => {
  console.log('🔄 Sync orders request received');

  setTimeout(() => {
    res.json({
      success: true,
      imported: mockOrders.length,
      message: 'Orders synced successfully'
    });
  }, 1000);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Orders API: http://localhost:${PORT}/api/orders`);
});
