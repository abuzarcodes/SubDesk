# SubDesk API Documentation

This document outlines the available REST API endpoints for the SubDesk platform.

## Base URL

## 1. Authentication (\`/api/auth\`)

### \`POST /api/auth/register\`
Registers a new user (either business or customer) and sets an HTTP-only JWT cookie.
- **Access**: Public
- **Request Body**:
  \`\`\`json
  {
    "username": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "business" // or "customer"
  }
  \`\`\`
- **Responses**:
  - \`201 Created\`: Registration successful.
  - \`400 Bad Request\`: Missing fields.
  - \`409 Conflict\`: Email already exists.

### \`POST /api/auth/login\`
Authenticates an existing user and sets an HTTP-only JWT cookie (\`userToken\`).
- **Access**: Public
- **Request Body**:
  \`\`\`json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  \`\`\`
- **Responses**:
  - \`200 OK\`: Login successful. Returns user details.
  - \`400 Bad Request\`: Missing email or password.
  - \`401 Unauthorized\`: Invalid credentials.

### \`GET /api/auth/me\`
Retrieves details of the currently authenticated user.
- **Access**: Private (Requires valid \`userToken\` cookie)
- **Responses**:
  - \`200 OK\`: Returns the decoded user object (id, username, email, role).
  - \`401 Unauthorized\`: Not authenticated.

---

## 2. Plans (\`/api/plans\`)

### \`POST /api/plans\`
Creates a new subscription tier/plan.
- **Access**: Private (Business role only)
- **Request Body**:
  \`\`\`json
  {
    "name": "Pro Tier",
    "price": 29.99,
    "billing_cycle": "monthly" // or "yearly"
  }
  \`\`\`
- **Responses**:
  - \`201 Created\`: Plan successfully created. Returned with generated ID.
  - \`403 Forbidden\`: Not a business user.

### \`GET /api/plans\`
Retrieves all subscription plans created by the authenticated business.
- **Access**: Private (Business role only)
- **Responses**:
  - \`200 OK\`: Returns a list of the business's plans.

### \`GET /api/plans/:businessId\`
Publicly accessible endpoint to view a specific business's available offering/plans.
- **Access**: Public
- **Parameters**: \`businessId\` (Path parameter)
- **Responses**:
  - \`200 OK\`: Returns the business name and an array of their plans.
  - \`404 Not Found\`: Business doesn't exist.

### \`PUT /api/plans/:id\`
Updates the details of an existing plan.
- **Access**: Private (Business owner of the plan)
- **Parameters**: \`id\` (Plan ID)
- **Request Body**:
  \`\`\`json
  {
    "name": "Updated Tier Name",
    "price": 39.99,
    "billing_cycle": "yearly"
  }
  \`\`\`
- **Responses**:
  - \`200 OK\`: Plan updated successfully.
  - \`403 Forbidden\`: Not a business user.
  - \`404 Not Found\`: Plan doesn't exist or doesn't belong to business.

### \`DELETE /api/plans/:id\`
Deletes an existing plan.
- **Access**: Private (Business owner of the plan)
- **Parameters**: \`id\` (Plan ID)
- **Responses**:
  - \`200 OK\`: Plan deleted successfully.
  - \`403 Forbidden\`: Not a business user.
  - \`404 Not Found\`: Plan doesn't exist or doesn't belong to business.

---

## 3. Subscriptions (\`/api/subscriptions\`)

### \`POST /api/subscriptions\`
Subscribes a customer to a specific business plan.
- **Access**: Private (Customer role only)
- **Request Body**:
  \`\`\`json
  {
    "plan_id": 1,
    "business_id": 1
  }
  \`\`\`
- **Responses**:
  - \`201 Created\`: Subscription active.
  - \`403 Forbidden\`: Must be logged in as customer.
  - \`404 Not Found\`: Provided plan doesn't exist.
  - \`409 Conflict\`: Customer already has an active subscription to this exact plan.

### \`GET /api/subscriptions/business\`
Retrieves a list of all customers actively subscribed to the authenticated business's plans.
- **Access**: Private (Business role only)
- **Responses**:
  - \`200 OK\`: Returns a combined object list including subscription status, plan name, plan price, customer name, and customer email.

### \`GET /api/subscriptions/customer\`
Retrieves a list of all plans the authenticated customer is currently subscribed to.
- **Access**: Private (Customer role only)
- **Responses**:
  - \`200 OK\`: Returns a combined overview including subscription status, plan name, price, and the publisher's business name.

---

## 4. Business & Page Configuration (\`/api/business\`)
Endpoints for business owners to manage their public profile and subscription page appearance.

### \`GET /api/business/page-config\`
Retrieves the current draft/saved page configuration and business profile.
- **Access**: Private (Business role only)
- **Responses**:
  - \`200 OK\`: Returns \`{ profile, config, isPublished }\`.
  - \`401 Unauthorized\`: Not authenticated.

### \`PUT /api/business/page-config\`
Updates the draft customization settings for the subscription page.
- **Access**: Private (Business role only)
- **Request Body**:
  \`\`\`json
  {
    "theme": { "colors": { "primary": "#...", ... }, "font": "sans", "radius": "...", "shadow": "..." },
    "layout": { "type": "grid", "columns": 3 },
    "components": { "cardStyle": "glass", "buttonStyle": "pill" }
  }
  \`\`\`
- **Responses**:
  - \`200 OK\`: Config updated.

### \`PUT /api/business/profile\`
Updates the public-facing business profile details.
- **Access**: Private (Business role only)
- **Request Body**:
  \`\`\`json
  {
    "display_name": "Gym Pro",
    "logo_url": "https://...",
    "tagline": "...",
    "support_email": "...",
    "slug": "gym-pro"
  }
  \`\`\`
- **Responses**:
  - \`200 OK\`: Profile updated.

### \`POST /api/business/page-config/publish\`
Deploys the current draft configuration to the live public page.
- **Access**: Private (Business role only)

### \`POST /api/business/page-config/unpublish\`
Takes the public subscription page offline.
- **Access**: Private (Business role only)

---

## 5. Public Access (\`/api/public\`)

### \`GET /api/public/subscribe/:identifier\`
Fetches everything needed to render a business's subscription page.
- **Access**: Public
- **Parameters**: 
  - \`identifier\`: Can be the **Business ID** (integer) or the **Custom Slug** (string).
- **Responses**:
  - \`200 OK\`: Returns business details, active plans, and current published configuration.
  - \`404 Not Found\`: Business doesn't exist or page is unpublished.
