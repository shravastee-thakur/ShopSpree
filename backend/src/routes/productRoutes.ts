import express from "express";
import * as productController from "../controller/productController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { allowRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  allowRole("admin"),
  upload.single("image"),
  productController.createProduct,
);

router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

router.put(
  "/:id",
  authenticate,
  allowRole("admin"),
  upload.single("image"),
  productController.updateProduct,
);
router.delete("/:id", authenticate, productController.deleteProduct);

export default router;
