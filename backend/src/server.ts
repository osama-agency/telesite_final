import app from './app';
import cronJobManager from './final/cronJobManager';

const PORT = process.env.PORT || 3011;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🔄 Sync endpoints:`);
  console.log(`   - Orders: http://${HOST}:${PORT}/api/sync-orders`);
  console.log(`   - Products: http://${HOST}:${PORT}/api/sync-products`);
  console.log(`📦 API endpoints:`);
  console.log(`   - GET /api/orders`);
  console.log(`   - GET /api/products`);

  // Запускаем cron задачи
  console.log('\n🕐 Starting cron jobs...');
  cronJobManager.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  cronJobManager.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  cronJobManager.stop();
  process.exit(0);
});
