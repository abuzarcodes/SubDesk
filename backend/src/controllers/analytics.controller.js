import { DB } from "../mysqlDB/database.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validates and returns the number of days for a given range string.
 * Whitelists allowed ranges: 7d, 30d, 90d. Defaults to 30.
 */
function parseRange(range) {
  const allowed = ["7d", "30d", "90d"];
  const val = allowed.includes(range) ? range : "30d";
  const ranges = { "7d": 7, "30d": 30, "90d": 90 };
  return ranges[val];
}

/**
 * Returns a SQL fragment for filtering by date range.
 * Uses CURDATE() (server local time) for DATE columns and NOW() for TIMESTAMP columns
 * to stay consistent with the session timezone that DATE() uses for grouping.
 */
function getDateFilter(column, days) {
  return `${column} >= CURDATE() - INTERVAL ${Number(days)} DAY`;
}

/**
 * Generates an array of date strings (YYYY-MM-DD) for the last N days.
 * Uses LOCAL time (not UTC) to match MySQL's DATE() output in the session timezone.
 */
function generateDateSeries(days) {
  const dates = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

/**
 * Safely extracts a YYYY-MM-DD string from a SQL DATE result.
 * Handles both Date objects and string values.
 */
function toDateString(val) {
  if (!val) return null;
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, "0");
    const day = String(val.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(val).split("T")[0];
}

/**
 * Final rounding and numeric safety for aggregates.
 */
function toNum(val, decimals = 2) {
  return Number(Number(val || 0).toFixed(decimals));
}

// Strict validation for "Active" Monthly Recurring Revenue (MRR)
// Assumes subscriptions table is aliased as 's'
const MRR_VALIDATION = `s.status = 'active' 
  AND s.start_date <= CURDATE() 
  AND (s.expires_at IS NULL OR s.expires_at > NOW()) 
  AND s.is_deleted = FALSE`;

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/analytics/summary
 * Returns: customers, active subscriptions, MRR, churn rate
 */
export async function getAnalyticsSummary(req, res) {
  try {
    const businessId = req.user.id;
    const days = 30; // Churn window default

    // 1. Total Customers
    const [customerRows] = await DB.execute(
      "SELECT COUNT(DISTINCT customer_id) as total FROM subscriptions WHERE business_id = ? AND is_deleted = FALSE",
      [businessId]
    );

    // 2. Active Subscriptions (Strict Validation)
    const [activeRows] = await DB.execute(
      `SELECT COUNT(*) as active FROM subscriptions s WHERE s.business_id = ? AND ${MRR_VALIDATION}`,
      [businessId]
    );

    // 3. MRR (Normalized + Strict Validation)
    const [mrrRows] = await DB.execute(
      `SELECT SUM(
        CASE WHEN p.billing_cycle = 'yearly' THEN p.price / 12 ELSE p.price END
      ) as mrr
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.business_id = ? AND ${MRR_VALIDATION}`,
      [businessId]
    );

    // 4. Range-Based Churn Rate (last 30 days)
    const [churnRows] = await DB.execute(
      `SELECT 
        COUNT(CASE WHEN s.status = 'cancelled' AND ${getDateFilter('s.cancelled_at', days)} THEN 1 END) as cancelled,
        COUNT(CASE WHEN ${MRR_VALIDATION} THEN 1 END) as active
      FROM subscriptions s
      WHERE s.business_id = ?`,
      [businessId]
    );

    const activeCount = churnRows[0].active || 1;
    const churnRate = toNum(churnRows[0].cancelled / activeCount, 4);

    return res.status(200).json({
      success: true,
      data: {
        totalCustomers: customerRows[0].total || 0,
        activeSubscriptions: activeRows[0].active || 0,
        mrr: toNum(mrrRows[0].mrr),
        churnRate: churnRate,
      },
    });
  } catch (error) {
    console.error("getAnalyticsSummary error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/analytics/revenue?range=30d
 * Returns time-series of NEW MRR added per day.
 * Uses start_date (DATE column) for grouping to avoid timezone issues.
 */
export async function getRevenueTimeSeries(req, res) {
  try {
    const businessId = req.user.id;
    const days = parseRange(req.query.range);
    const dateSeries = generateDateSeries(days);

    const [rows] = await DB.execute(
      `SELECT 
        s.start_date as date,
        SUM(CASE WHEN p.billing_cycle = 'yearly' THEN p.price / 12 ELSE p.price END) as value
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.business_id = ? 
        AND ${getDateFilter('s.start_date', days)}
        AND s.is_deleted = FALSE
      GROUP BY s.start_date
      ORDER BY s.start_date ASC`,
      [businessId]
    );

    const dataMap = new Map(rows.map((r) => [toDateString(r.date), toNum(r.value)]));
    const result = dateSeries.map((date) => ({
      date,
      value: dataMap.get(date) || 0,
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("getRevenueTimeSeries error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/analytics/customers?range=30d
 * Returns time-series of new subscription growth (distinct customers).
 * Uses start_date (DATE column) for grouping to avoid timezone issues.
 */
export async function getCustomerGrowth(req, res) {
  try {
    const businessId = req.user.id;
    const days = parseRange(req.query.range);
    const dateSeries = generateDateSeries(days);

    const [rows] = await DB.execute(
      `SELECT 
        s.start_date as date,
        COUNT(DISTINCT s.customer_id) as value
      FROM subscriptions s
      WHERE s.business_id = ? 
        AND ${getDateFilter('s.start_date', days)}
        AND s.is_deleted = FALSE
      GROUP BY s.start_date
      ORDER BY s.start_date ASC`,
      [businessId]
    );

    const dataMap = new Map(rows.map((r) => [toDateString(r.date), r.value]));
    const result = dateSeries.map((date) => ({
      date,
      value: dataMap.get(date) || 0,
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("getCustomerGrowth error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/analytics/plans
 * Returns performance metrics broken down by plan.
 */
export async function getPlanPerformance(req, res) {
  try {
    const businessId = req.user.id;

    const [rows] = await DB.execute(
      `SELECT 
        p.id as planId,
        p.name,
        COUNT(CASE WHEN ${MRR_VALIDATION} THEN 1 END) as subscribers,
        SUM(CASE WHEN ${MRR_VALIDATION} THEN (CASE WHEN p.billing_cycle = 'yearly' THEN p.price / 12 ELSE p.price END) ELSE 0 END) as revenue,
        COUNT(CASE WHEN s.status = 'cancelled' AND s.is_deleted = FALSE THEN 1 END) as cancellations,
        COUNT(s.id) as total_lifetime
      FROM plans p
      LEFT JOIN subscriptions s ON p.id = s.plan_id AND s.is_deleted = FALSE
      WHERE p.business_id = ?
      GROUP BY p.id, p.name
      ORDER BY revenue DESC, subscribers DESC`,
      [businessId]
    );

    const result = rows.map((row) => ({
      planId: row.planId,
      name: row.name,
      subscribers: row.subscribers,
      revenue: toNum(row.revenue),
      churnRate: toNum(row.cancellations / (row.total_lifetime || 1), 4),
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("getPlanPerformance error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/analytics/churn?range=30d
 * Returns time-series of cancellation events.
 */
export async function getChurnAnalytics(req, res) {
  try {
    const businessId = req.user.id;
    const days = parseRange(req.query.range);
    const dateSeries = generateDateSeries(days);

    const [rows] = await DB.execute(
      `SELECT 
        DATE(s.cancelled_at) as date,
        COUNT(DISTINCT s.id) as value
      FROM subscriptions s
      WHERE s.business_id = ? 
        AND s.status = 'cancelled'
        AND ${getDateFilter('s.cancelled_at', days)}
        AND s.is_deleted = FALSE
      GROUP BY DATE(s.cancelled_at)
      ORDER BY DATE(s.cancelled_at) ASC`,
      [businessId]
    );

    const dataMap = new Map(rows.map((r) => [toDateString(r.date), r.value]));
    const result = dateSeries.map((date) => ({
      date,
      value: dataMap.get(date) || 0,
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("getChurnAnalytics error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
