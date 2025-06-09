import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Получить историю цен товара
export const getProductPriceHistory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const priceHistory = await prisma.productPrice.findMany({
      where: {
        productId: parseInt(productId)
      },
      orderBy: {
        effectiveDate: 'desc'
      },
      take: 30 // последние 30 записей
    });

    res.json({
      success: true,
      data: priceHistory
    });
  } catch (error) {
    console.error('❌ Ошибка получения истории цен:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения истории цен'
    });
  }
};

// Обновить себестоимость товара в лирах
export const updateProductCostTRY = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { costPriceTRY, exchangeRate } = req.body;

    const costTRY = parseFloat(costPriceTRY);
    const rate = parseFloat(exchangeRate) || 2.13; // дефолтный курс с буфером
    const costRUB = costTRY * rate;

    // Обновляем товар
    const product = await prisma.product.update({
      where: {
        id: parseInt(productId)
      },
      data: {
        costPriceTRY: costTRY,
        costPrice: costRUB
      }
    });

    // Создаем запись в истории
    await prisma.productPrice.create({
      data: {
        productId: product.id,
        costPriceTRY: costTRY,
        costPriceRUB: costRUB,
        retailPrice: product.price,
        exchangeRate: rate,
        effectiveDate: new Date()
      }
    });

    console.log(`💰 Обновлена себестоимость товара ${product.name}: ${costTRY} ₺ (${costRUB.toFixed(2)} ₽)`);

    res.json({
      success: true,
      data: {
        product,
        costRUB: costRUB.toFixed(2)
      }
    });
  } catch (error) {
    console.error('❌ Ошибка обновления себестоимости:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления себестоимости'
    });
  }
};

// Получить финансовую аналитику по товарам
export const getFinancialAnalytics = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isHidden: false,
        costPriceTRY: {
          not: null
        }
      },
      include: {
        productPrices: {
          orderBy: {
            effectiveDate: 'desc'
          },
          take: 1
        }
      }
    });

    // Получаем заказы за последние 30 дней для расчета оборачиваемости
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        items: true
      }
    });

    // Считаем продажи по товарам
    const salesByProduct = new Map<string, { quantity: number; revenue: number }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.name;
        const current = salesByProduct.get(key) || { quantity: 0, revenue: 0 };
        current.quantity += item.quantity;
        current.revenue += parseFloat(item.total.toString());
        salesByProduct.set(key, current);
      });
    });

    // Формируем аналитику
    const analytics = products.map(product => {
      const sales = salesByProduct.get(product.name) || { quantity: 0, revenue: 0 };
      const costTRY = product.costPriceTRY ? parseFloat(product.costPriceTRY.toString()) : 0;
      const costRUB = product.costPrice ? parseFloat(product.costPrice.toString()) : 0;
      const retailPrice = parseFloat(product.price.toString());

      // Расчет маржинальности
      const margin = retailPrice - costRUB;
      const marginPercent = costRUB > 0 ? (margin / retailPrice) * 100 : 0;

      // ROI (Return on Investment)
      const roi = costRUB > 0 ? ((retailPrice - costRUB) / costRUB) * 100 : 0;

      // Оборачиваемость (раз в месяц)
      const turnover = product.stockQuantity > 0 ? sales.quantity / product.stockQuantity : 0;

      // Прибыль за период
      const profit = sales.quantity * margin;

      return {
        id: product.id,
        name: product.name,
        costPriceTRY: costTRY,
        costPriceRUB: costRUB,
        retailPrice: retailPrice,
        margin: margin,
        marginPercent: marginPercent.toFixed(2),
        roi: roi.toFixed(2),
        stockQuantity: product.stockQuantity,
        salesQuantity: sales.quantity,
        salesRevenue: sales.revenue,
        turnover: turnover.toFixed(2),
        profit: profit.toFixed(2),
        stockValue: (product.stockQuantity * costRUB).toFixed(2),
        potentialRevenue: (product.stockQuantity * retailPrice).toFixed(2)
      };
    });

    // Сортируем по прибыльности
    analytics.sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit));

    // Общая статистика
    const totalStats = {
      totalStockValue: analytics.reduce((sum, p) => sum + parseFloat(p.stockValue), 0).toFixed(2),
      totalPotentialRevenue: analytics.reduce((sum, p) => sum + parseFloat(p.potentialRevenue), 0).toFixed(2),
      totalSalesRevenue: analytics.reduce((sum, p) => sum + p.salesRevenue, 0).toFixed(2),
      totalProfit: analytics.reduce((sum, p) => sum + parseFloat(p.profit), 0).toFixed(2),
      averageMargin: (analytics.reduce((sum, p) => sum + parseFloat(p.marginPercent), 0) / analytics.length).toFixed(2),
      averageROI: (analytics.reduce((sum, p) => sum + parseFloat(p.roi), 0) / analytics.length).toFixed(2)
    };

    res.json({
      success: true,
      data: {
        products: analytics,
        stats: totalStats,
        period: '30 дней'
      }
    });
  } catch (error) {
    console.error('❌ Ошибка получения финансовой аналитики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения финансовой аналитики'
    });
  }
};

// Массовое обновление цен из Excel/CSV
export const bulkUpdatePrices = async (req: Request, res: Response) => {
  try {
    const { prices, exchangeRate } = req.body;
    const rate = parseFloat(exchangeRate) || 2.13;

    let updatedCount = 0;
    const errors: string[] = [];

    for (const item of prices) {
      try {
        const product = await prisma.product.findFirst({
          where: {
            name: {
              contains: item.name,
              mode: 'insensitive'
            }
          }
        });

        if (product) {
          const costTRY = parseFloat(item.costPriceTRY);
          const costRUB = costTRY * rate;

          await prisma.product.update({
            where: { id: product.id },
            data: {
              costPriceTRY: costTRY,
              costPrice: costRUB
            }
          });

          await prisma.productPrice.create({
            data: {
              productId: product.id,
              costPriceTRY: costTRY,
              costPriceRUB: costRUB,
              retailPrice: product.price,
              exchangeRate: rate,
              effectiveDate: new Date()
            }
          });

          updatedCount++;
        } else {
          errors.push(`Товар не найден: ${item.name}`);
        }
      } catch (error) {
        errors.push(`Ошибка для ${item.name}: ${error}`);
      }
    }

    res.json({
      success: true,
      data: {
        updated: updatedCount,
        total: prices.length,
        errors: errors
      }
    });
  } catch (error) {
    console.error('❌ Ошибка массового обновления цен:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка массового обновления цен'
    });
  }
};
