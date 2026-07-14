import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
