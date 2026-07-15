import express from "express";
import * as adminController from "../controller/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { allowRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.use(allowRole("admin"));

router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/orders", adminController.getAllOrders);

export default router;
