import mysql from "mysql2/promise";

let DB;
async function connectDB() {
  try {
    DB = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: "subtrckrdb",
    });
    console.log("database connected successfully");
  } catch (error) {
    console.log("cant connect to database" + error);
  }
}

async function fetchAllUsers() {
  const [results] = await DB.execute("select * from users;");
  return results;
}

export { fetchAllUsers, connectDB };
