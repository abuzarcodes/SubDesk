import express from "express";
import {
  createOrder,
  verifyPayment,
  webhookHandler,
} from "../controllers/payment.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Order creation and verification require the customer to be authenticated
router.post("/create-order", auth, createOrder);
router.post("/verify", auth, verifyPayment);

// Webhook is called by Razorpay servers, so it doesn't need auth
// Raw body is already parsed by index.js middleware for HMAC signature
router.post("/webhook", webhookHandler);

export default router;
