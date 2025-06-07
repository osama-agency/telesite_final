import { Router } from 'express';
import { getCurrencyRates, forceUpdateCurrencyRates } from '../controllers/currencyController';

const router = Router();

// GET /api/currency/rates - получить актуальные курсы валют
router.get('/rates', getCurrencyRates);

// POST /api/currency/refresh - принудительное обновление курсов (для админов)
router.post('/refresh', forceUpdateCurrencyRates);

export default router;
