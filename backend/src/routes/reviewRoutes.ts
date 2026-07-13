import express from "express";
import * as reviewController from "../controller/reviewController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, reviewController.upsertReview);
router.delete("/:id", authenticate, reviewController.deleteReview);
router.get("/product/:productId", reviewController.getProductReviews);

export default router;
