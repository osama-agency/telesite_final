import { Router } from 'express'

import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchaseStatus
} from '../controllers/purchaseController'

const router = Router()

// POST /api/purchases - создание новой закупки
router.post('/', createPurchase)

// GET /api/purchases - получение списка закупок
router.get('/', getPurchases)

// GET /api/purchases/:id - получение деталей закупки
router.get('/:id', getPurchaseById)

// PATCH /api/purchases/:id/status - обновление статуса закупки
router.patch('/:id/status', updatePurchaseStatus)

export default router
