import express from "express";
import {
  createSubscription,
  getBusinessSubscriptions,
  getCustomerSubscriptions,
} from "../controllers/subscriptions.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const Router = express.Router();

Router.post("/", auth, createSubscription);
Router.get("/business", auth, getBusinessSubscriptions);
Router.get("/customer", auth, getCustomerSubscriptions);

export default Router;
