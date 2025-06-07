import express from 'express';
import { getProducts, getProductById, updateProductCost, hideProduct } from '../controllers/productController';

const router = express.Router();

// GET /api/products - получить все товары
router.get('/products', getProducts);

// GET /api/products/:id - получить товар по ID
router.get('/products/:id', getProductById);

// PUT /api/products/:id/cost - обновить себестоимость товара
router.put('/products/:id/cost', updateProductCost);

// PATCH /api/products/:id/hide - скрыть/показать товар
router.patch('/products/:id/hide', hideProduct);

export default router;
