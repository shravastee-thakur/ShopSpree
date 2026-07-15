import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { desc, eq, lte, sql } from "drizzle-orm";
import { orders } from "../db/schema/orderSchema.js";
import { products } from "../db/schema/productSchema.js";
import { users } from "../db/schema/userSchema.js";
import { payments } from "../db/schema/paymentSchema.js";
import { orderItems } from "../db/schema/orderItemsSchema.js";

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [revenueResult] = await db
      .select({
        total: sql<number>`coalesce(sum(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .innerJoin(payments, eq(orders.id, payments.orderId))
      .where(eq(payments.paymentStatus, "Paid"));

    const totalRevenueAllTime = Number(revenueResult.total);

    const [userStats] = await db
      .select({ totalUsers: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, "user"));

    const totalUsersCount = Number(userStats.totalUsers);

    const orderStatusCountsRaw = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)::int`,
      })
      .from(orders)
      .innerJoin(payments, eq(orders.id, payments.orderId))
      .where(eq(payments.paymentStatus, "Paid"))
      .groupBy(orders.status);

    const orderStatusCount = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orderStatusCountsRaw.forEach((row) => {
      if (row.status && row.status in orderStatusCount) {
        orderStatusCount[row.status as keyof typeof orderStatusCount] = Number(
          row.count,
        );
      }
    });

    const lowStockProducts = await db
      .select({
        name: products.name,
        stock: products.stock,
      })
      .from(products)
      .where(lte(products.stock, 5));

    const topSellingProducts = await db
      .select({
        name: products.name,
        category: products.category,
        rating: products.ratings,
        image: sql<string>`${products.image}->>'url'`,
        totalSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(payments, eq(orders.id, payments.orderId))
      .where(eq(payments.paymentStatus, "Paid"))
      .groupBy(
        products.id,
        products.name,
        products.category,
        products.ratings,
        products.image,
      )
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalRevenueAllTime,
        totalUsersCount,
        orderStatusCount,
        lowStockProducts,
        topSellingProducts,
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
