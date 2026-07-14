import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { eq, sql } from "drizzle-orm";
import { reviews } from "../db/schema/reviewSchema.js";
import { products } from "../db/schema/productSchema.js";
import { createReviewSchema } from "../validators/reviewValidator.js";
import { ApiError } from "../utils/apiError.js";
import { users } from "../db/schema/userSchema.js";

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
    const { productId, rating, comment } = createReviewSchema.parse(req.body);

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

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviewId = req.params.id as string;
    const userId = req.user?.id as string;

    const [existingReview] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!existingReview) {
      throw new ApiError(404, "Review not found");
    }

    if (existingReview.userId !== userId) {
      throw new ApiError(403, "You can only delete your own reviews");
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    await recalculateProductRating(existingReview.productId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = req.params.productId as string;

    const reviewList = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: users.name,
      })
      .from(reviews)
      //We tell the database to match the userId column in the reviews table with the id column in the users table. We use leftJoin instead of innerJoin so that if a user account is somehow deleted but the review remains, the query still returns the review with a null user name instead of dropping the row entirely.
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(reviews.createdAt);

    res.status(200).json({
      success: true,
      data: reviewList,
    });
  } catch (error) {
    next(error);
  }
};
