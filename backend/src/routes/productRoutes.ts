import express from 'express';
import {
  getProducts,
  getProductById,
  updateProductCost,
  hideProduct,
  hideProductByName,
  getHiddenProducts,
  updateProductStock,
  updateProductPrice,
  updateProductAnalytics
} from '../controllers/productController';

const router = express.Router();

// GET /api/products - получить все товары
router.get('/products', getProducts);

// GET /api/products/hidden - получить список скрытых товаров
router.get('/products/hidden', getHiddenProducts);

// GET /api/products/:id - получить товар по ID
router.get('/products/:id', getProductById);

// PUT /api/products/:id/cost - обновить себестоимость товара
router.put('/products/:id/cost', updateProductCost);

// PUT /api/products/:id/stock - обновить остаток товара
router.put('/products/:id/stock', updateProductStock);

// PUT /api/products/:id/price - обновить цену товара
router.put('/products/:id/price', updateProductPrice);

// PUT /api/products/:id/analytics - обновить аналитические данные товара
router.put('/products/:id/analytics', updateProductAnalytics);

// PATCH /api/products/:id/hide - скрыть/показать товар по ID
router.patch('/products/:id/hide', hideProduct);

// POST /api/products/hide - скрыть/показать товар по имени
router.post('/products/hide', hideProductByName);

export default router;
