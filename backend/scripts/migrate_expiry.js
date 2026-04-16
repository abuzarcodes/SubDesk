import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
  console.log('Starting migration: Backfilling expires_at for existing subscriptions...');
  
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    // 1. Fetch subscriptions with NULL expires_at
    const [rows] = await connection.execute(
      `SELECT s.id, s.start_date, p.billing_cycle 
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.expires_at IS NULL`
    );

    if (rows.length === 0) {
      console.log('No subscriptions found with missing expires_at.');
      return;
    }

    console.log(`Found ${rows.length} subscriptions to update.`);

    for (const row of rows) {
      const startDate = new Date(row.start_date);
      const expiresAt = new Date(startDate);

      if (row.billing_cycle === 'monthly') {
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else if (row.billing_cycle === 'yearly') {
        expiresAt.setDate(expiresAt.getDate() + 365);
      } else {
        console.warn(`Unknown billing cycle '${row.billing_cycle}' for subscription ID ${row.id}. Skipping.`);
        continue;
      }

      await connection.execute(
        `UPDATE subscriptions SET expires_at = ? WHERE id = ?`,
        [expiresAt, row.id]
      );
      
      console.log(`Updated subscription ID ${row.id}: Start Date ${row.start_date.toISOString().split('T')[0]} -> Expiry ${expiresAt.toISOString().split('T')[0]} (${row.billing_cycle})`);
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
