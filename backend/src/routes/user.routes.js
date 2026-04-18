import express from "express";
import { auth, requireCustomer } from "../middlewares/auth.middleware.js";
import {
  getDashboardSummary,
  getSubscriptions,
  getSubscriptionDetails,
  updateSubscriptionStatus,
  bulkAction,
  getActivity,
  getBillingSummary,
  getTransactions,
  getAnalytics,
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";

const Router = express.Router();

// All routes require authentication + customer role
Router.use(auth, requireCustomer);

// Dashboard
Router.get("/dashboard-summary", getDashboardSummary);

// Subscriptions — bulk-action BEFORE :id to prevent Express treating "bulk-action" as an ID
Router.post("/subscriptions/bulk-action", bulkAction);
Router.get("/subscriptions/:id", getSubscriptionDetails);
Router.get("/subscriptions", getSubscriptions);
Router.patch("/subscriptions/:id/status", updateSubscriptionStatus);

// Activity
Router.get("/activity", getActivity);

// Billing
Router.get("/billing-summary", getBillingSummary);
Router.get("/transactions", getTransactions);

// Analytics
Router.get("/analytics", getAnalytics);

// Profile
Router.get("/profile", getProfile);
Router.put("/profile", updateProfile);

export default Router;
