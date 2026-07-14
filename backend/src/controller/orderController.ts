import e, { Request, Response, NextFunction } from "express";
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
import { shippingInfo } from "../db/schema/shippingInfoSchema.js";
import { payments } from "../db/schema/paymentSchema.js";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { items, shipping } = createOrderSchema.parse(req.body);

    const userId = req.user?.id as string;

    const productIds = items.map((item) => item.productId);

    const productList = await db
      .select()
      .from(products)
      .where(and(...productIds.map((id) => eq(products.id, id))));

    if (productList.length !== items.length) {
      throw new ApiError(400, "One or more products not found");
    }

    let totalAmount = 0;
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
      totalAmount += product.price * item.quantity;
    }

    const [newOrder] = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          totalAmount,
        })
        .returning();

      await tx.insert(orderItems).values(
        items.map((item) => {
          const product = productList.find((p) => p.id === item.productId)!;
          return {
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
            image: product.image,
            title: product.name,
          };
        }),
      );

      await tx.insert(shippingInfo).values({
        orderId: order.id,
        ...shipping,
      });

      await tx.insert(payments).values({
        orderId: order.id,
        paymentStatus: "Pending",
      });

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
    const userId = req.user?.id as string;

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: {
        items: true,
        shipping: true,
        payment: true,
      },
    });

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
    const userId = req.user?.id as string;

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        shipping: true,
        payment: true,
      },
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    res.status(200).json({
      success: true,
      data: order,
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
    const { status } = updateOrderStatusSchema.parse(req.body);

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
