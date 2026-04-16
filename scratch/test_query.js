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

  const businessId = 6;
  const MRR_VALIDATION = `status = 'active' 
    AND start_date <= CURDATE() 
    AND (expires_at IS NULL OR expires_at > NOW()) 
    AND is_deleted = FALSE`;

  try {
    const [rows] = await connection.execute(
      `SELECT 
        p.id as planId,
        p.name,
        COUNT(CASE WHEN s.${MRR_VALIDATION} THEN 1 END) as subscribers,
        SUM(CASE WHEN s.${MRR_VALIDATION} THEN (CASE WHEN p.billing_cycle = 'yearly' THEN p.price / 12 ELSE p.price END) ELSE 0 END) as revenue,
        COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancellations,
        COUNT(s.id) as total_lifetime
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.is_deleted = FALSE
      WHERE p.business_id = ?
      GROUP BY p.id, p.name`,
      [businessId]
    );
    console.log('Query result:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await connection.end();
  }
}

test();
