CREATE TABLE "shipping_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"pincode" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_status" varchar(20) DEFAULT 'Pending' NOT NULL,
	"payment_intent_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_payment_intent_id_unique" UNIQUE("payment_intent_id")
);
--> statement-breakpoint
ALTER TABLE "shipping_info" ADD CONSTRAINT "shipping_info_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_address";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "payment_status";