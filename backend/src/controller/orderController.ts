import { eq, inArray } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { ApiError } from "../utils/apiError.js";
import {
  checkoutFromCartSchema,
  updateOrderStatusSchema,
} from "../validators/orderValidator.js";
import { products } from "../db/schema/productSchema.js";
import { orders } from "../db/schema/orderSchema.js";
import { orderItems } from "../db/schema/orderItemsSchema.js";
import { shippingInfo } from "../db/schema/shippingInfoSchema.js";
import { payments } from "../db/schema/paymentSchema.js";
import { cartItems } from "../db/schema/cartSchema.js";

export const checkoutFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shipping } = checkoutFromCartSchema.parse(req.body);
    const userId = req.user?.id as string;

    const newOrder = await db.transaction(async (tx) => {
      const cart = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.userId, userId));

      if (cart.length === 0) {
        throw new ApiError(400, "Your cart is empty");
      }

      const productIds = cart.map((item) => item.productId);

      const lockedProducts = await tx
        .select()
        .from(products)
        .where(inArray(products.id, productIds))
        .for("update");

      if (lockedProducts.length !== productIds.length) {
        throw new ApiError(
          400,
          "One or more products in your cart are no longer available",
        );
      }

      let totalAmount = 0;
      const orderItemsData = cart.map((item) => {
        const product = lockedProducts.find((p) => p.id === item.productId)!;

        if (product.stock < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
          );
        }

        totalAmount += product.price * item.quantity;

        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          image: product.image,
          title: product.name,
        };
      });

      const [order] = await tx
        .insert(orders)
        .values({ userId, totalAmount })
        .returning();

      await tx.insert(orderItems).values(
        orderItemsData.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      );

      await tx.insert(shippingInfo).values({
        orderId: order.id,
        ...shipping,
      });

      await tx.insert(payments).values({
        orderId: order.id,
        paymentType: "Online",
        paymentStatus: "Pending",
      });

      for (const item of cart) {
        const product = lockedProducts.find((p) => p.id === item.productId)!;
        await tx
          .update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.id, item.productId));
      }

      await tx.delete(cartItems).where(eq(cartItems.userId, userId));

      return order;
    });

    res.status(201).json({
      success: true,
      message: "Checkout initiated successfully. Proceed to payment.",
      data: {
        orderId: newOrder.id,
      },
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
    const userRole = req.user?.role as string;

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

    if (order.userId !== userId && userRole !== "admin") {
      throw new ApiError(403, "You are not authorized to view this order");
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
