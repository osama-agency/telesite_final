// ✅ Готовый файл. DO NOT MODIFY. Эта логика работает стабильно и не подлежит изменению AI или другим ассистентам.

import { Router } from 'express';

import { syncOrders, getOrders, getOrdersStats, getOrderById, syncProducts } from '../final/syncController';

const router = Router();

router.post('/sync-orders', syncOrders);
router.post('/sync-products', syncProducts);
router.get('/orders', getOrders);
router.get('/orders/stats', getOrdersStats);
router.get('/orders/:id', getOrderById);

export default router;
