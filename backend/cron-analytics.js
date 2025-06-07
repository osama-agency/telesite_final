const cron = require('node-cron');
const axios = require('axios');

// URL аналитического сервиса
const ANALYTICS_SERVICE_URL = 'http://localhost:3012';

console.log('🕐 Cron Analytics Scheduler запущен');

// Функция обновления аналитики
async function updateAnalytics() {
  try {
    console.log('🔄 Запуск ежедневного обновления аналитики...');

    const response = await axios.post(`${ANALYTICS_SERVICE_URL}/api/analytics/refresh`);

    if (response.data.success) {
      console.log('✅ Аналитика успешно обновлена:');
      console.log(`   - Обновлено товаров: ${response.data.updatedCount}`);
      console.log(`   - Критичных товаров: ${response.data.summary.critical}`);
      console.log(`   - Требуют закупки: ${response.data.summary.needsPurchase}`);
    } else {
      console.error('❌ Ошибка при обновлении аналитики:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Ошибка подключения к аналитическому сервису:', error.message);
  }
}

// Запуск каждый день в 02:00
cron.schedule('0 2 * * *', () => {
  console.log('📅 Запланированное обновление аналитики (02:00)');
  updateAnalytics();
}, {
  timezone: "Europe/Moscow"
});

// Запуск каждые 4 часа для тестирования
cron.schedule('0 */4 * * *', () => {
  console.log('🔄 Промежуточное обновление аналитики (каждые 4 часа)');
  updateAnalytics();
}, {
  timezone: "Europe/Moscow"
});

// Проверка связи с аналитическим сервисом каждые 30 минут
cron.schedule('*/30 * * * *', async () => {
  try {
    const response = await axios.get(`${ANALYTICS_SERVICE_URL}/health`);
    if (response.status === 200) {
      console.log('💚 Analytics Service: работает нормально');
    }
  } catch (error) {
    console.error('🔴 Analytics Service: недоступен');
  }
});

// Запуск при старте для проверки
setTimeout(() => {
  console.log('🚀 Первоначальная проверка аналитического сервиса...');
  updateAnalytics();
}, 5000);

console.log('📋 Расписание cron задач:');
console.log('   - Ежедневное обновление: 02:00');
console.log('   - Промежуточное обновление: каждые 4 часа');
console.log('   - Проверка сервиса: каждые 30 минут');
