import express from "express";
import * as orderController from "../controller/orderController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { allowRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/checkout", authenticate, orderController.checkoutFromCart);
router.get("/", authenticate, orderController.getUserOrders);
router.get("/:id", authenticate, orderController.getOrderById);
router.put(
  "/:id/status",
  authenticate,
  allowRole("admin"),
  orderController.updateOrderStatus,
);

export default router;
