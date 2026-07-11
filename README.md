# SubDesk
### Managing SaaS subscriptions, because tracking things in Excel is a cry for help.

![SubDesk Hero Banner](file:///C:/Users/ABUZAR/Documents/dbmsProject_Subtracker/Frontend/public/hero.png)

---

## Introduction
SubDesk is a production-grade SaaS platform built for people who actually want to scale their businesses instead of wrestling with billing logic. We handle the complex stuff—dynamic landing pages, Razorpay integrations, and scary-looking analytics—so you can focus on whatever it is you actually do. 

Built with a focus on actual security and performance, SubDesk manages the entire bridge between you offering value and customers (hopefully) paying for it.

---

## Key Features

### For Businesses
- **Dynamic Landing Pages**: Generated instantly, because you have better things to do than hand-coding CSS.
- **Advanced Dashboard**: A place to stare at numbers like MRR and churn while pretending to know exactly what they mean.
- **Plan Management**: Create, edit, and archive subscription tiers faster than you can change your mind about pricing.
- **Customer Insights**: Detailed tracking of subscriber behavior. See what they're up to (in a professional way, of course).
- **Theme Customization**: Real-time preview and publishing, so your brand doesn't look like a generic template.

### For Customers
- **Unified Portal**: One place for all their subscriptions, so they don't have to hunt through their email.
- **Secure Payments**: Razorpay-powered checkout that actually works on the first try.
- **Subscription Control**: Easy options to pause, resume, or cancel. It hurts to see them go, but at least it's automated.
- **Billing History**: Transparent access to transaction logs and invoices for the organized few.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (React 19), Tailwind CSS, Radix UI |
| **Backend** | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/) |
| **Database** | [MySQL](https://www.mysql.com/) (The reliable choice) |
| **Payments** | [Razorpay](https://razorpay.com/) (Getting you paid) |
| **State Management** | React Context API & Custom Hooks |
| **Automation** | `node-cron` & Selenium (The bots that do the work) |

---

## Architecture
Follows a decoupled architecture, because spaghetti is for dinner, not for your codebase.

### Backend (Express API)
**Flow**: `Routes` ➔ `Middlewares` (Auth/Role) ➔ `Controllers` ➔ `DB (MySQL)`
- **Separation of Concerns**: Business logic is isolated within controllers, right where it belongs.
- **Stateless Auth**: JWT-based authentication with roles stored in HTTP-only cookies. No XSS on our watch.

### Frontend (Next.js App Router)
**Flow**: `apiClient` ➔ `Custom Hooks` ➔ `Stateful Components`
- **Centralized API**: All requests route through a unified `apiClient` for consistent error handling and type safety.
- **Modular Components**: Design system built on Tailwind primitives for visual consistency without the headache.

---

## Core Workflows

### Subscription Lifecycle
1. **Creation**: User picks a plan, we create an `inactive` record. It's a start.
2. **Payment Intent**: A Razorpay Order is generated. The "give us money" step.
3. **Verification**: Frontend sends signature details. We double-check everything.
4. **Activation**: The backend verifies the HMAC signature. The **Razorpay Webhook** is our source of truth, updating the status to `active` and recording the event.

---

## Database Overview

SubDesk uses a relational MySQL schema optimized for auditing and chronological tracking.

- **`users`**: The central registry for everyone involved.
- **`plans`**: Stores tiers with JSON fields for features (because requirements always change).
- **`subscriptions`**: The core link, tracking `status` and expiration dates.
- **`subscription_events`**: An audit trail of every move a subscriber makes.
- **`business_profiles`**: Powers dynamic routing via unique `slugs`.
- **`page_configs`**: Stores your layout choices.
- **`payments`**: Detailed logs of every transaction.

> [!NOTE]
> **Computed Logic**: A background job regularly checks if subscriptions have expired and updates their status accordingly. It never sleeps.

---

## API Overview

| Group | Purpose |
| :--- | :--- |
| `/api/auth` | Registration, login, and session management. |
| `/api/plans` | CRUD operations for business owners. |
| `/api/subscriptions` | The lifecycle (Pause, Resume, Cancel). |
| `/api/analytics` | Business intelligence for those who like charts. |
| `/api/user` | Profile management and dashboard data. |
| `/api/payment` | The "Show me the money" endpoints. |
| `/api/config` | Landing page settings. |

---

## Analytics Implementation
High-fidelity metrics using SQL-side aggregations, because doing math in Javascript is a bad idea.

- **MRR Normalization**: Automatically converts Yearly plan prices to a Monthly Recurring Revenue view.
- **Zero-Filled Series**: Ensures charts show `0` for quiet days instead of just skipping them.
- **Churn Tracking**: Real-time calculation of cancellation rates.
- **Plan Performance**: See which tiers are actually making money and which are just taking up space.

---

## Security
- **JWT Protection**: Tokens signed with `HS256` and hidden in **HTTP-only, SameSite: Strict** cookies.
- **Role-Based Access Control (RBAC)**: Specialized middlewares protect routes from people who shouldn't be there.
- **SQL Data Safety**: All queries use **parameterized inputs** via `mysql2`. No SQL injection today.
- **Payment Integrity**: Razorpay payloads are verified using **HMAC SHA256** signatures.

---

## Performance
- **Indexed Queries**: Critical tables are indexed for sub-millisecond response times. Waiting is for people with slower apps.
- **Frontend Optimization**: 
  - Uses `AbortController` in hooks to prevent race conditions.
  - Lazy loading for components that don't need to be there right away.
- **SQL-First Logic**: Heavy calculations happen in the database where they belong.
- **Pagination**: Because loading 10,000 records at once is an accident waiting to happen.

---

## Project Structure

```text
dbmsProject_Subtracker/
├── Frontend/           # The part people actually see
│   ├── app/           # Pages & Layouts
│   ├── components/    # Atomic pieces of UI
│   ├── hooks/         # Logic you can use more than once
│   ├── lib/           # API Client & Utils
│   └── styles/        # Tailwind configuration
├── backend/           # The engine room
│   ├── src/
│   │   ├── controllers/ # Where the magic happens
│   │   ├── jobs/       # Background tasks
│   │   ├── middlewares/ # The gatekeepers
│   │   ├── mysqlDB/    # Schema & Migrations
│   │   ├── routes/     # The entry points
│   │   └── utils/      # Little helpers
└── bot/               # Subscriber simulation (For when you have no real users yet)
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- Razorpay Account (If you want to actually get paid)

### 2. Backend Setup
```bash
cd backend
npm install
# Fix your .env file (see below)
node src/mysqlDB/migrate_razorpay.js  # Build the database
npm run dev
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev  # Starts on localhost:3000
```

---

## Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=3030
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=subdeskdb
JWT_SECRET=something_unhackable
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

---

## Screenshots
> [!TIP]
> This is where you'd put images of the app to prove it actually works.

- **[Business Dashboard]**: Numbers going up (hopefully).
- **[Analytics Page]**: Serious-looking charts for serious people.
- **[Subscription Page]**: A landing page that doesn't look like it was built in 1999.
- **[Customer Portal]**: Where people go to manage their lives.

---

## Future Roadmap
- [ ] **Razorpay Route**: Automated commission splits.
- [ ] **Multi-Currency**: For when your business goes global.
- [ ] **Coupon System**: Giving things away for free, but strategically.
- [ ] **Real-time Notifications**: Emails for when things happen.
- [ ] **Advanced Admin Panel**: For the person in charge.

---

## License
Distributed under the MIT License. Use it, just don't blame us for anything.
