# SubTrckr 🚀
### The Ultimate SaaS Subscription Management Platform

![SubTrckr Hero Banner](file:///C:/Users/ABUZAR/.gemini/antigravity/brain/fc1464af-6854-4dcf-87e4-81309ee94f6e/subtrckr_hero_banner_1776752299313.png)

---

## 📖 Introduction
**SubTrckr** is a production-grade, full-stack SaaS platform designed to empower business owners to launch, manage, and scale subscription-based services with ease. It provides a seamless bridge between businesses offering value and customers seeking professional subscription experiences.

Built with a focus on **security, performance, and scalability**, SubTrckr handles everything from dynamic landing page generation and secure Razorpay payments to deep business analytics and automated subscription lifecycle management.

---

## ✨ Key Features

### 🏢 For Businesses
- **Dynamic Landing Pages**: Instantly generated, fully customizable subscription pages for every business.
- **Advanced Dashboard**: Comprehensive overview of MRR, churn, and subscriber growth.
- **Plan Management**: Create, edit, and archive subscription tiers with flexible billing cycles (Monthly/Yearly).
- **Customer Insights**: Detailed tracking of subscriber behavior and payment history.
- **Theme Customization**: Real-time preview and publishing of brand-specific styles.

### 👤 For Customers
- **Unified Portal**: Manage all active and past subscriptions in one clean interface.
- **Secure Payments**: One-click checkout and renewal powered by Razorpay.
- **Subscription Control**: Easy options to pause, resume, or cancel subscriptions.
- **Billing History**: Transparent access to transaction logs and invoices.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (React 19), Tailwind CSS, Radix UI |
| **Backend** | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/) |
| **Database** | [MySQL](https://www.mysql.com/) (using `mysql2` with parameterized queries) |
| **Payments** | [Razorpay](https://razorpay.com/) (Orders API & Webhooks) |
| **State Management** | React Context API & Custom Hooks |
| **Automation** | `node-cron` (Background Jobs), Selenium (Testing Bot) |

---

## ⭐ Architecture
SubTrckr follows a clean, decoupled architecture designed for high maintainability.

### 🔌 Backend (Express API)
**Flow**: `Routes` ➔ `Middlewares` (Auth/Role) ➔ `Controllers` ➔ `DB (MySQL)`
- **Separation of Concerns**: Business logic is isolated within controllers.
- **Stateless Auth**: JWT-based authentication with roles stored in HTTP-only cookies.

### 🎨 Frontend (Next.js App Router)
**Flow**: `apiClient` ➔ `Custom Hooks` ➔ `Stateful Components`
- **Centralized API**: All requests route through a unified `apiClient` for consistent error handling and type safety.
- **Modular Components**: Design system built on Tailwind primitives for zero-config visual consistency.

---

## 🔄 Core Workflows

### 💳 Subscription Lifecycle
1. **Creation**: When a user selects a plan, a subscription is created in the database with an `inactive` status.
2. **Payment Intent**: A Razorpay Order is generated and returned to the frontend.
3. **Verification**: Upon successful checkout, the frontend sends payment signature details for verification.
4. **Activation (Source of Truth)**: The backend verifies the HMAC signature. The **Razorpay Webhook** acts as the final source of truth, updating the subscription status to `active` and recording a `subscription_event`.

---

## ⭐ Database Overview

SubTrckr uses a relational MySQL schema optimized for auditing and chronological tracking.

- **`users`**: Central registry for businesses and customers.
- **`plans`**: Stores subscription tiers with JSON fields for flexible feature lists.
- **`subscriptions`**: The core link between users and plans, tracking `status`, `expires_at`, and `started_at`.
- **`subscription_events`**: A chronological audit trail (Created ➔ Paused ➔ Active ➔ Expired) for every subscription.
- **`business_profiles`**: Powers dynamic routing via unique `slugs`.
- **`page_configs`**: Stores JSON-based theme and layout styling for landing pages.
- **`payments`**: Detailed logs of every transaction including raw Razorpay payloads.

> [!NOTE]
> **Computed Logic**: Subscription status is regularly updated by a background job that compares `expires_at` with the current timestamp.

---

## ⭐ API Overview

| Group | Purpose |
| :--- | :--- |
| `/api/auth` | User registration, login, and secure session management. |
| `/api/plans` | CRUD operations for subscription tiers (Business only). |
| `/api/subscriptions` | Core lifecycle management (Pause, Resume, Cancel). |
| `/api/analytics` | Business intelligence: MRR, Churn, and Growth metrics. |
| `/api/user` | Profile management and user-specific dashboard data. |
| `/api/payment` | Razorpay order creation and webhook verification. |
| `/api/config` | Landing page theme and layout settings. |

---

## ⭐ Analytics Implementation
The platform provides high-fidelity business metrics using SQL-side aggregations for maximum performance and accuracy.

- **MRR Normalization**: Automatically converts Yearly plan prices (`yearly / 12`) to provide a consistent Monthly Recurring Revenue view.
- **Zero-Filled Series**: Backend helper functions ensure time-series charts (Revenue/Growth) show `0` for days with no activity, preventing "broken" trends.
- **Churn Tracking**: Real-time calculation of cancellation rates within 7/30/90-day windows.
- **Plan Performance**: Comparative analysis of which tiers generate the most revenue vs. subscriber volume.

---

## ⭐ Security
- **JWT Protection**: Tokens are signed using `HS256` and stored in **HTTP-only, SameSite: Strict** cookies to prevent XSS and CSRF.
- **Role-Based Access Control (RBAC)**: Specialized middlewares (`requireBusiness`, `requireCustomer`) protect sensitive routes.
- **SQL Data Safety**: Every query uses **parameterized inputs** via `mysql2` to eliminate SQL Injection risks.
- **Payment Integrity**: Razorpay webhook payloads are verified using **HMAC SHA256** signatures before any database state change.

---

## ⭐ Performance
- **Indexed Queries**: Critical tables are indexed on `business_id`, `status`, and `dates` to ensure sub-millisecond response times under load.
- **Frontend Optimization**: 
  - Uses `AbortController` in all data hooks to prevent race conditions and unnecessary network overhead.
  - Component-level lazy loading for complex charts.
- **SQL-First Logic**: Heavy calculations (like MRR and Growth) are performed in the database, avoid expensive JS-side loops.
- **Pagination**: All list views (Customers, Subscriptions, Transactions) implement cursor-based or offset pagination.

---

## 📂 Project Structure

```text
dbmsProject_Subtracker/
├── Frontend/           # Next.js Application
│   ├── app/           # App Router (Pages & Layouts)
│   ├── components/    # Atomic Designing (Dashboard, Charts, Shared)
│   ├── hooks/         # Logic Reusability (useAuth, useAnalytics)
│   ├── lib/           # Core API Client & Utilities
│   └── styles/        # Global Design System (Tailwind)
├── backend/           # Express.js API
│   ├── src/
│   │   ├── controllers/ # Business Logic
│   │   ├── jobs/       # Background Cron Tasks
│   │   ├── middlewares/ # Auth & RBAC
│   │   ├── mysqlDB/    # Schema & Migrations
│   │   ├── routes/     # API Endpoints
│   │   └── utils/      # Helpers (Security, Razorpay)
└── bot/               # Subscriber Simulation Bot (Python/Selenium)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- Razorpay Account (for keys)

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your .env file
node src/mysqlDB/migrate_razorpay.js  # Initialize DB
npm run dev
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev  # Starts on localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3030
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=subtrckrdb
JWT_SECRET=your_super_secret_key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

---

## 📸 Screenshots (Placeholders)
> [!TIP]
> Replace these with actual screenshots of your running application.

- **[Business Dashboard]**: High-level metrics showing MRR and subscriber growth.
- **[Analytics Page]**: Detailed Churn and Plan Performance charts.
- **[Subscription Page]**: Dynamically themed landing page for a business.
- **[Customer Portal]**: List of active subscriptions with manage buttons.

---

## 🗺️ Future Roadmap
- [ ] **Razorpay Route**: Automated commission splits between platform and businesses.
- [ ] **Multi-Currency**: Support for global payments (USD, EUR) beyond INR.
- [ ] **Coupon System**: Dynamic discount codes for promotion-driven growth.
- [ ] **Real-time Notifications**: Email (SendGrid) and Webhook alerts for renewals.
- [ ] **Advanced Admin Panel**: Platform-wide monitoring for the site owner.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
