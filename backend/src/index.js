import express from "express";
import { connectDB } from "./mysqlDB/database.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/users.routes.js";
import planRoutes from "./routes/plans.routes.js";
import subscriptionRoutes from "./routes/subscriptions.routes.js";
import publicRoutes from "./routes/public.routes.js";
import configRoutes from "./routes/config.routes.js";
import customerRoutes from "./routes/customers.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import userRoutes from "./routes/user.routes.js";
import { startExpireSubscriptionsJob } from "./jobs/expireSubscriptions.job.js";

dotenv.config();
const app = express();
connectDB();


const allowedOrigins = process.env.ALLOWED_ORIGINS
  .split(",")
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without an Origin header (e.g. Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


// Webhook requires raw body parsing for HMAC signature verification
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("SubTrckr API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/business", configRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/user", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  startExpireSubscriptionsJob();
});
