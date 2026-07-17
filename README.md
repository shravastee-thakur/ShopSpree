# ShopSpree

It is a learning project. A high concurrency e-commerce backend designed for strict data integrity and secure financial transactions. Built to push past standard CRUD tutorials by implementing real world architectural patterns, atomic database transactions, and secure session management.

## Tech Stack

* **Runtime:** Node.js with TypeScript
* **Framework:** Express.js
* **Database:** PostgreSQL via Neon Serverless
* **ORM:** Drizzle ORM
* **Caching & Concurrency:** Redis with Lua scripting
* **Payments:** Stripe API
* **Email Delivery:** Brevo
* **File Storage:** Cloudinary

## Core Architectural Decisions

Most learning projects fail to handle edge cases. ShopSpree is built to handle them by default.

### Integer Currency Math
Prices are stored in paisa as integers. This eliminates the floating point precision errors inherent in JavaScript when calculating cart totals, applying discounts, or processing taxes.

### Atomic Transactions and Row Locking
The checkout flow reads from the cart and writes to the orders, order items, shipping, and payments tables inside a single database transaction. We use row level locking during the transaction to prevent inventory overselling when multiple users attempt to buy the last item simultaneously.

### Stateless Cart Design
Carts are mapped directly to users via a composite unique index on the user ID and product ID. This eliminates the need for a redundant parent cart table, cutting database write operations in half.

### Verified Purchase Reviews
Users cannot review products they have not bought. The review controller performs a multi table join across orders, order items, and payments to cryptographically verify a successful financial transaction before allowing a review to be inserted.

### Secure Session and OTP Management
Access tokens live in application memory while refresh tokens are secured in HttpOnly cookies to prevent Cross Site Scripting attacks. The Two Step login flow uses HMAC hashing and atomic Redis Lua scripts to enforce rate limits and block brute force attacks at the memory layer.

## Database Schema Highlights

* **Normalized Order Flow:** Orders are separated from order items to preserve historical pricing snapshots and allow for partial refunds.
* **JSONB Integration:** Product images utilize PostgreSQL JSONB columns to store Cloudinary URLs and public IDs natively, allowing direct extraction via SQL without parsing in JavaScript.
* **Composite Indexes:** Unique constraints on user and product combinations enforce business rules directly at the database engine level.

