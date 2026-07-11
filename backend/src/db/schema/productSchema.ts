import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./userSchema.js";
import { relations } from "drizzle-orm";

export interface CloudinaryImage {
  url: string;
  publicId: string;
}

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  ratings: real("ratings").default(0).notNull(),
  image: jsonb("image")
    .$type<CloudinaryImage>()
    .default({ url: "", publicId: "" })
    .notNull(),
  stock: integer("stock").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const productsRelations = relations(products, ({ one }) => ({
  creator: one(users, {
    fields: [products.createdBy],
    references: [users.id],
  }),
}));
