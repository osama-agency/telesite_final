import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

interface ExpenseBreakdown {
  delivery: number;      // Курьеру за доставку
  logistics: number;     // Логистика закупки
  advertising: number;   // Реклама
  other: number;        // Прочие расходы
  total: number;        // Общие расходы
}

interface ProductAnalytics {
  productId: number;
  productName: string;
  stock: number;
  inTransit: number;
  costLira: number;
  costRub: number;
  avgRetailPrice: number;
  avgDailyConsumption: number;
  daysUntilZero: number;
  margin: number;
  marginPercent: number;
  totalSales: number;
  totalRevenue: number;
  expenses: ExpenseBreakdown;
  fullCostPerUnit: number;
}

export class ProductAnalyticsService {
  // Константа для стоимости доставки клиенту
  private static readonly DELIVERY_COST_PER_UNIT = 350; // ₽ за единицу товара

  // Получить текущий курс валюты с буфером
  private static async getCurrentExchangeRate(): Promise<number> {
    try {
      const latestRate = await prisma.exchangeRate.findFirst({
        where: { currency: 'TRY' },
        orderBy: { effectiveDate: 'desc' }
      });

      if (latestRate) {
        return Number(latestRate.rateWithBuffer);
      }

      // Дефолтный курс с буфером 5%
      return 2.1264; // 2.0252 * 1.05
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return 2.1264;
    }
  }

  // Получить расходы по категориям за период
  private static async getExpensesByCategory(from: Date, to: Date): Promise<{[key: string]: number}> {
    try {
      const expenses = await prisma.expense.groupBy({
        by: ['category'],
        where: {
          date: {
            gte: from,
            lte: to
          }
        },
        _sum: {
          amount: true
        }
      });

      const result: {[key: string]: number} = {};
      expenses.forEach(exp => {
        result[exp.category] = Number(exp._sum.amount || 0);
      });

      return result;
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      return {};
    }
  }

  // Получить аналитику по всем товарам
  static async getProductsAnalytics(from: Date, to: Date): Promise<ProductAnalytics[]> {
    try {
      // Получаем все товары
      const products = await prisma.product.findMany({
        where: { isHidden: false }
      });

      // Получаем текущий курс
      const exchangeRate = await this.getCurrentExchangeRate();

      // Получаем расходы по категориям
      const expensesByCategory = await this.getExpensesByCategory(from, to);
      const logisticsCosts = expensesByCategory['Логистика'] || 0;
      const advertisingCosts = expensesByCategory['Реклама'] || 0;
      const otherCosts = expensesByCategory['Прочее'] || 0;

      // Получаем все заказы за период
      const orders = await prisma.order.findMany({
        where: {
          orderDate: {
            gte: from,
            lte: to
          },
          status: {
            notIn: ['cancelled', 'refunded']
          }
        },
        include: {
          items: true
        }
      });

      // Подсчитываем общее количество проданных товаров для распределения расходов
      let totalUnitsSold = 0;
      const productSalesMap = new Map<string, { quantity: number; revenue: number; prices: number[] }>();

      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.name) {
            const existing = productSalesMap.get(item.name) || { quantity: 0, revenue: 0, prices: [] };
            existing.quantity += item.quantity;
            existing.revenue += Number(item.total);
            existing.prices.push(Number(item.price));
            productSalesMap.set(item.name, existing);
            totalUnitsSold += item.quantity;
          }
        });
      });

      // Расчет расходов на единицу товара
      const logisticsPerUnit = totalUnitsSold > 0 ? logisticsCosts / totalUnitsSold : 0;
      const advertisingPerUnit = totalUnitsSold > 0 ? advertisingCosts / totalUnitsSold : 0;
      const otherPerUnit = totalUnitsSold > 0 ? otherCosts / totalUnitsSold : 0;

      // Расчет количества дней в периоде - используем фактические прошедшие дни
      const now = new Date();
      const actualEndDate = new Date(Math.min(to.getTime(), now.getTime()));
      const daysDiff = Math.max(1, Math.ceil((actualEndDate.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));

      console.log(`📅 Backend расчет периода: начало=${from.toISOString().split('T')[0]}, конец=${to.toISOString().split('T')[0]}, фактический конец=${actualEndDate.toISOString().split('T')[0]}, дней=${daysDiff}`);

      // Детальное логирование для отладки
      console.log(`📊 Найдено заказов за период: ${orders.length}`);
      console.log(`📦 Общее количество проданных единиц товара: ${totalUnitsSold}`);

      // Формируем аналитику для каждого товара
      const analytics: ProductAnalytics[] = [];

      for (const product of products) {
        const salesData = productSalesMap.get(product.name) || { quantity: 0, revenue: 0, prices: [] };

        // Детальное логирование для товаров Atominex
        if (product.name.toLowerCase().includes('atominex')) {
          console.log(`🔍 [${product.name}] Данные продаж:`, {
            quantity: salesData.quantity,
            revenue: salesData.revenue,
            pricesCount: salesData.prices.length,
            avgPrice: salesData.prices.length > 0 ? salesData.prices.reduce((a, b) => a + b, 0) / salesData.prices.length : 0,
            periodDays: daysDiff,
            avgDailyConsumption: salesData.quantity / daysDiff
          });
        }

        // Себестоимость в лирах
        const costLira = Number(product.costPriceTRY || 0);

        // Базовая себестоимость в рублях (только закупка)
        const baseCostRub = costLira * exchangeRate;

        // Детализация расходов
        const expenses: ExpenseBreakdown = {
          delivery: this.DELIVERY_COST_PER_UNIT,
          logistics: Math.round(logisticsPerUnit * 100) / 100,
          advertising: Math.round(advertisingPerUnit * 100) / 100,
          other: Math.round(otherPerUnit * 100) / 100,
          total: 0
        };
        expenses.total = expenses.delivery + expenses.logistics + expenses.advertising + expenses.other;

        // Полная себестоимость включая все расходы
        const fullCostPerUnit = baseCostRub + expenses.total;

        // Средняя цена продажи
        const avgRetailPrice = salesData.prices.length > 0
          ? salesData.prices.reduce((a, b) => a + b, 0) / salesData.prices.length
          : Number(product.price || 0);

        // Среднее потребление в день
        const avgDailyConsumption = salesData.quantity / daysDiff;

        // Дней до нуля
        const daysUntilZero = avgDailyConsumption > 0
          ? Math.floor(product.stockQuantity / avgDailyConsumption)
          : 999;

        // Маржа и маржинальность с учетом ПОЛНОЙ себестоимости
        const margin = avgRetailPrice - fullCostPerUnit;
        const marginPercent = fullCostPerUnit > 0 ? (margin / fullCostPerUnit) * 100 : 0;

        analytics.push({
          productId: product.id,
          productName: product.name,
          stock: product.stockQuantity,
          inTransit: product.inTransit,
          costLira,
          costRub: Math.round(baseCostRub * 100) / 100,
          avgRetailPrice: Math.round(avgRetailPrice * 100) / 100,
          avgDailyConsumption: Math.round(avgDailyConsumption * 100) / 100,
          daysUntilZero,
          margin: Math.round(margin * 100) / 100,
          marginPercent: Math.round(marginPercent * 100) / 100,
          totalSales: salesData.quantity,
          totalRevenue: Math.round(salesData.revenue * 100) / 100,
          expenses,
          fullCostPerUnit: Math.round(fullCostPerUnit * 100) / 100
        });
      }

      // Сортируем по маржинальности (убывание)
      analytics.sort((a, b) => b.marginPercent - a.marginPercent);

      return analytics;
    } catch (error) {
      console.error('Error calculating product analytics:', error);
      throw error;
    }
  }

  // Получить аналитику по конкретному товару
  static async getProductAnalytics(productId: number, from: Date, to: Date): Promise<ProductAnalytics | null> {
    const analytics = await this.getProductsAnalytics(from, to);
    return analytics.find(a => a.productId === productId) || null;
  }

  // Обновить курс валюты
  static async updateExchangeRate(rate: number, bufferPercent: number = 5): Promise<void> {
    try {
      const rateWithBuffer = rate * (1 + bufferPercent / 100);

      await prisma.exchangeRate.create({
        data: {
          currency: 'TRY',
          rate: new Decimal(rate),
          rateWithBuffer: new Decimal(rateWithBuffer),
          bufferPercent: new Decimal(bufferPercent),
          source: 'CBR',
          effectiveDate: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      throw error;
    }
  }
}
