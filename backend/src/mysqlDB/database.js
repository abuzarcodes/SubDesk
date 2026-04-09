import mysql from "mysql2/promise";

let DB;
async function connectDB() {
  try {
    DB = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    console.log("database connected successfully");
  } catch (error) {
    console.log("cant connect to database: " + error);
  }
}

export { connectDB, DB };
