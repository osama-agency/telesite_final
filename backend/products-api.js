const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3011;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// GET /api/products - получить все товары
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Запрос товаров из базы данных');

    const products = await prisma.product.findMany({
      where: {
        price: {
          not: null
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Найдено ${products.length} товаров`);

    // Преобразуем данные в формат для аналитики закупок
    const analyticsProducts = products.map(product => {
      const stockQuantity = product.stockQuantity || 0;
      const avgSalesPerDay = 2.5; // среднее потребление
      const daysToZero = stockQuantity / avgSalesPerDay;
      const minStock = Math.max(Math.floor(stockQuantity * 0.3), 5);
      const toPurchase = stockQuantity < minStock ? minStock - stockQuantity + 7 : 0; // +7 дней запаса

      // Определяем уровень срочности
      let urgencyLevel = 'normal';
      if (daysToZero <= 3) urgencyLevel = 'critical';
      else if (daysToZero <= 7) urgencyLevel = 'warning';

      return {
        id: product.id,
        externalId: product.externalId,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price.toString()),
        costPrice: product.costPrice ? parseFloat(product.costPrice.toString()) : null,
        stockQuantity: stockQuantity,
        stock_quantity: stockQuantity, // для совместимости
        brand: product.brand,
        category: product.brand, // используем бренд как категорию
        mainIngredient: product.mainIngredient,
        main_ingredient: product.mainIngredient, // для совместимости
        dosageForm: product.dosageForm,
        dosage_form: product.dosageForm, // для совместимости
        packageQuantity: product.packageQuantity,
        package_quantity: product.packageQuantity, // для совместимости
        weight: product.weight,

        // Рассчитанные поля для аналитики
        avgSalesPerDay,
        daysToZero: Math.round(daysToZero * 10) / 10,
        minStock,
        toPurchase,
        urgencyLevel,
        salesLast30Days: Math.floor(Math.random() * 50) + 10, // временно случайные

        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    res.json({
      success: true,
      data: analyticsProducts,
      count: analyticsProducts.length
    });

  } catch (error) {
    console.error('❌ Ошибка получения товаров:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товаров'
    });
  }
});

// GET /api/products/:id - получить товар по ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('❌ Ошибка получения товара:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товара'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Products API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
});
