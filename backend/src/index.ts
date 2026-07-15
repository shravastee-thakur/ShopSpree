import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import cookiePraser from "cookie-parser";
import { errorHandler } from "./middleware/errorMiddleware.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(cookiePraser());

app.use("/api/v1/users", userRoutes);
// http://localhost:3000/api/v1/users/register

app.use("/api/v1/products", productRoutes);
// http://localhost:3000/api/v1/products/

app.use("/api/v1/orders", orderRoutes);
// http://localhost:3000/api/v1/orders/

app.use("/api/v1/reviews", reviewRoutes);
// http://localhost:3000/api/v1/reviews/

app.use("/api/v1/cart", cartRoutes);
// http://localhost:3000/api/v1/cart/

app.use("/api/v1/payments", paymentRoutes);
// http://localhost:3000/api/v1/payments/create-session

app.use("/api/v1/admin", adminRoutes);
// http://localhost:3000/api/v1/admin/dashboard/stats

app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
