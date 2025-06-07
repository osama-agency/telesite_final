const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3012;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data - в реальном проекте это будет база данных
let products = [
  {
    id: 1,
    name: "Attex 10 mg",
    stockQuantity: 46,
    avgDailySales30d: 2.3,
    daysToZero: 20,
    lastPurchaseDate: "2024-01-15",
    recommendedQty: 15,
    trend: "STABLE",
    inTransit: 5,
    deliveryDays: 14,
    minStock: 10,
    price: 120.50,
    costPrice: 85.00
  },
  {
    id: 2,
    name: "Atominex 40 mg",
    stockQuantity: 59,
    avgDailySales30d: 1.8,
    daysToZero: 33,
    lastPurchaseDate: "2024-01-10",
    recommendedQty: 0,
    trend: "GROWING",
    inTransit: 12,
    deliveryDays: 14,
    minStock: 8,
    price: 245.00,
    costPrice: 180.00
  },
  {
    id: 3,
    name: "Risperdal 1 Mg/ml сироп",
    stockQuantity: 3,
    avgDailySales30d: 0.5,
    daysToZero: 6,
    lastPurchaseDate: "2024-01-05",
    recommendedQty: 20,
    trend: "FALLING",
    inTransit: 0,
    deliveryDays: 21,
    minStock: 5,
    price: 890.00,
    costPrice: 650.00
  }
];

// Функция расчета аналитики товаров
const calculateProductAnalytics = (product) => {
  // 1. Расчет дней до нуля остатков
  const daysToZero = product.avgDailySales30d > 0
    ? Math.ceil(product.stockQuantity / product.avgDailySales30d)
    : 999;

  // 2. Расчет рекомендуемого количества для закупки
  // Формула: (средние продажи * дни доставки + минимальный запас) - текущий остаток - в пути
  const safetyStock = product.minStock || 5;
  const deliveryNeed = Math.ceil(product.avgDailySales30d * product.deliveryDays);
  const totalNeed = deliveryNeed + safetyStock;
  const recommendedQty = Math.max(0, totalNeed - product.stockQuantity - product.inTransit);

  // 3. Определение тренда (упрощенная версия)
  const criticalLevel = product.deliveryDays || 14;
  let urgencyLevel = 'normal';

  if (daysToZero <= 7) {
    urgencyLevel = 'critical';
  } else if (daysToZero <= criticalLevel) {
    urgencyLevel = 'warning';
  }

  return {
    ...product,
    daysToZero,
    recommendedQty,
    urgencyLevel,
    needsPurchase: recommendedQty > 0,
    criticalStock: daysToZero < criticalLevel
  };
};

// API Routes

// Получить аналитику по всем товарам
app.get('/api/analytics/products', (req, res) => {
  console.log('📊 Запрос аналитики по товарам');

  try {
    const analyticsData = products.map(calculateProductAnalytics);

    // Фильтры
    const { filter, minDays, maxDays } = req.query;

    let filteredData = analyticsData;

    if (filter === 'critical') {
      filteredData = analyticsData.filter(p => p.criticalStock);
    } else if (filter === 'needsPurchase') {
      filteredData = analyticsData.filter(p => p.needsPurchase);
    } else if (filter === 'lowStock') {
      filteredData = analyticsData.filter(p => p.daysToZero < 14);
    }

    if (minDays) {
      filteredData = filteredData.filter(p => p.daysToZero >= parseInt(minDays));
    }

    if (maxDays) {
      filteredData = filteredData.filter(p => p.daysToZero <= parseInt(maxDays));
    }

    const summary = {
      totalProducts: analyticsData.length,
      criticalProducts: analyticsData.filter(p => p.criticalStock).length,
      needsPurchase: analyticsData.filter(p => p.needsPurchase).length,
      totalRecommendedQty: analyticsData.reduce((sum, p) => sum + p.recommendedQty, 0),
      averageDaysToZero: Math.round(
        analyticsData.reduce((sum, p) => sum + p.daysToZero, 0) / analyticsData.length
      )
    };

    res.json({
      success: true,
      data: filteredData,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка при получении аналитики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении аналитики товаров'
    });
  }
});

// Получить аналитику по конкретному товару
app.get('/api/analytics/products/:id', (req, res) => {
  console.log(`📊 Запрос аналитики по товару ID: ${req.params.id}`);

  try {
    const product = products.find(p => p.id === parseInt(req.params.id));

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    const analytics = calculateProductAnalytics(product);

    // Добавляем детальную аналитику
    const detailedAnalytics = {
      ...analytics,
      calculations: {
        dailySalesAvg: product.avgDailySales30d,
        daysToZeroCalc: `${product.stockQuantity} ÷ ${product.avgDailySales30d} = ${analytics.daysToZero} дней`,
        recommendedCalc: `(${product.avgDailySales30d} × ${product.deliveryDays} + ${product.minStock}) - ${product.stockQuantity} - ${product.inTransit} = ${analytics.recommendedQty}`,
        safetyStockDays: Math.ceil(product.minStock / product.avgDailySales30d),
        turnoverRate: Math.round((product.avgDailySales30d * 30) / product.stockQuantity * 100) / 100
      }
    };

    res.json({
      success: true,
      data: detailedAnalytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка при получении аналитики товара:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении аналитики товара'
    });
  }
});

// Обновить данные аналитики (cron endpoint)
app.post('/api/analytics/refresh', async (req, res) => {
  console.log('🔄 Обновление аналитики товаров...');

  try {
    // Имитируем обновление данных продаж из внешнего API
    const updatedProducts = products.map(product => {
      // Симуляция новых данных продаж
      const salesFluctuation = (Math.random() - 0.5) * 0.4; // ±20%
      const newAvgSales = Math.max(0.1, product.avgDailySales30d * (1 + salesFluctuation));

      // Определение тренда
      let trend = 'STABLE';
      if (newAvgSales > product.avgDailySales30d * 1.1) {
        trend = 'GROWING';
      } else if (newAvgSales < product.avgDailySales30d * 0.9) {
        trend = 'FALLING';
      }

      return {
        ...product,
        avgDailySales30d: Math.round(newAvgSales * 100) / 100,
        trend,
        lastUpdated: new Date().toISOString()
      };
    });

    products = updatedProducts;

    const analytics = products.map(calculateProductAnalytics);

    console.log('✅ Аналитика обновлена успешно');

    res.json({
      success: true,
      message: 'Аналитика товаров обновлена',
      updatedCount: products.length,
      timestamp: new Date().toISOString(),
      summary: {
        critical: analytics.filter(p => p.criticalStock).length,
        needsPurchase: analytics.filter(p => p.needsPurchase).length
      }
    });
  } catch (error) {
    console.error('❌ Ошибка при обновлении аналитики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при обновлении аналитики'
    });
  }
});

// Получить товары, которые скоро закончатся
app.get('/api/analytics/products/low-stock', (req, res) => {
  console.log('⚠️ Запрос товаров с низким остатком');

  try {
    const threshold = parseInt(req.query.days) || 14;
    const analyticsData = products.map(calculateProductAnalytics);
    const lowStockProducts = analyticsData.filter(p => p.daysToZero < threshold);

    res.json({
      success: true,
      data: lowStockProducts,
      threshold,
      count: lowStockProducts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка при получении товаров с низким остатком:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении данных'
    });
  }
});

// Получить рекомендации по закупке
app.get('/api/analytics/purchase-recommendations', (req, res) => {
  console.log('💰 Запрос рекомендаций по закупке');

  try {
    const analyticsData = products.map(calculateProductAnalytics);
    const recommendations = analyticsData
      .filter(p => p.recommendedQty > 0)
      .map(product => ({
        productId: product.id,
        productName: product.name,
        currentStock: product.stockQuantity,
        inTransit: product.inTransit,
        recommendedQty: product.recommendedQty,
        estimatedCost: product.recommendedQty * product.costPrice,
        urgency: product.urgencyLevel,
        daysToZero: product.daysToZero,
        reason: product.daysToZero < 7
          ? 'Критически низкий остаток'
          : product.daysToZero < 14
          ? 'Предупреждение о низком остатке'
          : 'Плановая закупка'
      }))
      .sort((a, b) => a.daysToZero - b.daysToZero);

    const totalCost = recommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0);
    const totalQty = recommendations.reduce((sum, rec) => sum + rec.recommendedQty, 0);

    res.json({
      success: true,
      data: recommendations,
      summary: {
        totalItems: recommendations.length,
        totalQuantity: totalQty,
        totalEstimatedCost: Math.round(totalCost * 100) / 100,
        criticalItems: recommendations.filter(r => r.urgency === 'critical').length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка при получении рекомендаций:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении рекомендаций'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Analytics Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('🚀 Analytics Service запущен на http://localhost:' + PORT);
  console.log('📊 Аналитика товаров: http://localhost:' + PORT + '/api/analytics/products');
  console.log('⚠️ Товары с низким остатком: http://localhost:' + PORT + '/api/analytics/products/low-stock');
  console.log('💰 Рекомендации по закупке: http://localhost:' + PORT + '/api/analytics/purchase-recommendations');
  console.log('🔄 Обновление данных: POST http://localhost:' + PORT + '/api/analytics/refresh');
});
