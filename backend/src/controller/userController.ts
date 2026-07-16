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
import crypto from "crypto";
import { consumeOtp, saveOtp } from "../utils/otp.js";
import { sendMail } from "../utils/email.js";

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

export const generateOtp = (): string => {
  return String(crypto.randomInt(100000, 999999));
};

export function hashOtp(otp: string): string {
  return crypto.createHmac("sha256", env.HMAC_SECRET).update(otp).digest("hex");
}

export const initiateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      throw new ApiError(404, "No account found with this email");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    await saveOtp(email, hashedOtp);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #333;">Your Verification Code</h2>
        <p style="color: #555;">Use the following OTP to log in to your account. This code is valid for 5 minutes.</p>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
          <h1 style="color: #2563eb; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #888; font-size: 12px;">If you did not request this code, please ignore this email or contact support if you suspect unauthorized activity.</p>
      </div>
    `;

    await sendMail(email, "Your Login OTP", htmlContent);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ApiError(400, "Email and OTP are required");
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      throw new ApiError(404, "No account found with this email");
    }

    const hashedInput = hashOtp(otp);
    const result = await consumeOtp(email, hashedInput);

    if (result === -1) {
      throw new ApiError(
        429,
        "Too many failed attempts. Please request a new OTP",
      );
    }

    if (result === 0) {
      throw new ApiError(401, "Invalid or expired OTP");
    }

    if (!existingUser.isVerified) {
      await db
        .update(users)
        .set({ isVerified: true })
        .where(eq(users.id, existingUser.id));
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
            isVerified: true,
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
