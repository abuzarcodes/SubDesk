import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verifySetup() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    console.log("Connected to database.");

    const [tables] = await connection.execute("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log("Existing tables:", tableNames);

    const requiredTables = ['users', 'plans', 'subscriptions'];
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.log("Missing tables:", missingTables);
      console.log("Initializing database from schema.sql...");
      
      const schemaPath = path.resolve(__dirname, '../src/mysqlDB/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        await connection.execute(statement);
      }
      console.log("Database initialized successfully.");
    } else {
      console.log("All required tables are present.");
    }

  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

verifySetup();
