import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema/userSchema.js";
import { env } from "../config/env.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import {
  type RegisterInput,
  type LoginInput,
  registerSchema,
  loginSchema,
} from "../validators/authValidator.js";

export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hashedPassword })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    return res.status(200).json({
      success: true,
      message: "Account created successfully",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = generateAccessToken({
      id: existingUser.id,
      role: existingUser.role,
    });

    const refreshToken = generateRefreshToken({
      id: existingUser.id,
      role: existingUser.role,
    });

    await db
      .update(users)
      .set({ refreshToken })
      .where(eq(users.id, existingUser.id));

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          },
          accessToken,
        },
      });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token not found");
    }

    const decoded = verifyRefreshToken(refreshToken);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id));
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.refreshToken !== refreshToken) {
      throw new ApiError(403, "Invalid refresh token");
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
    });

    await db
      .update(users)
      .set({ refreshToken: newRefreshToken })
      .where(eq(users.id, user.id));

    res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          accessToken: newAccessToken,
        },
      });
  } catch (error) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const decoded = verifyRefreshToken(refreshToken);
    await db
      .update(users)
      .set({ refreshToken: null })
      .where(eq(users.id, decoded.id));

    res
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    next(error);
  }
};
