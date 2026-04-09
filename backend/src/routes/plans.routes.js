import express from "express";
import { createPlan, getPlans, getPublicPlans, updatePlan, deletePlan } from "../controllers/plans.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const Router = express.Router();

// Protected — business only
Router.post("/", auth, createPlan);
Router.get("/", auth, getPlans);
Router.put("/:id", auth, updatePlan);
Router.delete("/:id", auth, deletePlan);

// Public — anyone can view a business's plans
Router.get("/:businessId", getPublicPlans);

export default Router;
