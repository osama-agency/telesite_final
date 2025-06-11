const TELEGRAM_BOT_TOKEN = '8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M';
const WEBHOOK_URL = 'https://your-domain.com/api/telegram/webhook'; // Замените на ваш реальный домен

async function setupWebhook() {
  try {
    // Получаем информацию о текущем webhook
    const getWebhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const webhookInfo = await getWebhookResponse.json();

    console.log('📱 Текущий webhook:', webhookInfo.result.url || 'Не установлен');

    // Устанавливаем новый webhook
    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['callback_query', 'message']
      })
    });

    const result = await setWebhookResponse.json();

    if (result.ok) {
      console.log('✅ Webhook успешно установлен:', WEBHOOK_URL);
    } else {
      console.error('❌ Ошибка установки webhook:', result);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Функция для удаления webhook (переход на polling)
async function deleteWebhook() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`);
    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook удален');
    } else {
      console.error('❌ Ошибка удаления webhook:', result);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Проверяем аргументы командной строки
const command = process.argv[2];

if (command === 'delete') {
  deleteWebhook();
} else {
  setupWebhook();
}

console.log('\n📝 Использование:');
console.log('  node setup-telegram-webhook.js        - установить webhook');
console.log('  node setup-telegram-webhook.js delete - удалить webhook');
