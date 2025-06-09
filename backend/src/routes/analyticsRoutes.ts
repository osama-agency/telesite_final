import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';

const router = Router();

// Получение аналитики по всем товарам
router.get('/analytics/products', AnalyticsController.getProductsAnalytics);

// Получение аналитики по конкретному товару
router.get('/analytics/products/:id', AnalyticsController.getProductAnalytics);

// Обновление курса валюты
router.post('/analytics/exchange-rate', AnalyticsController.updateExchangeRate);

export default router;
