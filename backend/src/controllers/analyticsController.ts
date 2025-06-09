import { Request, Response } from 'express';
import { ProductAnalyticsService } from '../services/ProductAnalyticsService';

export class AnalyticsController {
  // GET /api/analytics/products
  static async getProductsAnalytics(req: Request, res: Response) {
    try {
      const { from, to } = req.query;

      // Валидация дат
      if (!from || !to) {
        return res.status(400).json({
          success: false,
          error: 'Parameters "from" and "to" are required (format: YYYY-MM-DD)'
        });
      }

      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      // Проверка корректности дат
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      if (fromDate > toDate) {
        return res.status(400).json({
          success: false,
          error: 'From date must be before or equal to To date'
        });
      }

      // Получаем аналитику
      const analytics = await ProductAnalyticsService.getProductsAnalytics(fromDate, toDate);

      // Добавляем сводную информацию
      const summary = {
        totalProducts: analytics.length,
        avgMarginPercent: analytics.length > 0
          ? Math.round(analytics.reduce((sum, p) => sum + p.marginPercent, 0) / analytics.length * 100) / 100
          : 0,
        totalRevenue: Math.round(analytics.reduce((sum, p) => sum + p.totalRevenue, 0) * 100) / 100,
        totalMargin: Math.round(analytics.reduce((sum, p) => sum + (p.margin * p.totalSales), 0) * 100) / 100,
        criticalProducts: analytics.filter(p => p.daysUntilZero <= 7).length,
        topPerformers: analytics.slice(0, 5).map(p => ({
          name: p.productName,
          marginPercent: p.marginPercent
        }))
      };

      res.json({
        success: true,
        data: {
          period: {
            from: fromDate.toISOString().split('T')[0],
            to: toDate.toISOString().split('T')[0]
          },
          summary,
          products: analytics
        }
      });
    } catch (error) {
      console.error('Error in getProductsAnalytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate product analytics'
      });
    }
  }

  // GET /api/analytics/products/:id
  static async getProductAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { from, to } = req.query;

      // Валидация
      if (!from || !to) {
        return res.status(400).json({
          success: false,
          error: 'Parameters "from" and "to" are required (format: YYYY-MM-DD)'
        });
      }

      const productId = parseInt(id);
      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid product ID'
        });
      }

      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      const analytics = await ProductAnalyticsService.getProductAnalytics(productId, fromDate, toDate);

      if (!analytics) {
        return res.status(404).json({
          success: false,
          error: 'Product not found or no data available'
        });
      }

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error in getProductAnalytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get product analytics'
      });
    }
  }

  // POST /api/analytics/exchange-rate
  static async updateExchangeRate(req: Request, res: Response) {
    try {
      const { rate, bufferPercent = 5 } = req.body;

      if (!rate || rate <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid rate is required'
        });
      }

      await ProductAnalyticsService.updateExchangeRate(rate, bufferPercent);

      res.json({
        success: true,
        data: {
          rate,
          bufferPercent,
          rateWithBuffer: rate * (1 + bufferPercent / 100)
        }
      });
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update exchange rate'
      });
    }
  }
}
