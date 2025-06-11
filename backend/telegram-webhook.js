// Telegram Webhook Handler для обработки статусов закупок

const TELEGRAM_BOT_TOKEN = '8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M';

// Функция для отправки сообщения с кнопками статуса
async function sendPurchaseWithButtons(purchase, chatId) {
  const isUrgent = purchase.isUrgent;
  const title = isUrgent ? '🔥 СРОЧНАЯ ЗАКУПКА' : '📦 НОВАЯ ЗАКУПКА';
  const purchaseNumber = `#${purchase.id.split('_')[1]}`;

  // Форматируем список товаров
  const itemsList = purchase.items.map(item =>
    `• ${item.name} — ${item.quantity} шт. × ${item.price} ₺ = ${item.total} ₺`
  ).join('\n');

  const totalTRY = purchase.items.reduce((sum, item) => sum + item.total, 0);

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

  // Кнопки в зависимости от текущего статуса
  const keyboard = {
    inline_keyboard: [[
      {
        text: '✅ Принять',
        callback_data: `accept_${purchase.id}`
      }
    ]]
  };

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      reply_markup: keyboard
    })
  });

  return await response.json();
}

// Функция для обновления сообщения с новым статусом
async function updatePurchaseMessage(chatId, messageId, purchase, newStatus) {
  const statusMap = {
    'принята': { text: '✅ Принята', nextButton: { text: '📦 Товар готов', callback: 'ready' } },
    'готов': { text: '📦 Товар готов', nextButton: { text: '💰 Нужна оплата', callback: 'payment' } },
    'ожидает_оплаты': { text: '💰 Ожидает оплаты', nextButton: { text: '💳 Я оплатил', callback: 'paid' } },
    'в_пути': { text: '🚚 В пути', nextButton: null }
  };

  const status = statusMap[newStatus] || { text: newStatus, nextButton: null };
  const isUrgent = purchase.isUrgent;
  const title = isUrgent ? '🔥 СРОЧНАЯ ЗАКУПКА' : '📦 НОВАЯ ЗАКУПКА';
  const purchaseNumber = `#${purchase.id.split('_')[1]}`;

  const itemsList = purchase.items.map(item =>
    `• ${item.name} — ${item.quantity} шт. × ${item.price} ₺ = ${item.total} ₺`
  ).join('\n');

  const totalTRY = purchase.items.reduce((sum, item) => sum + item.total, 0);

  const message = `${title} ${purchaseNumber}

💰 Итого: ${totalTRY} ₺
📊 Статус: ${status.text}

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
  const keyboard = status.nextButton ? {
    inline_keyboard: [[
      {
        text: status.nextButton.text,
        callback_data: `${status.nextButton.callback}_${purchase.id}`
      }
    ]]
  } : null;

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
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

  return await response.json();
}

// Обработчик callback_query от кнопок
async function handleCallbackQuery(callbackQuery, purchases) {
  const { id, from, message, data } = callbackQuery;

  // Парсим данные кнопки
  const [action, ...purchaseIdParts] = data.split('_');
  const purchaseId = purchaseIdParts.join('_');

  // Находим закупку
  const purchase = purchases.find(p => p.id === purchaseId);
  if (!purchase) {
    await answerCallbackQuery(id, 'Закупка не найдена');
    return;
  }

  // Определяем новый статус
  let newStatus;
  switch (action) {
    case 'accept':
      newStatus = 'принята';
      break;
    case 'ready':
      newStatus = 'готов';
      break;
    case 'payment':
      newStatus = 'ожидает_оплаты';
      break;
    case 'paid':
      newStatus = 'в_пути';
      break;
    default:
      await answerCallbackQuery(id, 'Неизвестное действие');
      return;
  }

  // Обновляем статус в базе
  purchase.status = newStatus;
  purchase.updatedAt = new Date().toISOString();

  // Обновляем сообщение
  await updatePurchaseMessage(message.chat.id, message.message_id, purchase, newStatus);

  // Отвечаем на callback
  await answerCallbackQuery(id, `Статус обновлен: ${getStatusText(newStatus)}`);

  console.log(`📱 Обновлен статус закупки ${purchaseId}: ${newStatus} (пользователь: ${from.first_name})`);
}

// Ответ на callback_query
async function answerCallbackQuery(callbackQueryId, text) {
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
}

// Получить текст статуса
function getStatusText(status) {
  const statusMap = {
    'принята': '✅ Принята',
    'готов': '📦 Товар готов',
    'ожидает_оплаты': '💰 Ожидает оплаты',
    'в_пути': '🚚 В пути'
  };
  return statusMap[status] || status;
}

module.exports = {
  sendPurchaseWithButtons,
  handleCallbackQuery,
  updatePurchaseMessage
};
