import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { orders } from "./orderSchema.js";
import { relations } from "drizzle-orm";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  paymentType: varchar("payment_type", {
    length: 20,
    enum: ["Online"],
  }).notNull(),
  paymentStatus: varchar("payment_status", {
    length: 20,
    enum: ["Paid", "Pending", "Failed"],
  })
    .default("Pending")
    .notNull(),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));
