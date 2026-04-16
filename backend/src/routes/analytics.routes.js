import express from "express";
import { 
  getAnalyticsSummary, 
  getRevenueTimeSeries, 
  getCustomerGrowth, 
  getPlanPerformance, 
  getChurnAnalytics 
} from "../controllers/analytics.controller.js";
import { auth, requireBusiness } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All analytics routes require authentication and business role
router.use(auth);
router.use(requireBusiness);

router.get("/summary", getAnalyticsSummary);
router.get("/revenue", getRevenueTimeSeries);
router.get("/customers", getCustomerGrowth);
router.get("/plans", getPlanPerformance);
router.get("/churn", getChurnAnalytics);

export default router;
