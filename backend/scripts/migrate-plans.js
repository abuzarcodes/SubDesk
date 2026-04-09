import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    console.log("Connected to database.");

    const [columns] = await connection.execute("SHOW COLUMNS FROM plans");
    const columnNames = columns.map(c => c.Field);

    const newColumns = [
      { name: 'description', type: 'TEXT' },
      { name: 'features', type: 'JSON' },
      { name: 'discount', type: 'DECIMAL(5,2)', default: '0.00' },
      { name: 'benefits_available', type: 'JSON' },
      { name: 'benefits_not_available', type: 'JSON' }
    ];

    for (const col of newColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding column: ${col.name}`);
        let query = `ALTER TABLE plans ADD COLUMN ${col.name} ${col.type}`;
        if (col.default !== undefined) {
          query += ` DEFAULT ${col.default}`;
        }
        await connection.execute(query);
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }

    console.log("Migration completed successfully.");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
