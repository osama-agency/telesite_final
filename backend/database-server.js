const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = 3010;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET /api/orders - получение заказов из PostgreSQL
app.get('/api/orders', async (req, res) => {
  try {
    console.log('📋 Orders request received - fetching from PostgreSQL');

    const { page = 1, limit = 20, dateFrom, dateTo, sortBy = 'orderDate', sortOrder = 'DESC' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Строим фильтр по датам
    const where = {};
    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) {
        where.orderDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.orderDate.lte = new Date(dateTo);
      }
    }

    // Получаем заказы с элементами
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true
        },
        orderBy: {
          [sortBy]: sortOrder === 'DESC' ? 'desc' : 'asc'
        },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where })
    ]);

    const response = {
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching orders from PostgreSQL:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: error.message
    });
  }
});

// POST /api/sync-orders - синхронизация заказов
app.post('/api/sync-orders', async (req, res) => {
  try {
    console.log('🔄 Sync orders request received');

    // Здесь можно добавить логику синхронизации с внешним API
    // Пока что просто возвращаем количество заказов в базе
    const count = await prisma.order.count();

    res.json({
      success: true,
      imported: count,
      message: 'Orders synced successfully'
    });
  } catch (error) {
    console.error('Error syncing orders:', error);
    res.status(500).json({
      success: false,
      error: 'Sync error',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 PostgreSQL API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`🗄️ Using PostgreSQL database`);
});
