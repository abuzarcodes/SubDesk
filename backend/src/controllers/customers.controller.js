import { DB } from "../mysqlDB/database.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Escape a value for safe CSV output.
 * Wraps values that contain commas, quotes, or newlines in double-quotes
 * and doubles any embedded quote characters.
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Build a parameterized WHERE clause from dynamic query-string filters.
 * NEVER concatenates raw user input into the SQL string.
 */
function buildCustomerFilters({ businessId, status, plan_id, search }) {
  const conditions = ["s.business_id = ?", "s.is_deleted = FALSE"];
  const params = [businessId];

  if (status) {
    conditions.push("s.status = ?");
    params.push(status);
  }
  if (plan_id) {
    conditions.push("s.plan_id = ?");
    params.push(Number(plan_id));
  }
  if (search) {
    conditions.push("(u.username LIKE ? OR u.email LIKE ?)");
    const pattern = `%${search}%`;
    params.push(pattern, pattern);
  }

  return { whereClause: conditions.join(" AND "), params };
}

// Shared SQL fragments (constants — never user-derived)
const SELECT_FIELDS = `
  s.id          AS subscription_id,
  s.status,
  s.start_date,
  s.started_at,
  s.paused_at,
  s.resumed_at,
  s.cancelled_at,
  s.expires_at,
  u.id          AS customer_id,
  u.username,
  u.email,
  p.id          AS plan_id,
  p.name        AS plan_name,
  p.price,
  p.billing_cycle`;

const FROM_JOINS = `
  FROM subscriptions s
  JOIN users u ON s.customer_id = u.id
  JOIN plans p ON s.plan_id   = p.id`;

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/customers
 * List customers with optional filters (?status, ?plan_id, ?search)
 * and pagination (?page, ?limit).
 */
async function getCustomers(req, res) {
  try {
    const { status, plan_id, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const { whereClause, params } = buildCustomerFilters({
      businessId: req.user.id,
      status,
      plan_id,
      search,
    });

    // Total matching rows (for pagination metadata)
    const [countRows] = await DB.execute(
      `SELECT COUNT(*) AS total ${FROM_JOINS} WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Paginated data — LIMIT/OFFSET embedded as validated integers
    const [customers] = await DB.execute(
      `SELECT ${SELECT_FIELDS} ${FROM_JOINS}
       WHERE ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params
    );

    return res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getCustomers error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/customers/:id
 * Return customer + subscription + plan + event history.
 * Validates ownership (business_id must match the requesting user).
 */
async function getCustomerDetails(req, res) {
  try {
    const subscriptionId = parseInt(req.params.id, 10);
    if (isNaN(subscriptionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription ID" });
    }

    // Ownership check baked into the WHERE clause
    const [rows] = await DB.execute(
      `SELECT ${SELECT_FIELDS} ${FROM_JOINS}
       WHERE s.id = ? AND s.business_id = ? AND s.is_deleted = FALSE`,
      [subscriptionId, req.user.id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    const row = rows[0];

    // Event history
    const [events] = await DB.execute(
      `SELECT id, event_type, metadata, created_at
       FROM subscription_events
       WHERE subscription_id = ?
       ORDER BY created_at DESC`,
      [subscriptionId]
    );

    return res.status(200).json({
      success: true,
      data: {
        customer: {
          id: row.customer_id,
          username: row.username,
          email: row.email,
        },
        subscription: {
          id: row.subscription_id,
          status: row.status,
          start_date: row.start_date,
          started_at: row.started_at,
          paused_at: row.paused_at,
          resumed_at: row.resumed_at,
          cancelled_at: row.cancelled_at,
          expires_at: row.expires_at,
        },
        plan: {
          id: row.plan_id,
          name: row.plan_name,
          price: row.price,
          billing_cycle: row.billing_cycle,
        },
        events,
      },
    });
  } catch (error) {
    console.error("getCustomerDetails error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * DELETE /api/customers/:id
 * Soft-delete — sets is_deleted = TRUE. Never removes rows.
 * Validates ownership before updating.
 */
async function removeCustomer(req, res) {
  try {
    const subscriptionId = parseInt(req.params.id, 10);
    if (isNaN(subscriptionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription ID" });
    }

    // Ownership + not-already-deleted guard in one query
    const [result] = await DB.execute(
      `UPDATE subscriptions
       SET is_deleted = TRUE
       WHERE id = ? AND business_id = ? AND is_deleted = FALSE`,
      [subscriptionId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found or already removed",
      });
    }

    return res.status(200).json({
      success: true,
      data: { message: "Customer removed successfully" },
    });
  } catch (error) {
    console.error("removeCustomer error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/customers/export
 * Stream a CSV download with the same filter support as GET /customers.
 * Returns header-only CSV for empty datasets.
 * Values are properly escaped to prevent CSV injection.
 */
async function exportCustomers(req, res) {
  try {
    const { status, plan_id, search } = req.query;

    const { whereClause, params } = buildCustomerFilters({
      businessId: req.user.id,
      status,
      plan_id,
      search,
    });

    const [customers] = await DB.execute(
      `SELECT ${SELECT_FIELDS} ${FROM_JOINS}
       WHERE ${whereClause}
       ORDER BY s.created_at DESC`,
      params
    );

    // CSV response headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="customers.csv"'
    );

    // Header row (always sent, even for empty datasets)
    const headers = [
      "Name",
      "Email",
      "Plan",
      "Status",
      "Price",
      "Billing Cycle",
      "Start Date",
    ];
    res.write(headers.join(",") + "\n");

    // Stream each row
    for (const row of customers) {
      const line = [
        escapeCsvValue(row.username),
        escapeCsvValue(row.email),
        escapeCsvValue(row.plan_name),
        escapeCsvValue(row.status),
        escapeCsvValue(row.price),
        escapeCsvValue(row.billing_cycle),
        escapeCsvValue(row.start_date),
      ].join(",");
      res.write(line + "\n");
    }

    return res.end();
  } catch (error) {
    console.error("exportCustomers error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
    return res.end();
  }
}

export { getCustomers, getCustomerDetails, removeCustomer, exportCustomers };
