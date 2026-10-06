# SubDesk

### A Comprehensive SaaS Subscription Management Platform

![SubDesk Hero Banner](./Frontend/public/Hero.png)

---

## Table of Contents
- [Introduction](#introduction)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Core Workflows](#core-workflows)
- [Database Overview](#database-overview)
- [API Overview](#api-overview)
- [Analytics Implementation](#analytics-implementation)
- [Security](#security)
- [Performance](#performance)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Introduction

SubDesk is a production-grade SaaS platform designed to facilitate business scaling by streamlining billing logic and subscription management. It manages complex operational requirements, including dynamic landing pages, Razorpay integrations, and comprehensive analytics, allowing organizations to focus on their core business objectives. 

Engineered with a strict focus on security and performance, SubDesk bridges the gap between service delivery and customer acquisition, ensuring a seamless subscription lifecycle from initial onboarding to recurring billing.

---

## Key Features

### For Businesses
- **Dynamic Landing Pages**: Enables rapid deployment of customized, visually appealing pages without manual coding.
- **Advanced Dashboard**: Comprehensive monitoring of key performance indicators, including Monthly Recurring Revenue (MRR) and churn rates.
- **Plan Management**: Efficiently create, modify, and archive subscription tiers to adapt to market demands and pricing strategies.
- **Customer Insights**: Detailed tracking of subscriber behavior to drive informed decision-making.
- **Theme Customization**: Real-time preview and publishing capabilities to ensure brand consistency across all customer touchpoints.

### For Customers
- **Unified Portal**: A centralized dashboard for customers to manage all active subscriptions seamlessly.
- **Secure Payments**: Reliable and secure Razorpay-powered checkout experience.
- **Subscription Control**: Automated and intuitive options to pause, resume, or cancel subscriptions.
- **Billing History**: Transparent access to transaction logs and downloadable invoices.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (React 19), Tailwind CSS, Radix UI |
| **Backend** | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/) |
| **Database** | [MySQL](https://www.mysql.com/) |
| **Payments** | [Razorpay](https://razorpay.com/) |
| **State Management** | React Context API & Custom Hooks |
| **Automation** | `node-cron` & Selenium |

---

## Architecture

SubDesk implements a decoupled architecture to ensure scalability, maintainability, and clear separation of concerns.

### Backend (Express API)
**Flow**: `Routes` ➔ `Middlewares` (Auth/Role) ➔ `Controllers` ➔ `DB (MySQL)`
- **Separation of Concerns**: Business logic is rigorously isolated within controllers.
- **Stateless Authentication**: JWT-based authentication with roles stored securely in HTTP-only cookies, mitigating the risk of Cross-Site Scripting (XSS) attacks.

### Frontend (Next.js App Router)
**Flow**: `apiClient` ➔ `Custom Hooks` ➔ `Stateful Components`
- **Centralized API**: All requests route through a unified `apiClient` for consistent error handling and type safety.
- **Modular Components**: A design system built on Tailwind primitives for visual consistency and maintainability.

---

## Core Workflows

### Subscription Lifecycle
1. **Creation**: The user selects a plan, and an `inactive` subscription record is created.
2. **Payment Intent**: A Razorpay Order is generated to initiate the transaction.
3. **Verification**: The frontend transmits signature details for backend validation.
4. **Activation**: The backend verifies the HMAC signature. The **Razorpay Webhook** serves as the source of truth, updating the subscription status to `active` and securely recording the event.

---

## Database Overview

SubDesk utilizes a relational MySQL schema optimized for auditing, chronological tracking, and data integrity.

- **`users`**: The central registry for all user identities and roles.
- **`plans`**: Stores subscription tiers with JSON fields for feature specifications (accommodating flexible requirements).
- **`subscriptions`**: The core link between users and plans, tracking current `status` and expiration dates.
- **`subscription_events`**: A comprehensive audit trail of all subscriber actions and lifecycle changes.
- **`business_profiles`**: Powers dynamic routing and tenant identification via unique `slugs`.
- **`page_configs`**: Stores layout configurations for business landing pages.
- **`payments`**: Detailed, immutable logs of every financial transaction.

> [!NOTE]
> **Computed Logic**: A scheduled background job continuously evaluates subscription expiration dates and updates their statuses accordingly, ensuring accurate and timely state management.

---

## API Overview

| Group | Purpose |
| :--- | :--- |
| `/api/auth` | Registration, login, and session management. |
| `/api/plans` | CRUD operations for managing subscription tiers. |
| `/api/subscriptions` | Subscription lifecycle management (Pause, Resume, Cancel). |
| `/api/analytics` | Business intelligence and data visualization endpoints. |
| `/api/user` | User profile management and dashboard data retrieval. |
| `/api/payment` | Payment processing and transaction verification endpoints. |
| `/api/config` | Landing page layout and theme configuration. |

---

## Analytics Implementation

SubDesk delivers high-fidelity metrics by leveraging SQL-side aggregations for enhanced performance and accuracy.

- **MRR Normalization**: Automatically converts and normalizes annual plan pricing to provide an accurate Monthly Recurring Revenue overview.
- **Zero-Filled Series**: Ensures chronological charts display `0` for inactive periods, maintaining data integrity across time series.
- **Churn Tracking**: Real-time calculation and reporting of user cancellation rates.
- **Plan Performance**: Detailed analysis of revenue generation and adoption rates across different subscription tiers.

---

## Security

- **JWT Protection**: Tokens are signed using `HS256` and stored securely in **HTTP-only, SameSite: Strict** cookies.
- **Role-Based Access Control (RBAC)**: Specialized middleware enforces strict access controls, preventing unauthorized access to protected routes.
- **SQL Data Safety**: All database queries utilize **parameterized inputs** via the `mysql2` library, effectively preventing SQL injection vulnerabilities.
- **Payment Integrity**: All Razorpay payloads are rigorously verified using **HMAC SHA256** signatures to ensure authenticity.

---

## Performance

- **Indexed Queries**: Critical database tables are strategically indexed to ensure sub-millisecond response times for frequent queries.
- **Frontend Optimization**: 
  - Utilizes `AbortController` within data-fetching hooks to prevent race conditions.
  - Implements lazy loading for non-critical components to improve initial load times.
- **SQL-First Logic**: Complex data calculations and aggregations are performed at the database level to minimize processing overhead on the application server.
- **Pagination**: Implemented across all list views to ensure stable and efficient data retrieval for large datasets.

---

## Project Structure

```text
dbmsProject_Subtracker/
├── Frontend/           # Client-side application (Next.js)
│   ├── app/           # Application pages and routing layouts
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks for state and API management
│   ├── lib/           # API client and shared utilities
│   └── styles/        # Tailwind CSS configuration and global styles
├── backend/           # Server-side application (Express)
│   ├── src/
│   │   ├── controllers/ # Business logic handlers
│   │   ├── jobs/       # Scheduled background tasks
│   │   ├── middlewares/ # Authentication and authorization layers
│   │   ├── mysqlDB/    # Database schema, connection, and migrations
│   │   ├── routes/     # API route definitions
│   │   └── utils/      # Shared utility functions
└── bot/               # Automated subscriber simulation for testing purposes
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Razorpay Account (Required for payment processing capabilities)

### 2. Backend Setup
```bash
cd backend
npm install
# Configure the .env file with appropriate credentials (see below)
node src/mysqlDB/migrate_razorpay.js  # Initialize the database schema
npm run dev
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev  # Starts the development server on localhost:3000
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following configuration:

```env
PORT=3030
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=subdeskdb
JWT_SECRET=your_secure_jwt_secret
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```


## License

Distributed under the ISC License. Please refer to the `LICENSE` file for additional information.
