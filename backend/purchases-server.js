const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3011;
const prisma = new PrismaClient();

// Telegram конфигурация
const TELEGRAM_BOT_TOKEN = '8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M';
const TELEGRAM_CHAT_ID = '-4729817036';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Хранилище закупок в памяти (для тестирования)
let purchases = [];

// Функция отправки уведомления в Telegram с кнопками
async function sendTelegramNotification(purchase) {
  try {
    // Форматируем сообщение
    const isUrgent = purchase.isUrgent;
    const title = isUrgent ? '🔥 СРОЧНАЯ ЗАКУПКА' : '📦 НОВАЯ ЗАКУПКА';
    const purchaseNumber = `#${purchase.id.split('_')[1]}`;

    // Форматируем список товаров с себестоимостью
    const itemsList = purchase.items.map(item =>
      `• ${item.name} — ${item.quantity} шт. × ${item.price} ₺ = ${item.total} ₺ (себестоимость)`
    ).join('\n');

    // Считаем общую сумму в лирах
    const totalTRY = purchase.items.reduce((sum, item) => sum + item.total, 0);

    // Составляем сообщение
    const message = `${title} ${purchaseNumber}

💰 Итого: ${totalTRY} ₺
📊 Статус: Создана

📋 СПИСОК ТОВАРОВ:
${itemsList}

⏰ Создано: ${new Date(purchase.createdAt).toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;

    // Кнопка для принятия закупки
    const keyboard = {
      inline_keyboard: [[
        {
          text: '✅ Принять',
          callback_data: `accept_${purchase.id}`
        }
      ]]
    };

    // Отправляем сообщение с кнопкой
    const response = await fetch(TELEGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Telegram уведомление отправлено успешно');
      // Сохраняем message_id для последующих обновлений
      purchase.telegramMessageId = data.result.message_id;
    } else {
      console.error('❌ Ошибка отправки в Telegram:', data);
    }

    return data;
  } catch (error) {
    console.error('❌ Ошибка при отправке в Telegram:', error);
    // Не прерываем основной процесс если Telegram недоступен
    return null;
  }
}

// POST /api/purchases - создание новой закупки
app.post('/api/purchases', async (req, res) => {
  try {
    const { isUrgent, items } = req.body;

    // Валидация
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Требуется массив items с хотя бы одним товаром'
      });
    }

    // Расчет общей суммы
    const totalCost = items.reduce((sum, item) => sum + (item.total || 0), 0);

    // Создаем закупку в памяти (пока не используем БД из-за проблем с правами)
    const purchase = {
      id: `purchase_${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalCost,
      isUrgent: isUrgent || false,
      items: items.map((item, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        productId: item.productId || null,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }))
    };

    purchases.push(purchase);

    console.log(`✅ Создана новая закупка #${purchase.id} на сумму ${totalCost} ₺`);
    console.log('📦 Товары:', items.map(i => `${i.name} x${i.quantity}`).join(', '));

    // Отправляем уведомление в Telegram (не блокируем ответ)
    sendTelegramNotification(purchase).then(() => {
      console.log('📱 Процесс отправки в Telegram завершен');
    }).catch(error => {
      console.error('⚠️ Ошибка в процессе отправки в Telegram:', error);
    });

    res.status(201).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('❌ Ошибка создания закупки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка создания закупки'
    });
  }
});

// GET /api/purchases - получение списка закупок
app.get('/api/purchases', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Фильтры
    let filteredPurchases = [...purchases];

    if (req.query.isUrgent === 'true') {
      filteredPurchases = filteredPurchases.filter(p => p.isUrgent === true);
    } else if (req.query.isUrgent === 'false') {
      filteredPurchases = filteredPurchases.filter(p => p.isUrgent === false);
    }

    // Сортировка по дате создания (новые первые)
    filteredPurchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Пагинация
    const paginatedPurchases = filteredPurchases.slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        purchases: paginatedPurchases,
        pagination: {
          page,
          limit,
          total: filteredPurchases.length,
          totalPages: Math.ceil(filteredPurchases.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ Ошибка получения закупок:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения списка закупок'
    });
  }
});

// GET /api/purchases/:id - получение деталей закупки
app.get('/api/purchases/:id', (req, res) => {
  try {
    const { id } = req.params;
    const purchase = purchases.find(p => p.id === id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Закупка не найдена'
      });
    }

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('❌ Ошибка получения закупки:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения деталей закупки'
    });
  }
});

// PATCH /api/purchases/:id/status - обновление статуса закупки
app.patch('/api/purchases/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const purchaseIndex = purchases.findIndex(p => p.id === id);

    if (purchaseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Закупка не найдена'
      });
    }

    // Обновляем статус
    purchases[purchaseIndex].status = status;
    purchases[purchaseIndex].updatedAt = new Date().toISOString();

    console.log(`✅ Обновлен статус закупки #${id}: ${status}`);

    res.json({
      success: true,
      data: purchases[purchaseIndex]
    });
  } catch (error) {
    console.error('❌ Ошибка обновления статуса:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления статуса'
    });
  }
});

// POST /api/telegram/webhook - обработка callback_query от Telegram
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;

    // Обрабатываем только callback_query
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const { id, from, message, data } = callbackQuery;

      // Парсим данные кнопки
      const [action, ...purchaseIdParts] = data.split('_');
      const purchaseId = purchaseIdParts.join('_');

      // Находим закупку
      const purchase = purchases.find(p => p.id === purchaseId);
      if (!purchase) {
        await answerCallbackQuery(id, 'Закупка не найдена');
        return res.json({ ok: true });
      }

      // Определяем новый статус
      const statusFlow = {
        'accept': { newStatus: 'принята', text: '✅ Принята', nextButton: { text: '📦 Товар готов', callback: 'ready' } },
        'ready': { newStatus: 'готов', text: '📦 Товар готов', nextButton: { text: '💰 Нужна оплата', callback: 'payment' } },
        'payment': { newStatus: 'ожидает_оплаты', text: '💰 Ожидает оплаты', nextButton: { text: '💳 Я оплатил', callback: 'paid' } },
        'paid': { newStatus: 'в_пути', text: '🚚 В пути', nextButton: null }
      };

      const statusInfo = statusFlow[action];
      if (!statusInfo) {
        await answerCallbackQuery(id, 'Неизвестное действие');
        return res.json({ ok: true });
      }

      // Обновляем статус
      purchase.status = statusInfo.newStatus;
      purchase.updatedAt = new Date().toISOString();

      // Обновляем сообщение в Telegram
      await updateTelegramMessage(message.chat.id, message.message_id, purchase, statusInfo);

      // Отвечаем на callback
      await answerCallbackQuery(id, `Статус обновлен: ${statusInfo.text}`);

      console.log(`📱 Обновлен статус закупки ${purchaseId}: ${statusInfo.newStatus} (пользователь: ${from.first_name})`);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    res.status(500).json({ ok: false, error: 'Webhook processing error' });
  }
});

// Функция для ответа на callback_query
async function answerCallbackQuery(callbackQueryId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: false
      })
    });
  } catch (error) {
    console.error('Ошибка ответа на callback:', error);
  }
}

// Функция обновления сообщения в Telegram
async function updateTelegramMessage(chatId, messageId, purchase, statusInfo) {
  try {
    const isUrgent = purchase.isUrgent;
    const title = isUrgent ? '🔥 СРОЧНАЯ ЗАКУПКА' : '📦 НОВАЯ ЗАКУПКА';
    const purchaseNumber = `#${purchase.id.split('_')[1]}`;

    const itemsList = purchase.items.map(item =>
      `• ${item.name} — ${item.quantity} шт. × ${item.price} ₺ = ${item.total} ₺ (себестоимость)`
    ).join('\n');

    const totalTRY = purchase.items.reduce((sum, item) => sum + item.total, 0);

    const message = `${title} ${purchaseNumber}

💰 Итого: ${totalTRY} ₺
📊 Статус: ${statusInfo.text}

📋 СПИСОК ТОВАРОВ:
${itemsList}

⏰ Создано: ${new Date(purchase.createdAt).toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;

    // Обновляем кнопки
    const keyboard = statusInfo.nextButton ? {
      inline_keyboard: [[
        {
          text: statusInfo.nextButton.text,
          callback_data: `${statusInfo.nextButton.callback}_${purchase.id}`
        }
      ]]
    } : null;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: message,
        parse_mode: 'HTML',
        reply_markup: keyboard
      })
    });
  } catch (error) {
    console.error('Ошибка обновления сообщения:', error);
  }
}

// POST /api/telegram/test - тестовый endpoint для проверки Telegram
app.post('/api/telegram/test', async (req, res) => {
  try {
    const testPurchase = {
      id: 'purchase_test_' + Date.now(),
      createdAt: new Date().toISOString(),
      isUrgent: true,
      items: [
        { name: 'Тестовый товар 1', quantity: 5, price: 100, total: 500 },
        { name: 'Тестовый товар 2', quantity: 3, price: 200, total: 600 }
      ]
    };

    const result = await sendTelegramNotification(testPurchase);

    res.json({
      success: true,
      message: 'Тестовое сообщение отправлено',
      telegramResponse: result
    });
  } catch (error) {
    console.error('❌ Ошибка тестирования Telegram:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка отправки тестового сообщения'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    purchasesCount: purchases.length,
    telegramConfigured: !!TELEGRAM_BOT_TOKEN && !!TELEGRAM_CHAT_ID
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Purchases API Server running on http://localhost:${PORT}`);
  console.log(`📋 Purchases API: http://localhost:${PORT}/api/purchases`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Telegram bot: ${TELEGRAM_BOT_TOKEN ? 'Configured ✅' : 'Not configured ❌'}`);
  console.log('\n📦 Закупки хранятся в памяти (не в БД)');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
