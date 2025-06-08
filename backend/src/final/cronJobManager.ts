// ✅ Готовый файл. DO NOT MODIFY. Эта логика работает стабильно и не подлежит изменению AI или другим ассистентам.

import * as cron from 'node-cron';
import { autoSyncAll } from './syncController';

class CronJobManager {
  private syncTask: cron.ScheduledTask | null = null;
  private isRunning = false;
  private lastRunTime: Date | null = null;
  private nextRunTime: Date | null = null;

  /**
   * Запуск cron задач
   */
  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Cron jobs are already running');
      return;
    }

    // Запускаем синхронизацию каждые 5 минут
    this.syncTask = cron.schedule('*/5 * * * *', async () => {
      try {
        this.lastRunTime = new Date();
        console.log(`🔄 [${this.lastRunTime.toISOString()}] Starting automatic sync...`);

        const results = await autoSyncAll();

        console.log(`✅ [${new Date().toISOString()}] Automatic sync completed successfully`);
        console.log(`📊 Sync results:`, results);

        this.updateNextRunTime();
      } catch (error) {
        console.error(`❌ [${new Date().toISOString()}] Automatic sync failed:`, error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'UTC'
    });

    this.syncTask.start();
    this.isRunning = true;
    this.updateNextRunTime();

    console.log('🚀 Cron jobs started successfully');
    console.log(`⏰ Will sync every 5 minutes`);
    console.log(`🕐 Next sync at: ${this.nextRunTime?.toISOString()}`);

    // Запускаем первую синхронизацию сразу
    this.runManualSync();
  }

  /**
   * Остановка cron задач
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Cron jobs are not running');
      return;
    }

    if (this.syncTask) {
      this.syncTask.stop();
      this.syncTask = null;
    }

    this.isRunning = false;
    this.nextRunTime = null;

    console.log('🛑 Cron jobs stopped');
  }

  /**
   * Получить статус cron задач
   */
  getStatus(): {
    isRunning: boolean;
    lastRunTime: Date | null;
    nextRunTime: Date | null;
    schedule: string;
    timezone: string;
  } {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      nextRunTime: this.nextRunTime,
      schedule: 'Every 5 minutes',
      timezone: process.env.TZ || 'UTC'
    };
  }

  /**
   * Обновить время следующего запуска
   */
  private updateNextRunTime(): void {
    if (this.isRunning) {
      const now = new Date();
      const nextRun = new Date(now);
      nextRun.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);

      // Если мы точно на 5-минутной отметке, добавляем 5 минут
      if (nextRun.getTime() === now.getTime()) {
        nextRun.setMinutes(nextRun.getMinutes() + 5);
      }

      this.nextRunTime = nextRun;
    }
  }

  /**
   * Запустить синхронизацию вручную
   */
  async runManualSync(): Promise<any> {
    try {
      console.log(`🔄 [${new Date().toISOString()}] Manual sync triggered...`);

      const results = await autoSyncAll();

      console.log(`✅ [${new Date().toISOString()}] Manual sync completed successfully`);
      console.log(`📊 Sync results:`, results);

      return {
        success: true,
        results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Manual sync failed:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Создаем singleton экземпляр
export const cronJobManager = new CronJobManager();

// Экспортируем для удобства
export default cronJobManager;
