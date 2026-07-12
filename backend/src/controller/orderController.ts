import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { and, desc, eq } from "drizzle-orm";
import { ApiError } from "../utils/apiError.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/orderValidator.js";
import { products } from "../db/schema/productSchema.js";
import { orders } from "../db/schema/orderSchema.js";
import { orderItems } from "../db/schema/orderItemsSchema.js";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);

    const { items, shippingAddress } = validatedData;
    const userId = req.user?.id as string;

    const productIds = items.map((item) => item.productId);

    const productList = await db
      .select()
      .from(products)
      .where(and(...productIds.map((id) => eq(products.id, id))));

    if (productList.length !== items.length) {
      throw new ApiError(400, "One or more products not found");
    }

    for (const item of items) {
      const product = productList.find((p) => p.id === item.productId);
      if (!product) {
        throw new ApiError(400, `Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        );
      }
    }

    let totalAmount = 0;
    const orderItemsData = items.map((item) => {
      const product = productList.find((p) => p.id === item.productId)!;
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        image: product.image,
        title: product.name,
      };
    });

    const [newOrder] = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          totalAmount,
          shippingAddress,
        })
        .returning();

      const orderItemsWithOrderId = orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      }));

      await tx.insert(orderItems).values(orderItemsWithOrderId);

      for (const item of items) {
        const product = productList.find((p) => p.id === item.productId)!;
        await tx
          .update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.id, item.productId));
      }

      return [order];
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    res.status(200).json({
      success: true,
      data: userOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.userId !== userId && userRole !== "admin") {
      throw new ApiError(403, "You are not authorized to view this order");
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    res.status(200).json({
      success: true,
      data: {
        ...order,
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = req.params.id as string;
    const parsedBody = updateOrderStatusSchema.parse(req.body);

    const { status } = parsedBody;

    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existingOrder) {
      throw new ApiError(404, "Order not found");
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
