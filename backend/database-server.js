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

    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(400).json({
        success: false,
        error: 'Authorization header is required'
      });
    }

    // Получаем данные с внешнего API Strattera
    const axios = require('axios');
    const apiUrl = 'https://strattera.tgapp.online/api/v1/orders';

    console.log('🌐 Fetching orders from external API...');

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': authorization
      }
    });

    const externalOrders = response.data;
    let importedCount = 0;
    let errorCount = 0;

    console.log(`📦 Received ${externalOrders.length} orders from external API`);

    // Очищаем существующие данные
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});

    // Обрабатываем каждый заказ
    for (const externalOrder of externalOrders) {
      try {
        const totalAmount = parseFloat(externalOrder.total_amount);

        // Парсим дату в формате "05.06.2025 21:31:26"
        const dateString = externalOrder.paid_at || externalOrder.created_at;
        const dateParts = dateString.split(' ');
        const [day, month, year] = dateParts[0].split('.');
        const [hours, minutes, seconds] = dateParts[1].split(':');
        const orderDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        );

        if (isNaN(totalAmount) || isNaN(orderDate.getTime())) {
          errorCount++;
          continue;
        }

        await prisma.order.create({
          data: {
            externalId: externalOrder.id.toString(),
            customerName: externalOrder.user.full_name,
            customerEmail: null,
            customerPhone: null,
            customerCity: externalOrder.user.city,
            customerAddress: externalOrder.user.city,
            bankCard: externalOrder.bank_card,
            bonus: externalOrder.bonus || 0,
            deliveryCost: externalOrder.delivery_cost || 0,
            paidAt: externalOrder.paid_at ? new Date(externalOrder.paid_at.split(' ').map((part, i) => i === 0 ? part.split('.').reverse().join('-') : part).join(' ')) : null,
            shippedAt: externalOrder.shipped_at ? new Date(externalOrder.shipped_at.split(' ').map((part, i) => i === 0 ? part.split('.').reverse().join('-') : part).join(' ')) : null,
            status: externalOrder.status,
            total: totalAmount,
            currency: 'RUB',
            orderDate: orderDate,
            items: {
              create: externalOrder.order_items.filter(item => {
                const itemPrice = parseFloat(item.price);
                return !isNaN(itemPrice) && item.quantity > 0;
              }).map(item => {
                const itemPrice = parseFloat(item.price);
                return {
                  productId: null,
                  name: item.name,
                  quantity: item.quantity,
                  price: itemPrice,
                  total: itemPrice * item.quantity
                };
              })
            }
          }
        });

        importedCount++;

        if (importedCount % 100 === 0) {
          console.log(`✅ Imported ${importedCount} orders...`);
        }

      } catch (orderError) {
        console.error(`❌ Error processing order ${externalOrder.id}:`, orderError.message);
        errorCount++;
      }
    }

    console.log(`🎉 Import completed: ${importedCount} imported, ${errorCount} errors`);

    res.json({
      success: true,
      imported: importedCount,
      errors: errorCount,
      message: `Successfully imported ${importedCount} orders from Strattera API`
    });

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
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
