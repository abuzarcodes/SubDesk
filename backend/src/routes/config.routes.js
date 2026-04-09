import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { 
  getPageConfig, 
  updatePageConfig, 
  updateProfile, 
  publishPageConfig, 
  unpublishPageConfig 
} from "../controllers/config.controller.js";

const router = express.Router();

// Middleware to strictly enforce 'business' role
const requireBusiness = (req, res, next) => {
  if (req.user && req.user.role === 'business') {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Business access only" });
};

// All routes require auth and business role
router.use(auth, requireBusiness);

// View or update page settings
router.get("/page-config", getPageConfig);
router.put("/page-config", updatePageConfig);

// Update business public profile details
router.put("/profile", updateProfile);

// Publish or Unpublish the page
router.post("/page-config/publish", publishPageConfig);
router.post("/page-config/unpublish", unpublishPageConfig);

export default router;
