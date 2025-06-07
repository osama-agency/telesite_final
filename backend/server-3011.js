const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3011;

app.use(cors());
app.use(express.json());

// Внешний API конфигурация
const EXTERNAL_API = {
  BASE_URL: 'https://strattera.tgapp.online/api/v1',
  AUTH_TOKEN: '8cM9wVBrY3p56k4L1VBpIBwOsw'
};

// Кэш для заказов из внешнего API
let cachedOrders = [];
let lastOrdersFetchTime = 0;
const ORDERS_CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Функция синхронизации заказов с внешним API
async function syncOrdersFromExternalAPI() {
  try {
    console.log('🔄 Синхронизация заказов с внешним API...');

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${EXTERNAL_API.BASE_URL}/orders`, {
      headers: {
        'Authorization': EXTERNAL_API.AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const externalOrders = await response.json();
    console.log(`📦 Получено ${externalOrders.length} заказов из внешнего API`);

    // Преобразуем внешние заказы в наш формат
    cachedOrders = externalOrders.map(order => ({
      id: order.id.toString(),
      externalId: order.id.toString(),
      customerName: order.user?.full_name?.trim() || 'Не указан',
      customerEmail: `user${order.user?.id}@customer.com`,
      customerPhone: 'Не указан',
      customerCity: order.user?.city || 'Не указан',
      bankCard: order.bank_card || 'Не указан',
      status: order.status || 'processing',
      total: order.total_amount || '0',
      currency: 'RUB',
      bonus: order.bonus || 0,
      deliveryCost: order.delivery_cost || 0,
      orderDate: order.created_at || new Date().toISOString(),
      paidAt: order.paid_at || null,
      shippedAt: order.shipped_at || null,
      createdAt: order.created_at || new Date().toISOString(),
      updatedAt: order.created_at || new Date().toISOString(),
      items: order.order_items?.map((item, index) => ({
        id: `${order.id}_${index}`,
        orderId: order.id.toString(),
        productId: index.toString(),
        name: item.name || 'Неизвестный товар',
        quantity: item.quantity || 1,
        price: item.price || '0',
        total: (parseFloat(item.price || '0') * (item.quantity || 1)).toString(),
        createdAt: order.created_at || new Date().toISOString(),
        updatedAt: order.created_at || new Date().toISOString()
      })) || []
    }));

    lastOrdersFetchTime = Date.now();
    console.log(`✅ Синхронизация завершена, обработано ${cachedOrders.length} заказов`);

    return cachedOrders;
  } catch (error) {
    console.error('❌ Ошибка синхронизации заказов:', error);
    // При ошибке возвращаем существующий кэш или пустой массив
    return cachedOrders.length > 0 ? cachedOrders : [];
  }
}

// Mock orders data (используется как fallback)
const mockOrders = [
  {
    id: '1',
    externalId: '1192',
    customerName: 'Островский Данил Игоревич',
    customerEmail: 'danil@example.com',
    customerPhone: '+7 921 123 45 67',
    status: 'shipped',
    total: '6000',
    currency: 'RUB',
    orderDate: '2025-06-05T10:00:00Z',
    createdAt: '2025-06-05T10:00:00Z',
    updatedAt: '2025-06-05T10:00:00Z',
    items: [
      {
        id: '1',
        orderId: '1',
        productId: '1',
        name: 'Atomineх 25 mg',
        quantity: 1,
        price: '6000',
        total: '6000',
        createdAt: '2025-06-05T10:00:00Z',
        updatedAt: '2025-06-05T10:00:00Z'
      }
    ]
  }
];

// GET /api/orders
app.get('/api/orders', async (req, res) => {
  try {
    console.log('📋 Orders request received');

    // Проверяем, нужно ли обновить кэш заказов
    const now = Date.now();
    if (cachedOrders.length === 0 || (now - lastOrdersFetchTime) > ORDERS_CACHE_DURATION) {
      await syncOrdersFromExternalAPI();
    }

    // Используем кэшированные заказы из внешнего API или fallback к mock данным
    const ordersToReturn = cachedOrders.length > 0 ? cachedOrders : mockOrders;

    const response = {
      success: true,
      data: {
        orders: ordersToReturn,
        pagination: {
          page: 1,
          limit: 1000,
          total: ordersToReturn.length,
          pages: 1
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Ошибка получения заказов:', error);

    // В случае ошибки возвращаем mock данные
    const response = {
      success: true,
      data: {
        orders: mockOrders,
        pagination: {
          page: 1,
          limit: 1000,
          total: mockOrders.length,
          pages: 1
        }
      }
    };

    res.json(response);
  }
});

// GET /api/orders/:id - получение конкретного заказа по ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(`🔍 Запрос заказа по ID: ${orderId}`);

    // Проверяем, нужно ли обновить кэш заказов
    const now = Date.now();
    if (cachedOrders.length === 0 || (now - lastOrdersFetchTime) > ORDERS_CACHE_DURATION) {
      await syncOrdersFromExternalAPI();
    }

    // Используем кэшированные заказы из внешнего API или fallback к mock данным
    const ordersToSearch = cachedOrders.length > 0 ? cachedOrders : mockOrders;

    // Ищем заказ по ID
    const order = ordersToSearch.find(o => o.id === orderId || o.externalId === orderId);

    if (!order) {
      console.log(`❌ Заказ ${orderId} не найден`);

      return res.status(404).json({
        success: false,
        error: 'Заказ не найден',
        message: `Заказ с ID ${orderId} не существует`
      });
    }

    console.log(`✅ Заказ ${orderId} найден: ${order.customerName}`);

    const response = {
      success: true,
      data: {
        order: order
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Ошибка получения заказа по ID:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения заказа',
      message: error.message
    });
  }
});

// POST /api/sync-orders
app.post('/api/sync-orders', async (req, res) => {
  try {
    console.log('🔄 Sync orders request received');

    const syncedOrders = await syncOrdersFromExternalAPI();

    res.json({
      success: true,
      imported: syncedOrders.length,
      message: 'Orders synced successfully from external API',
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка синхронизации заказов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка синхронизации заказов',
      message: error.message
    });
  }
});

// Кэш курсов валют
let cachedRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 минут
const BUFFER_PERCENT = 0.05; // 5% буфер

// Функция получения курса от ЦБ РФ
async function fetchCurrencyFromCBR() {
  try {
    console.log('🏦 Запрос курса лиры от ЦБ РФ...');

    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

        // Курс турецкой лиры (TRY)
    const tryRate = data.Valute?.TRY;
    if (!tryRate) {
      throw new Error('TRY currency not found in CBR response');
    }

    // ЦБ дает курс за tryRate.Nominal турецких лир (обычно 10)
    const rubPerTry = tryRate.Value / tryRate.Nominal;
    console.log(`💱 Курс ЦБ: 1 ₺ = ${rubPerTry.toFixed(4)} ₽ (за ${tryRate.Nominal} лир: ${tryRate.Value} ₽)`);

    return rubPerTry;
  } catch (error) {
    console.error('❌ Ошибка получения курса от ЦБ:', error);
    // Fallback к дефолтному курсу при ошибке
    return 3.45;
  }
}

// Обновление кэша курсов
async function updateCurrencyCache() {
  try {
    const currentRate = await fetchCurrencyFromCBR();
    const currentWithBuffer = currentRate * (1 + BUFFER_PERCENT);
    const average30Days = currentRate * (1 + (Math.random() - 0.5) * 0.1); // имитация

    cachedRates = {
      current: currentRate,
      currentWithBuffer: currentWithBuffer,
      average30Days: average30Days,
      buffer: BUFFER_PERCENT,
      lastUpdate: new Date().toISOString(),
      source: 'ЦБ РФ'
    };

    lastFetchTime = Date.now();

    console.log(`✅ Курсы обновлены:
      - Текущий: ${currentRate.toFixed(4)} ₽/₺
      - С буфером (+5%): ${currentWithBuffer.toFixed(4)} ₽/₺
      - Средний за 30 дней: ${average30Days.toFixed(4)} ₽/₺`);

  } catch (error) {
    console.error('❌ Ошибка обновления кэша курсов:', error);
  }
}

// API валютных курсов
app.get('/api/currency/rates', async (req, res) => {
  try {
    console.log('💰 Запрос курсов валют');

    // Проверяем, нужно ли обновить кэш
    const now = Date.now();
    if (!cachedRates || (now - lastFetchTime) > CACHE_DURATION) {
      await updateCurrencyCache();
    }

    if (!cachedRates) {
      // Если кэш все еще пустой, возвращаем дефолтные значения
      cachedRates = {
        current: 3.45,
        currentWithBuffer: 3.45 * (1 + BUFFER_PERCENT),
        average30Days: 3.42,
        buffer: BUFFER_PERCENT,
        lastUpdate: new Date().toISOString(),
        source: 'Fallback'
      };
    }

    res.json({
      success: true,
      data: {
        current: parseFloat(cachedRates.current.toFixed(4)),
        currentWithBuffer: parseFloat(cachedRates.currentWithBuffer.toFixed(4)),
        average30Days: parseFloat(cachedRates.average30Days.toFixed(4)),
        buffer: cachedRates.buffer,
        lastUpdate: cachedRates.lastUpdate,
        source: cachedRates.source,
        nextUpdate: new Date(lastFetchTime + CACHE_DURATION).toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения курсов валют:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения курсов валют'
    });
  }
});

// Принудительное обновление курсов
app.post('/api/currency/refresh', async (req, res) => {
  try {
    console.log('🔄 Принудительное обновление курсов...');
    await updateCurrencyCache();

    res.json({
      success: true,
      message: 'Курсы валют успешно обновлены',
      data: cachedRates
    });

  } catch (error) {
    console.error('❌ Ошибка принудительного обновления курсов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления курсов валют'
    });
  }
});

// В памяти храним историю цен товаров
let productPrices = {};

// В памяти храним состояние скрытых товаров
let hiddenProducts = new Set(); // Названия скрытых товаров

// В памяти храним историю закупок
let purchaseHistory = [];
let purchaseIdCounter = 1;

// POST /api/prices/:productName - сохранение цены товара
app.post('/api/prices/:productName', (req, res) => {
  try {
    const productName = decodeURIComponent(req.params.productName);
    const priceData = req.body;

    console.log(`💰 Сохранение цены товара: ${productName}`);

    // Сохраняем в память (в реальном проекте это была бы база данных)
    productPrices[productName] = {
      ...priceData,
      savedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Цена товара сохранена',
      productName: productName,
      data: productPrices[productName]
    });

  } catch (error) {
    console.error('❌ Ошибка сохранения цены:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сохранения цены товара'
    });
  }
});

// GET /api/prices/:productName - получение цены товара
app.get('/api/prices/:productName', (req, res) => {
  try {
    const productName = decodeURIComponent(req.params.productName);
    const priceData = productPrices[productName];

    if (!priceData) {
      return res.status(404).json({
        success: false,
        message: 'Цена товара не найдена'
      });
    }

    res.json({
      success: true,
      data: priceData
    });

  } catch (error) {
    console.error('❌ Ошибка получения цены:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения цены товара'
    });
  }
});

// POST /api/products/hide - скрыть/показать товар по названию
app.post('/api/products/hide', (req, res) => {
  try {
    const { productName, isHidden } = req.body;

    console.log(`👁️ ${isHidden ? 'Скрытие' : 'Показ'} товара: ${productName}`);

    if (isHidden) {
      hiddenProducts.add(productName);
    } else {
      hiddenProducts.delete(productName);
    }

    res.json({
      success: true,
      message: `Товар "${productName}" ${isHidden ? 'скрыт' : 'показан'}`,
      productName: productName,
      isHidden: isHidden
    });

  } catch (error) {
    console.error('❌ Ошибка скрытия товара:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка скрытия товара'
    });
  }
});

// GET /api/products/hidden - получить список скрытых товаров
app.get('/api/products/hidden', (req, res) => {
  try {
    console.log('📋 Запрос списка скрытых товаров');

    res.json({
      success: true,
      hiddenProducts: Array.from(hiddenProducts)
    });

  } catch (error) {
    console.error('❌ Ошибка получения скрытых товаров:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения скрытых товаров'
    });
  }
});

// API для управления закупками

// POST /api/purchases - создать новую закупку
app.post('/api/purchases', (req, res) => {
  try {
    const { supplier, items, totalAmount, expectedDeliveryDate, comments, priority } = req.body;

    console.log(`📦 Создание новой закупки от поставщика: ${supplier}`);

    const newPurchase = {
      id: purchaseIdCounter++,
      supplier: supplier || 'Неизвестный поставщик',
      items: items || [],
      totalAmount: totalAmount || 0,
      expectedDeliveryDate: expectedDeliveryDate,
      comments: comments || '',
      priority: priority || 'normal',
      status: 'создана',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    purchaseHistory.push(newPurchase);

    console.log(`✅ Закупка создана с ID: ${newPurchase.id}, товаров: ${items?.length || 0}, сумма: ${totalAmount || 0} ₽`);

    res.json({
      success: true,
      message: 'Закупка успешно создана',
      data: newPurchase
    });

  } catch (error) {
    console.error('❌ Ошибка создания закупки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания закупки'
    });
  }
});

// GET /api/purchases - получить список всех закупок
app.get('/api/purchases', (req, res) => {
  try {
    console.log('📋 Запрос списка закупок');

    // Сортируем по дате создания (новые первыми)
    const sortedPurchases = purchaseHistory.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      data: sortedPurchases,
      total: purchaseHistory.length
    });

  } catch (error) {
    console.error('❌ Ошибка получения закупок:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения списка закупок'
    });
  }
});

// GET /api/purchases/:id - получить детали конкретной закупки
app.get('/api/purchases/:id', (req, res) => {
  try {
    const purchaseId = parseInt(req.params.id);
    console.log(`📖 Запрос деталей закупки ID: ${purchaseId}`);

    const purchase = purchaseHistory.find(p => p.id === purchaseId);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Закупка не найдена'
      });
    }

    res.json({
      success: true,
      data: purchase
    });

  } catch (error) {
    console.error('❌ Ошибка получения деталей закупки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения деталей закупки'
    });
  }
});

// GET /api/products - получение списка товаров
app.get('/api/products', async (req, res) => {
  try {
    console.log('🛍️ Запрос списка товаров для закупок...')

    // Проверяем кэш заказов, если пустой - загружаем
    const now = Date.now()
    if (cachedOrders.length === 0 || (now - lastOrdersFetchTime) > ORDERS_CACHE_DURATION) {
      await syncOrdersFromExternalAPI()
    }

    // Создаем уникальный список товаров из заказов
    const productMap = new Map()

    cachedOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productName = item.product_name || item.name
          const productId = item.product_id || item.id || productName

          if (productName && !productMap.has(productId)) {
            productMap.set(productId, {
              id: productId,
              productName: productName,
              sku: `SKU-${productId}`,
              stockQty: Math.floor(Math.random() * 100) + 1, // Random stock for demo
              price: item.price || 0,
              category: 'Medication' // Default category
            })
          }
        })
      }
    })

    const products = Array.from(productMap.values())

    console.log(`✅ Найдено ${products.length} уникальных товаров`)

    res.json({
      success: true,
      data: {
        products: products,
        total: products.length
      }
    })

  } catch (error) {
    console.error('❌ Ошибка получения товаров:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка загрузки товаров'
    })
  }
})

// Mock data for expenses
let expenseIdCounter = 4;
let expenses = [
  {
    id: 1,
    date: '2025-06-05',
    category: 'Логистика',
    description: 'Доставка товаров из Турции',
    amount: 15000
  },
  {
    id: 2,
    date: '2025-06-04',
    category: 'Реклама',
    description: 'Контекстная реклама Google Ads',
    amount: 8500
  },
  {
    id: 3,
    date: '2025-06-03',
    category: 'ЗП Курьеру',
    description: 'Зарплата курьера за май',
    amount: 25000
  }
];

// GET /api/expenses - получить список расходов
app.get('/api/expenses', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;

    console.log(`💰 Запрос расходов: страница ${page}, лимит ${limit}`);

    let filteredExpenses = [...expenses];

    // Фильтрация по датам
    if (dateFrom) {
      filteredExpenses = filteredExpenses.filter(expense => expense.date >= dateFrom);
    }
    if (dateTo) {
      filteredExpenses = filteredExpenses.filter(expense => expense.date <= dateTo);
    }

    // Сортировка по дате (новые первыми)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

    const response = {
      success: true,
      data: {
        expenses: paginatedExpenses,
        pagination: {
          page: page,
          limit: limit,
          totalItems: filteredExpenses.length,
          totalPages: Math.ceil(filteredExpenses.length / limit)
        }
      }
    };

    console.log(`✅ Возвращено ${paginatedExpenses.length} расходов из ${filteredExpenses.length}`);
    res.json(response);

  } catch (error) {
    console.error('❌ Ошибка получения расходов:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка загрузки расходов'
    });
  }
});

// POST /api/expenses - создать новый расход
app.post('/api/expenses', (req, res) => {
  try {
    const { date, category, description, amount } = req.body;

    console.log(`💰 Создание нового расхода: ${category} - ${amount}₽`);

    const newExpense = {
      id: expenseIdCounter++,
      date: date,
      category: category,
      description: description || '',
      amount: parseFloat(amount)
    };

    expenses.push(newExpense);

    console.log(`✅ Расход создан с ID: ${newExpense.id}`);

    res.json({
      success: true,
      message: 'Расход успешно добавлен',
      data: newExpense
    });

  } catch (error) {
    console.error('❌ Ошибка создания расхода:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания расхода'
    });
  }
});

// GET /api/expenses/:id - получить конкретный расход
app.get('/api/expenses/:id', (req, res) => {
  try {
    const expenseId = parseInt(req.params.id);
    console.log(`📖 Запрос расхода ID: ${expenseId}`);

    const expense = expenses.find(e => e.id === expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Расход не найден'
      });
    }

    res.json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('❌ Ошибка получения расхода:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения расхода'
    });
  }
});

// PUT /api/expenses/:id - обновить расход
app.put('/api/expenses/:id', (req, res) => {
  try {
    const expenseId = parseInt(req.params.id);
    const { date, category, description, amount } = req.body;

    console.log(`✏️ Обновление расхода ID: ${expenseId}`);

    const expenseIndex = expenses.findIndex(e => e.id === expenseId);

    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Расход не найден'
      });
    }

    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      date: date,
      category: category,
      description: description,
      amount: parseFloat(amount)
    };

    console.log(`✅ Расход ID: ${expenseId} обновлен`);

    res.json({
      success: true,
      message: 'Расход успешно обновлен',
      data: expenses[expenseIndex]
    });

  } catch (error) {
    console.error('❌ Ошибка обновления расхода:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления расхода'
    });
  }
});

// DELETE /api/expenses/:id - удалить расход
app.delete('/api/expenses/:id', (req, res) => {
  try {
    const expenseId = parseInt(req.params.id);

    console.log(`🗑️ Удаление расхода ID: ${expenseId}`);

    const expenseIndex = expenses.findIndex(e => e.id === expenseId);

    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Расход не найден'
      });
    }

    const deletedExpense = expenses.splice(expenseIndex, 1)[0];

    console.log(`✅ Расход ID: ${expenseId} удален`);

    res.json({
      success: true,
      message: 'Расход успешно удален',
      data: deletedExpense
    });

  } catch (error) {
    console.error('❌ Ошибка удаления расхода:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка удаления расхода'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Инициализация курсов и заказов при старте
updateCurrencyCache();
syncOrdersFromExternalAPI();

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`💰 Currency API: http://localhost:${PORT}/api/currency/rates`);
  console.log(`🔄 Refresh rates: http://localhost:${PORT}/api/currency/refresh`);
  console.log(`🔄 Sync orders: http://localhost:${PORT}/api/sync-orders`);
  console.log(`💸 Expenses API: http://localhost:${PORT}/api/expenses`);
  console.log(`🛍️ Products API: http://localhost:${PORT}/api/products`);
  console.log(`📦 Purchases API: http://localhost:${PORT}/api/purchases`);
});
