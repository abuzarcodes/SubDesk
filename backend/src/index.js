import express, { json } from "express";
import { connectDB, fetchAllUsers } from "./mysqlDB/database.js";
import dotenv from 'dotenv'
dotenv.config()
const app = express();
connectDB()


app.get("/", (req, res) => {
  res.send("hello");
});

app.get("/users", (req, res) => {
  fetchAllUsers().then((e) => {
    console.log(e);
    res.json(e);
  });
});

app.listen(3000, () => {
  console.log("server running on port 3000");
});
