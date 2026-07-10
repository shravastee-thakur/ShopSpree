import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import cookiePraser from "cookie-parser";

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

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});
