import mysql from "mysql2/promise";
import fs from "fs";

let DB;
async function connectDB() {
  try {
    const connectionOptions = {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT
        ? Number(process.env.DATABASE_PORT)
        : 3306,
    };

    if (process.env.DATABASE_SSL === "true") {
      const sslOptions = {
        rejectUnauthorized:
          process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
      };

      if (process.env.DATABASE_SSL_CA_PATH) {
        sslOptions.ca = process.env.DATABASE_SSL_CA_PATH;
      }

      connectionOptions.ssl = sslOptions;
    }

    DB = await mysql.createConnection(connectionOptions);
    console.log("database connected successfully");
  } catch (error) {
    console.log("cant connect to database: " + error);
  }
}

export { connectDB, DB };
