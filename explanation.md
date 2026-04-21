# SubTrckr - Comprehensive Project Documentation

SubTrckr is a modern, full-stack **SaaS Subscription Management Platform** designed to help business owners launch and track subscription businesses with ease. It bridges the gap between businesses offering services/products and customers who want a seamless subscription experience.

---

## 🚀 Project Overview

The project is built to handle the entire lifecycle of a subscription business:
- **Businesses** can create custom subscription plans and share a dynamic landing page.
- **Customers** can browse plans, pay securely via Razorpay, and manage their active subscriptions.
- **System** automates the management of statuses (active, paused, expired) and provides real-time analytics.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Styling**: Tailwind CSS with custom HSL-based color variables.
- **UI Components**: Radix UI (Primitives) for accessible, high-performance UI components.
- **State Management**: React Hooks & Context API.
- **Forms & Validation**: React Hook Form with Zod schema validation.
- **Charts**: Recharts and Chart.js for business and user analytics.

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (using `mysql2` driver)
- **Authentication**: JWT (JSON Web Tokens) stored in HTTP-only cookies.
- **Security**: `bcrypt` for password hashing and HMAC signature verification for payment webhooks.
- **Automation**: `node-cron` for scheduled background tasks.

### Infrastructure & External Services
- **Payments**: [Razorpay](https://razorpay.com/) (Orders API, Webhooks, Signature Verification).
- **Automation Bot**: Python with Selenium and Faker for automated testing and simulation.

---

## 📂 Project Structure

```text
dbmsProject_Subtracker/
├── Frontend/           # Next.js Application
│   ├── app/           # App Router (Pages: /dashboard, /subscribe, etc.)
│   ├── components/    # Reusable UI components (Shared & Dashboard specific)
│   ├── hooks/         # Custom React hooks (useAuth, useAnalytics, etc.)
│   ├── lib/           # Utility functions (apiClient, formatters)
│   └── styles/        # Global CSS & Tailwind configuration
├── backend/           # Express API
│   ├── src/
│   │   ├── controllers/ # Request handlers (Auth, Plans, Payments, etc.)
│   │   ├── jobs/       # Scheduled tasks (Expire subscriptions)
│   │   ├── middlewares/ # Auth & Validation middlewares
│   │   ├── mysqlDB/    # Database Schema & Migrations
│   │   ├── routes/     # API route definitions
│   │   └── utils/      # Helpers (Razorpay instance, error handlers)
│   └── index.js       # Main server entry point
├── bot/               # Python Automation Script
│   └── subscriber_bot.py # Selenium bot for automated sign-ups
└── API_DOCUMENTATION.md # Detailed API Reference
```

---

## 🗄️ Database Schema (The "Bits")

The project uses a structured MySQL schema with the following core tables:

### 1. `users`
Stores all account information.
- `role`: Distinguishes between `business` (creators) and `customer` (subscribers).
- `email`: Unique identifier for login.

### 2. `plans`
Defined by businesses to sell subscriptions.
- `price` & `billing_cycle`: Determines the cost (Monthly/Yearly).
- `features` & `benefits`: Stored as JSON to allow flexible plan descriptions.
- `discount`: Optional percentage-based discounts.

### 3. `subscriptions`
The core link between customers and plans.
- `status`: `active`, `paused`, `cancelled`, `expired`, or `inactive`.
- `razorpay_order_id`: Tracks the payment intent.
- `expires_at`: Calculated based on the billing cycle.

### 4. `business_profiles` & `page_configs`
Power the dynamic landing pages.
- `slug`: Unique URL for the business (e.g., `subtrckr.com/subscribe/my-brand`).
- `theme` & `layout`: JSON payloads that determine how the landing page looks for customers.

### 5. `payments`
Audits every transaction.
- Stores `razorpay_payment_id` and raw webhook payloads for debugging and financial tracking.

---

## 🔄 Core Workflows

### 1. The Subscription Flow
1. **Selection**: Customer visits a business landing page and selects a plan.
2. **Order Creation**: Backend creates a Razorpay Order and returns it to the frontend.
3. **Payment**: Customer completes payment using Razorpay's checkout modal.
4. **Verification**: Frontend sends payment details to `/api/payments/verify`.
5. **Webhook**: Razorpay sends a `payment.captured` event to the backend. The backend verifies the HMAC signature and marks the subscription as `active`.

### 2. Automated Expiry Job
A background job runs periodically using `node-cron`:
- It checks for subscriptions where `expires_at` < `CURRENT_TIMESTAMP`.
- It moves the status from `active` to `expired` automatically, ensuring users cannot access services after their time is up.

---

## 🤖 Automation Bot
The `bot/subscriber_bot.py` script is a powerful tool for testing:
- **Selenium + Firefox**: It simulates real browser usage.
- **Faker**: Generates random usernames and emails.
- **Functionality**: It can register a new user, navigate to a specific subscription link, and "click" its way through the entire subscription process.

---

## 🔑 Key Features Recap
- **Role-Based Dashboards**: Entirely different experiences for Businesses vs Customers.
- **Dynamic Routing**: Landing pages generated on-the-fly based on business usernames.
- **Subscription Lifecycle**: Robust state management (Resume/Pause/Cancel).
- **Payment Integrity**: Dual-layered verification (Frontend + Webhook).
- **Auditing**: History of every status change (Created -> Paused -> Resumed).

---

## 🛠️ Setup & Execution

### Backend
1. `cd backend`
2. `npm install`
3. Configure `.env` (DB_HOST, DB_USER, DB_PASSWORD, RAZORPAY_KEY_ID, etc.)
4. `node src/mysqlDB/migrate_razorpay.js` (Run migrations)
5. `npm run dev`

### Frontend
1. `cd Frontend`
2. `npm install`
3. `npm run dev` (Runs on `localhost:3000`)
