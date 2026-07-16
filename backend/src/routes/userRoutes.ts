import express from "express";
import * as userController from "../controller/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", userController.register);
router.post("/initiate-login", userController.initiateLogin);
router.post("/verify", userController.verifyOtp);
router.post("/refresh", userController.refreshTokenHandler);
router.post("/logout", authenticate, userController.logout);

export default router;
