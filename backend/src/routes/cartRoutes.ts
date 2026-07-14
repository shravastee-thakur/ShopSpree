import express from "express";
import * as cartController from "../controller/cartController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, cartController.addToCart);
router.get("/", authenticate, cartController.getCart);
router.put("/:id", authenticate, cartController.updateCartItem);
router.delete("/:id", authenticate, cartController.removeFromCart);
router.delete("/", authenticate, cartController.clearCart);

export default router;
