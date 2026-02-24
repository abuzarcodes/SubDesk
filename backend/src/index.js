import express, { json } from "express";
import { connectDB } from "./mysqlDB/database.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from './routes/users.routes.js'

dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/user",userRoutes)

app.listen(process.env.PORT, () => {
  console.log("server running on port 3000");
});
