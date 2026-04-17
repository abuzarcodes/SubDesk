import { connectDB, DB } from "./database.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function runMigration() {
  try {
    await connectDB();

    console.log("Adding columns to subscriptions table...");
    try {
      await DB.query(`
        ALTER TABLE subscriptions 
        ADD COLUMN razorpay_order_id VARCHAR(255) NULL UNIQUE,
        ADD COLUMN razorpay_payment_id VARCHAR(255) NULL,
        ADD COLUMN payment_status ENUM('pending', 'verified_pending', 'paid', 'failed', 'refunded') DEFAULT 'pending';
      `);
      console.log("Successfully added columns to subscriptions.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("Columns already exist, skipping.");
      } else {
        console.log("Error altering subscriptions (perhaps already altered?):", e.message);
      }
    }

    console.log("Updating subscriptions ENUM for status column to allow 'inactive' and 'verified_pending' if you want (actually status is an ENUM currently).");
    try {
      // Let's first check what the current status ENUM is:
      const [rows] = await DB.query("SHOW COLUMNS FROM subscriptions LIKE 'status'");
      console.log("Current status Enum:", rows[0].Type);
      
      // Let's modify it to include 'inactive' if not present
      await DB.query(`
        ALTER TABLE subscriptions 
        MODIFY COLUMN status ENUM('active', 'paused', 'cancelled', 'expired', 'inactive') DEFAULT 'inactive';
      `);
      console.log("Successfully updated status ENUM.");
    } catch (e) {
      console.log("Error updating status enum:", e.message);
    }

    console.log("Creating payments table...");
    await DB.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subscription_id INT,
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(50),
        payment_method VARCHAR(50) DEFAULT 'razorpay',
        raw_payload JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
      );
    `);
    console.log("Successfully created payments table.");

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
