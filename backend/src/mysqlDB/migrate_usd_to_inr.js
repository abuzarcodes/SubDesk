import { connectDB, DB } from "./database.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function runMigration() {
  try {
    await connectDB();

    console.log("Updating plans to paise (multiplying by 100 for USD prices)...");
    await DB.query(`
      UPDATE plans
      SET price = ROUND(price * 100)
      WHERE price < 100;
    `);

    console.log("Adding currency column to plans...");
    try {
      await DB.query(`
        ALTER TABLE plans
        ADD COLUMN currency VARCHAR(10) DEFAULT 'INR';
      `);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("currency column already exists.");
      } else {
        throw e;
      }
    }

    console.log("Setting all plan currencies to INR...");
    await DB.query(`
      UPDATE plans SET currency = 'INR';
    `);

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
