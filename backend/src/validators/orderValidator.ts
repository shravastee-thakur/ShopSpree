import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID format"),
        quantity: z.number().int().positive("Quantity must be greater than 0"),
      }),
    )
    .min(1, "Order must contain at least one item"),
  shipping: z.object({
    fullName: z.string().min(2, "Name is too short").max(100).trim(),
    state: z.string().min(2).max(100).trim(),
    city: z.string().min(2).max(100).trim(),
    country: z.string().min(2).max(100).trim(),
    address: z.string().min(5, "Address is too short").max(500).trim(),
    pincode: z.string().regex(/^\d{4,10}$/, "Invalid pincode format"),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
