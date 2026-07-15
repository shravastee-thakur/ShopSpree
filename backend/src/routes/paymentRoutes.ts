import express from "express";
import * as paymentController from "../controller/paymentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/create-session",
  authenticate,
  paymentController.createCheckoutSession,
);
router.post("/verify", authenticate, paymentController.verifyPayment);

export default router;
