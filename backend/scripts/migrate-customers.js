/**
 * Customer Management Migration Script
 *
 * Safe to run multiple times — checks column/table existence before altering.
 * Extends the subscriptions table and creates the subscription_events audit table.
 *
 * Usage:  node scripts/migrate-customers.js
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

async function migrate() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    console.log("Connected to database. Starting migration...\n");

    // ── Helper: check if a column exists ──────────────────────────────
    async function columnExists(table, column) {
      const [rows] = await connection.execute(
        `SELECT COUNT(*) AS cnt
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?`,
        [table, column]
      );
      return rows[0].cnt > 0;
    }

    // ── Helper: check if a table exists ───────────────────────────────
    async function tableExists(table) {
      const [rows] = await connection.execute(
        `SELECT COUNT(*) AS cnt
         FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?`,
        [table]
      );
      return rows[0].cnt > 0;
    }

    // ── 1. Modify status ENUM (idempotent — redefines the full column) ─
    console.log("[1/4] Modifying subscriptions.status ENUM...");
    await connection.execute(`
      ALTER TABLE subscriptions
      MODIFY COLUMN status ENUM('active','paused','cancelled','expired','inactive')
      NOT NULL DEFAULT 'active'
    `);
    console.log("  ✓ status ENUM updated\n");

    // ── 2. Add new columns if they don't exist ────────────────────────
    console.log("[2/4] Adding new columns to subscriptions...");
    const columnsToAdd = [
      { name: "started_at",   def: "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP" },
      { name: "paused_at",    def: "TIMESTAMP NULL DEFAULT NULL" },
      { name: "resumed_at",   def: "TIMESTAMP NULL DEFAULT NULL" },
      { name: "cancelled_at", def: "TIMESTAMP NULL DEFAULT NULL" },
      { name: "expires_at",   def: "TIMESTAMP NULL DEFAULT NULL" },
      { name: "is_deleted",   def: "BOOLEAN NOT NULL DEFAULT FALSE" },
    ];

    for (const col of columnsToAdd) {
      if (await columnExists("subscriptions", col.name)) {
        console.log(`  – ${col.name} already exists, skipping`);
      } else {
        await connection.execute(
          `ALTER TABLE subscriptions ADD COLUMN ${col.name} ${col.def}`
        );
        console.log(`  ✓ ${col.name} added`);
      }
    }
    console.log();

    // ── 3. Create subscription_events table ───────────────────────────
    console.log("[3/4] Creating subscription_events table...");
    if (await tableExists("subscription_events")) {
      console.log("  – subscription_events already exists, skipping\n");
    } else {
      await connection.execute(`
        CREATE TABLE subscription_events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          subscription_id INT NOT NULL,
          event_type ENUM('created','paused','resumed','cancelled','expired') NOT NULL,
          metadata JSON NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
        )
      `);
      console.log("  ✓ subscription_events created\n");
    }

    // ── 4. Create indexes (try/catch → safe if they already exist) ────
    console.log("[4/4] Creating performance indexes...");
    const indexes = [
      { name: "idx_sub_business_id",        table: "subscriptions",       column: "business_id" },
      { name: "idx_sub_status",             table: "subscriptions",       column: "status" },
      { name: "idx_sub_plan_id",            table: "subscriptions",       column: "plan_id" },
      { name: "idx_sub_is_deleted",         table: "subscriptions",       column: "is_deleted" },
      { name: "idx_events_subscription_id", table: "subscription_events", column: "subscription_id" },
    ];

    for (const idx of indexes) {
      try {
        await connection.execute(
          `CREATE INDEX ${idx.name} ON ${idx.table}(${idx.column})`
        );
        console.log(`  ✓ ${idx.name} created`);
      } catch (err) {
        if (err.code === "ER_DUP_KEYNAME") {
          console.log(`  – ${idx.name} already exists, skipping`);
        } else {
          throw err;
        }
      }
    }

    console.log("\n════════════════════════════════════════");
    console.log("  Migration completed successfully! ✓");
    console.log("════════════════════════════════════════\n");
  } catch (error) {
    console.error("\n✗ Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
}

migrate();
