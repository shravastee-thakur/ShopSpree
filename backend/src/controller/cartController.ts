import { and, eq, sql } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { cartItems } from "../db/schema/cartSchema.js";
import { products } from "../db/schema/productSchema.js";
import { ApiError } from "../utils/apiError.js";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validators/cartValidator.js";

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId, quantity } = addToCartSchema.parse(req.body);

    const userId = req.user?.id as string;

    const cartItem = await db.transaction(async (tx) => {
      // Lock the product row to prevent concurrent stock manipulation
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1)
        .for("update");

      if (!product) {
        throw new ApiError(404, "Product not found");
      }

      // Lock the cart item row if it exists
      const [existingCartItem] = await db
        .select()
        .from(cartItems)
        .where(
          and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)),
        )
        .limit(1)
        .for("update");

      const currentQty = existingCartItem ? existingCartItem.quantity : 0;
      const newTotalQty = currentQty + quantity;

      if (product.stock < newTotalQty) {
        throw new ApiError(
          400,
          `Insufficient stock. You already have ${currentQty} in your cart and only ${product.stock} are available.`,
        );
      }

      const [newCartItem] = await db
        .insert(cartItems)
        .values({ userId, productId, quantity })
        .onConflictDoUpdate({
          target: [cartItems.userId, cartItems.productId],
          set: {
            quantity: sql`${cartItems.quantity} + ${quantity}`,
          },
        })
        .returning();

      return newCartItem;
    });

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    const cart = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: {
        product: {
          columns: {
            id: true,
            name: true,
            price: true,
            image: true,
            stock: true,
          },
        },
      },
    });

    let totalAmount = 0;
    const formattedItems = cart.map((item) => {
      const lineTotal = item.product.price * item.quantity;
      totalAmount += lineTotal;

      return {
        cartItemId: item.id,
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        stock: item.product.stock,
        quantity: item.quantity,
        lineTotal,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        items: formattedItems,
        totalAmount,
        totalItems: cart.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cartId = req.params.id as string;
    const userId = req.user?.id as string;
    const { quantity } = updateCartItemSchema.parse(req.body);

    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, cartId))
      .limit(1);

    if (!existingItem) {
      throw new ApiError(404, "Cart item not found");
    }

    if (existingItem.userId !== userId) {
      throw new ApiError(403, "You can only update your own cart");
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, existingItem.productId))
      .limit(1);

    if (product.stock < quantity) {
      throw new ApiError(
        400,
        `Insufficient stock. Only ${product.stock} available`,
      );
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, cartId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Cart item updated",
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cartId = req.params.id as string;
    const userId = req.user?.id as string;

    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, cartId))
      .limit(1);

    if (!existingItem) {
      throw new ApiError(404, "Cart item not found");
    }

    if (existingItem.userId !== userId) {
      throw new ApiError(403, "You can only modify your own cart");
    }

    await db.delete(cartItems).where(eq(cartItems.id, cartId));

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    await db.delete(cartItems).where(eq(cartItems.userId, userId));

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};
