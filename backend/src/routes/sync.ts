import { Router } from 'express';

import { syncOrders, getOrders, getOrdersStats, getOrderById } from '../controllers/syncController';

const router = Router();

router.post('/sync-orders', syncOrders);
router.get('/orders', getOrders);
router.get('/orders/stats', getOrdersStats);
router.get('/orders/:id', getOrderById);

export default router;
