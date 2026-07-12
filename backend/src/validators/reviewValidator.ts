import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  rating: z
    .number()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating cannot exceed 5"),
  comment: z
    .string()
    .min(5, "Comment must be at least 5 characters")
    .max(1000, "Comment is too long")
    .trim(),
});

export const updateReviewSchema = z.object({
  rating: z.number().min(0).max(5).optional(),
  comment: z.string().min(5).max(1000).trim().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
