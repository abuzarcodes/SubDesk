# SubTrckr API Documentation

This document outlines the available REST API endpoints for the SubTrckr platform.

## Base URL
\`http://localhost:3030/api\`

---

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
