import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { env } from "../config/env.js";
import { ApiError } from "./apiError.js";
dotenv.config();

export interface TokenPayload {
  id: string;
  role: "admin" | "user";
}

const accessSecret = env.ACCESS_SECRET;
if (!accessSecret) {
  throw new ApiError(401, "accessSecret environment variable is not defined");
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, accessSecret, { expiresIn: "7d" });
};

const refreshSecret = env.REFRESH_SECRET;
if (!refreshSecret) {
  throw new ApiError(401, "refreshSecret environment variable is not defined");
}

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, accessSecret) as TokenPayload;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, refreshSecret) as TokenPayload;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};
