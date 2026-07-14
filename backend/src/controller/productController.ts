import { Request, Response, NextFunction } from "express";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { products } from "../db/schema/productSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/apiError.js";
import {
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
} from "../validators/productValidator.js";
import { uploadImageToCloudinary } from "../config/cloudinary.js";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Product image is required");
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Unauthorized: User ID not found");
    }

    const { name, description, price, category, stock } =
      createProductSchema.parse(req.body);

    const cloudinaryResult = await uploadImageToCloudinary(req.file.buffer);

    const image = {
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
    };

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        description,
        price,
        category,
        stock,
        image,
        createdBy: userId,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = productQuerySchema.parse(req.query);

    const { page, limit, category, minPrice, maxPrice } = validatedData;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (category) {
      conditions.push(eq(products.category, category));
    }
    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice));
    }
    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [productList, countResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(products.createdAt)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause),
    ]);

    const totalProducts = Number(countResult[0].count);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      data: {
        products: productList,
        pagination: {
          totalProducts,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = req.params.id as string;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = req.params.id as string;

    const validatedData = updateProductSchema.parse(req.body);

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existingProduct) {
      throw new ApiError(404, "Product not found");
    }

    let image = existingProduct.image;
    if (req.file) {
      const cloudinaryResult = await uploadImageToCloudinary(req.file.buffer);
      image = {
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.public_id,
      };
    }

    const [updatedProduct] = await db
      .update(products)
      .set({ ...validatedData, image })
      .where(eq(products.id, productId))
      .returning();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productId = req.params.id as string;

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!existingProduct) {
      throw new ApiError(404, "Product not found");
    }

    if (existingProduct.image?.publicId) {
      await cloudinary.uploader.destroy(existingProduct.image.publicId);
    }

    await db.delete(products).where(eq(products.id, productId));

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
