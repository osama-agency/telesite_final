import { Router } from 'express';
import {
  getProductPriceHistory,
  updateProductCostTRY,
  getFinancialAnalytics,
  bulkUpdatePrices
} from '../controllers/priceController';

const router = Router();

// История цен товара
router.get('/history/:productId', getProductPriceHistory);

// Обновить себестоимость в лирах
router.put('/cost-try/:productId', updateProductCostTRY);

// Финансовая аналитика
router.get('/analytics', getFinancialAnalytics);

// Массовое обновление цен
router.post('/bulk-update', bulkUpdatePrices);

export default router;
