import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./userSchema.js";
import { relations } from "drizzle-orm";
import { orderItems } from "./orderItemsSchema.js";
import { shippingInfo } from "./shippingInfoSchema.js";
import { payments } from "./paymentSchema.js";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  totalAmount: integer("total_amount").notNull(),
  status: varchar("status", {
    length: 20,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
  }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  shipping: one(shippingInfo),
  payment: one(payments),
}));
