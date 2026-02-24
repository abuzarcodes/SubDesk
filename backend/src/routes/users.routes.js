import express from "express";
import {
  fetchAllUsers,
  registerUser,
  userLogin,
} from "../controllers/users.controller.js";

const Router = express.Router();

Router.post("/register", registerUser);

Router.post("/login", userLogin);

Router.get("/users", fetchAllUsers);

export default Router;
