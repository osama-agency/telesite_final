const cron = require('node-cron');
const { autoSyncAllUsers } = require('../controllers/SyncController');

/**
 * Schedule automatic synchronization of orders from external API
 * Runs every 5 minutes
 */
class SyncScheduler {
  constructor() {
    this.isRunning = false;
    this.lastRunTime = null;
    this.nextRunTime = null;
    this.task = null;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Sync scheduler is already running');
      return;
    }

    // Schedule to run every 5 minutes
    // Cron pattern: '*/5 * * * *' means every 5 minutes
    this.task = cron.schedule('*/5 * * * *', async () => {
      try {
        this.lastRunTime = new Date();
        console.log(`🔄 [${this.lastRunTime.toISOString()}] Starting automatic sync...`);

        const results = await autoSyncAllUsers();

        console.log(`✅ [${new Date().toISOString()}] Automatic sync completed successfully`);
        console.log(`📊 Sync results:`, results);

        this.updateNextRunTime();
      } catch (error) {
        console.error(`❌ [${new Date().toISOString()}] Automatic sync failed:`, error.message);
      }
    }, {
      scheduled: false, // Don't start immediately
      timezone: process.env.TZ || 'UTC'
    });

    this.task.start();
    this.isRunning = true;
    this.updateNextRunTime();

    console.log('🚀 Sync scheduler started successfully');
    console.log(`⏰ Will sync every 5 minutes`);
    console.log(`🕐 Next sync at: ${this.nextRunTime?.toISOString()}`);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Sync scheduler is not running');
      return;
    }

    if (this.task) {
      this.task.stop();
      this.task = null;
    }

    this.isRunning = false;
    this.nextRunTime = null;

    console.log('🛑 Sync scheduler stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      nextRunTime: this.nextRunTime,
      schedule: 'Every 5 minutes',
      timezone: process.env.TZ || 'UTC'
    };
  }

  /**
   * Update next run time
   */
  updateNextRunTime() {
    if (this.isRunning) {
      const now = new Date();
      const nextRun = new Date(now);
      nextRun.setMinutes(Math.ceil(now.getMinutes() / 5) * 5, 0, 0);

      // If we're exactly on a 5-minute mark, add 5 minutes
      if (nextRun.getTime() === now.getTime()) {
        nextRun.setMinutes(nextRun.getMinutes() + 5);
      }

      this.nextRunTime = nextRun;
    }
  }

  /**
   * Manually trigger sync (for testing)
   */
  async triggerManualSync() {
    try {
      console.log(`🔄 [${new Date().toISOString()}] Manual sync triggered...`);

      const results = await autoSyncAllUsers();

      console.log(`✅ [${new Date().toISOString()}] Manual sync completed successfully`);
      console.log(`📊 Sync results:`, results);

      return {
        success: true,
        results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] Manual sync failed:`, error.message);

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const syncScheduler = new SyncScheduler();

module.exports = syncScheduler;
