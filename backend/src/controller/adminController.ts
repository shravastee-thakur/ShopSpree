import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { orders } from "../db/schema/orderSchema.js";
import { products } from "../db/schema/productSchema.js";
import { users } from "../db/schema/userSchema.js";

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        totalRevenue: sql<number>`coalesce(sum($(orders.totalAmount)), 0)`,
      })
      .from(orders);

    const [userStats] = await db
      .select({ totalUsers: sql<number>`count(*)` })
      .from(users);

    const [productStats] = await db
      .select({ totalProducts: sql<number>`count(*)` })
      .from(products);

    res.status(200).json({
      success: true,
      data: {
        totalOrders: Number(orderStats.totalOrders),
        totalRevenue: Number(orderStats.totalRevenue),
        totalUsers: Number(userStats.totalUsers),
        totalProducts: Number(productStats.totalProducts),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const allOrders = await db.query.orders.findMany({
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      limit: limit,
      offset: offset,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
        shipping: true,
        payment: true,
      },
    });

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    const totalOrders = Number(countResult.count);
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      success: true,
      data: {
        orders: allOrders,
        pagination: {
          totalOrders,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
