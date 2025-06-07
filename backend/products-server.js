const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3012;

app.use(cors());
app.use(express.json());

// Mock products data для аналитики закупок
const mockProducts = [
  {
    id: 1,
    productName: 'Atomox 25mg',
    sku: 'ATM-25',
    category: 'Лекарства',
    stockQty: 15,
    averageSales: 8.5,
    salesLast30Days: 255,
    avgSalesPerDay: 8.5,
    daysToZero: 1.8,
    inTransit: 0,
    arrivalDate: null,
    supplierLeadTime: 14,
    minStock: 50,
    recommendedPurchase: 35,
    urgencyLevel: 'critical',
    costPrice: 1200,
    sellingPrice: 1800,
    supplier: 'МедТех',
    lastDeliveryDate: '2025-06-01'
  },
  {
    id: 2,
    productName: 'Strattera 40mg',
    sku: 'STR-40',
    category: 'Лекарства',
    stockQty: 8,
    averageSales: 12.3,
    salesLast30Days: 369,
    avgSalesPerDay: 12.3,
    daysToZero: 0.7,
    inTransit: 20,
    arrivalDate: '2025-06-10',
    supplierLeadTime: 10,
    minStock: 30,
    recommendedPurchase: 22,
    urgencyLevel: 'critical',
    costPrice: 2800,
    sellingPrice: 4200,
    supplier: 'ФармЛогистика',
    lastDeliveryDate: '2025-05-28'
  },
  {
    id: 3,
    productName: 'Concerta 54mg',
    sku: 'CON-54',
    category: 'Лекарства',
    stockQty: 45,
    averageSales: 6.2,
    salesLast30Days: 186,
    avgSalesPerDay: 6.2,
    daysToZero: 7.3,
    inTransit: 10,
    arrivalDate: '2025-06-08',
    supplierLeadTime: 12,
    minStock: 25,
    recommendedPurchase: 0,
    urgencyLevel: 'normal',
    costPrice: 3200,
    sellingPrice: 4800,
    supplier: 'БиоФарм',
    lastDeliveryDate: '2025-06-02'
  },
  {
    id: 4,
    productName: 'Ritalin 10mg',
    sku: 'RIT-10',
    category: 'Лекарства',
    stockQty: 25,
    averageSales: 4.8,
    salesLast30Days: 144,
    avgSalesPerDay: 4.8,
    daysToZero: 5.2,
    inTransit: 0,
    arrivalDate: null,
    supplierLeadTime: 15,
    minStock: 20,
    recommendedPurchase: 15,
    urgencyLevel: 'warning',
    costPrice: 980,
    sellingPrice: 1470,
    supplier: 'МедИмпорт',
    lastDeliveryDate: '2025-05-25'
  },
  {
    id: 5,
    productName: 'Adderall XR 20mg',
    sku: 'ADD-20',
    category: 'Лекарства',
    stockQty: 72,
    averageSales: 3.1,
    salesLast30Days: 93,
    avgSalesPerDay: 3.1,
    daysToZero: 23.2,
    inTransit: 5,
    arrivalDate: '2025-06-15',
    supplierLeadTime: 18,
    minStock: 15,
    recommendedPurchase: 0,
    urgencyLevel: 'normal',
    costPrice: 1850,
    sellingPrice: 2775,
    supplier: 'ГлобалФарм',
    lastDeliveryDate: '2025-05-30'
  },
  {
    id: 6,
    productName: 'Vyvanse 50mg',
    sku: 'VYV-50',
    category: 'Лекарства',
    stockQty: 18,
    averageSales: 7.9,
    salesLast30Days: 237,
    avgSalesPerDay: 7.9,
    daysToZero: 2.3,
    inTransit: 15,
    arrivalDate: '2025-06-12',
    supplierLeadTime: 11,
    minStock: 35,
    recommendedPurchase: 17,
    urgencyLevel: 'critical',
    costPrice: 3600,
    sellingPrice: 5400,
    supplier: 'ЕвроМед',
    lastDeliveryDate: '2025-05-27'
  },
  {
    id: 7,
    productName: 'Модафинил 200mg',
    sku: 'MOD-200',
    category: 'Ноотропы',
    stockQty: 35,
    averageSales: 2.4,
    salesLast30Days: 72,
    avgSalesPerDay: 2.4,
    daysToZero: 14.6,
    inTransit: 0,
    arrivalDate: null,
    supplierLeadTime: 21,
    minStock: 12,
    recommendedPurchase: 0,
    urgencyLevel: 'normal',
    costPrice: 1200,
    sellingPrice: 1800,
    supplier: 'НооТех',
    lastDeliveryDate: '2025-06-03'
  },
  {
    id: 8,
    productName: 'Арипипразол 15mg',
    sku: 'ARI-15',
    category: 'Антипсихотики',
    stockQty: 12,
    averageSales: 5.6,
    salesLast30Days: 168,
    avgSalesPerDay: 5.6,
    daysToZero: 2.1,
    inTransit: 8,
    arrivalDate: '2025-06-09',
    supplierLeadTime: 8,
    minStock: 20,
    recommendedPurchase: 8,
    urgencyLevel: 'critical',
    costPrice: 2200,
    sellingPrice: 3300,
    supplier: 'ПсихоФарм',
    lastDeliveryDate: '2025-05-29'
  }
];

// GET /api/products
app.get('/api/products', (req, res) => {
  console.log('📦 Products request received');

  const { search, category, urgency } = req.query;

  let filteredProducts = [...mockProducts];

  // Фильтр по поиску
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.productName.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower)
    );
  }

  // Фильтр по категории
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(product =>
      product.category === category
    );
  }

  // Фильтр по срочности
  if (urgency && urgency !== 'all') {
    filteredProducts = filteredProducts.filter(product =>
      product.urgencyLevel === urgency
    );
  }

  const response = {
    success: true,
    data: filteredProducts,
    total: filteredProducts.length
  };

  res.json(response);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Products API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
});
