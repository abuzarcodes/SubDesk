import express from "express";
import { getPublicSubscriptionPage } from "../controllers/public.controller.js";

const router = express.Router();

// Publicly fetches the subscription page data for a business
router.get("/subscribe/:identifier", getPublicSubscriptionPage);

export default router;
