import express from "express";
import {
  createSubscription,
  getBusinessSubscriptions,
  getCustomerSubscriptions,
  updateSubscriptionStatus,
} from "../controllers/subscriptions.controller.js";
import { auth, requireBusiness } from "../middlewares/auth.middleware.js";

const Router = express.Router();

Router.post("/", auth, createSubscription);
Router.get("/business", auth, getBusinessSubscriptions);
Router.get("/customer", auth, getCustomerSubscriptions);
Router.patch("/:id/status", auth, requireBusiness, updateSubscriptionStatus);

export default Router;

