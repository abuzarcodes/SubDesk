import cron from 'node-cron';
import { DB } from '../mysqlDB/database.js';

/**
 * Hourly cron job to mark subscriptions as 'expired' 
 * if their expires_at date has passed and they are currently 'active' or 'paused'.
 */
function startExpireSubscriptionsJob() {
  // Runs every hour at the top of the hour: '0 * * * *'
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running background subscription expiration job...');

      const [result] = await DB.query(
        `UPDATE subscriptions
         SET status = 'expired'
         WHERE status IN ('active', 'paused')
         AND expires_at IS NOT NULL
         AND expires_at < NOW()`
      );

      console.log(`Background job: ${result.affectedRows} subscriptions marked as expired.`);
    } catch (error) {
      console.error('Background expiration job failed:', error.message);
    }
  });
}

export { startExpireSubscriptionsJob };
