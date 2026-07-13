import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { orders } from "./orderSchema.js";
import { relations } from "drizzle-orm";

export const shippingInfo = pgTable("shipping_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  address: text("address").notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
});

export const shippingInfoRelations = relations(shippingInfo, ({ one }) => ({
  order: one(orders, {
    fields: [shippingInfo.orderId],
    references: [orders.id],
  }),
}));
