import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

async function test() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  const businessId = 1;
  const days = 30;
  const MRR_VALIDATION = `s.status = 'active' 
    AND s.start_date <= CURDATE() 
    AND (s.expires_at IS NULL OR s.expires_at > NOW()) 
    AND s.is_deleted = FALSE`;

  function getDateFilter(column, days) {
    return `${column} >= CURDATE() - INTERVAL ${Number(days)} DAY`;
  }

  try {
    console.log('Testing Active Subscriptions Query...');
    const [activeRows] = await connection.execute(
      `SELECT COUNT(*) as active FROM subscriptions s WHERE s.business_id = ? AND ${MRR_VALIDATION}`,
      [businessId]
    );
    console.log('Active count:', activeRows[0].active);

    console.log('Testing Churn Rate Query...');
    const [churnRows] = await connection.execute(
      `SELECT 
        COUNT(CASE WHEN s.status = 'cancelled' AND ${getDateFilter('s.cancelled_at', days)} THEN 1 END) as cancelled,
        COUNT(CASE WHEN ${MRR_VALIDATION} THEN 1 END) as active
      FROM subscriptions s
      WHERE s.business_id = ?`,
      [businessId]
    );
    console.log('Churn rows:', churnRows[0]);

  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await connection.end();
  }
}

test();
