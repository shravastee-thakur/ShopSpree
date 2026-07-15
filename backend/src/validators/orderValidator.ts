import { z } from "zod";

export const checkoutFromCartSchema = z.object({
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

export type CheckoutFromCartInput = z.infer<typeof checkoutFromCartSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
