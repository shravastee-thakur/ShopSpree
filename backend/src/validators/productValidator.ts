import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "../db/schema/productSchema.js";

const insertProductSchema = createInsertSchema(products);

export const createProductSchema = insertProductSchema
  .pick({
    name: true,
    description: true,
    price: true,
    category: true,
    stock: true,
  })
  .extend({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(255)
      .trim(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .trim(),
    price: z.coerce.number().int().positive("Price must be greater than 0"),
    category: z.string().min(2).max(100).trim(),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  });

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  category: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
