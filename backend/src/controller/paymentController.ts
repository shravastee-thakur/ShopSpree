import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { env } from "../config/env.js";
import { orders } from "../db/schema/orderSchema.js";
import { db } from "../db/index.js";
import { ApiError } from "../utils/apiError.js";
import { eq } from "drizzle-orm";
import { payments } from "../db/schema/paymentSchema.js";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-06-24.dahlia",
});

export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?.id as string;

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: {
              columns: {
                name: true,
                image: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.userId !== userId) {
      throw new ApiError(403, "You can only pay for your own orders");
    }

    if (order.payment?.paymentStatus === "Paid") {
      throw new ApiError(400, "This order has already been paid");
    }

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.title,
          images: item.image.url ? [item.image.url] : [],
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,

      success_url: `${env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        orderId: order.id,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      throw new ApiError(400, "Session ID is required");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new ApiError(400, "Payment not completed");
    }

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      throw new ApiError(400, "Invalid session: no order ID found");
    }

    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (!existingPayment) {
      throw new ApiError(404, "Payment record not found");
    }

    if (existingPayment.paymentStatus === "Paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: { orderId },
      });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(payments)
        .set({
          paymentStatus: "Paid",
          paymentIntentId: session.payment_intent as string,
        })
        .where(eq(payments.orderId, orderId));

      await tx
        .update(orders)
        .set({
          status: "processing",
        })
        .where(eq(orders.id, orderId));
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: { orderId },
    });
  } catch (error) {
    next(error);
  }
};
