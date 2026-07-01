import { DB, connectDB } from "../src/mysqlDB/database.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function migrate() {
  try {
    await connectDB();
    console.log("Adding tos_accepted and tos_accepted_at to users table...");
    
    await DB.execute(`
      ALTER TABLE users 
      ADD COLUMN tos_accepted BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN tos_accepted_at TIMESTAMP NULL DEFAULT NULL;
    `);
    
    console.log("Migration successful!");
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Columns already exist, skipping.");
      process.exit(0);
    }
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
