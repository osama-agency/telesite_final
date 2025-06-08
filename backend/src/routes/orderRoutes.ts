import express from 'express';
import {
  updateOrderStatus,
  updateOrder,
  addOrderComment
} from '../controllers/orderController';

const router = express.Router();

// PUT /api/orders/:id/status - обновить статус заказа
router.put('/orders/:id/status', updateOrderStatus);

// PUT /api/orders/:id - обновить данные заказа
router.put('/orders/:id', updateOrder);

// POST /api/orders/:id/comment - добавить комментарий к заказу
router.post('/orders/:id/comment', addOrderComment);

export default router;
