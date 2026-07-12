import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { eq, sql } from "drizzle-orm";
import { reviews } from "../db/schema/reviewSchema.js";
import { products } from "../db/schema/productSchema.js";
import { createReviewSchema } from "../validators/reviewValidator.js";

async function recalculateProductRating(productId: string) {
  const [avgResult] = await db
    .select({ average: sql<string>`round(avg(${reviews.rating})::numeric, 1)` })
    .from(reviews)
    .where(eq(reviews.productId, productId));

  const newAverage = avgResult.average ? parseFloat(avgResult.average) : 0;

  await db
    .update(products)
    .set({ ratings: newAverage })
    .where(eq(products.id, productId));
}

export const upsertReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedBody = createReviewSchema.parse(req.body);

    const { productId, rating, comment } = parsedBody;
    const userId = req.user?.id as string;

    const [review] = await db
      .insert(reviews)
      .values({ productId, userId, rating, comment })
      .onConflictDoUpdate({
        target: [reviews.productId, reviews.userId],
        set: { rating, comment, updatedAt: new Date() },
      })
      .returning();

    await recalculateProductRating(productId);

    res.status(200).json({
      success: true,
      message: "Review saved successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
