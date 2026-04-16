import express from "express";
import {
  getCustomers,
  getCustomerDetails,
  removeCustomer,
  exportCustomers,
} from "../controllers/customers.controller.js";
import { auth, requireBusiness } from "../middlewares/auth.middleware.js";

const Router = express.Router();

// All customer routes require authentication + business role
Router.get("/",        auth, requireBusiness, getCustomers);
Router.get("/export",  auth, requireBusiness, exportCustomers);
Router.get("/:id",     auth, requireBusiness, getCustomerDetails);
Router.delete("/:id",  auth, requireBusiness, removeCustomer);

export default Router;
