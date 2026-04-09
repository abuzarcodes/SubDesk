import express from "express";
import {
  registerUser,
  userLogin,
  getMe,
  logoutUser,
} from "../controllers/users.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const Router = express.Router();

Router.post("/register", registerUser);
Router.post("/login", userLogin);
Router.get("/me", auth, getMe);
Router.get("/logout", logoutUser);

export default Router;
