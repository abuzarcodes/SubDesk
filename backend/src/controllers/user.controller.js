import { DB } from "../mysqlDB/database.js";
import { calculateExpiry } from "../utils/expiry.util.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Lazy-update helper: marks subscriptions as expired in DB when expires_at < NOW().
 * Scoped to a single customer for safety.
 */
async function syncExpiredSubscriptions(customerId) {
  try {
    const [result] = await DB.execute(
      `UPDATE subscriptions
       SET status = 'expired'
       WHERE customer_id = ?
         AND status NOT IN ('expired', 'cancelled')
         AND expires_at IS NOT NULL
         AND expires_at < NOW()`,
      [customerId]
    );
    if (result.affectedRows > 0) {
      console.log(`Lazy-sync (User): Marked ${result.affectedRows} subscriptions as expired for customer ${customerId}.`);
    }
  } catch (error) {
    console.error("syncExpiredSubscriptions error:", error.message);
  }
}

/**
 * Centralized state-transition validator.
 * Returns null when the transition is valid, or an error message string.
 * Reuses the EXACT same logic from subscriptions.controller.js.
 */
function validateTransition(currentStatus, action) {
  const allowed = {
    active:    ["pause", "cancel"],
    paused:    ["resume", "cancel"],
    cancelled: [],
    expired:   [],
    inactive:  [],
  };

  const transitions = allowed[currentStatus];

  if (!transitions || transitions.length === 0) {
    if (action === "pause" && currentStatus === "paused") {
      return "Subscription is already paused";
    }
    if (action === "cancel" && currentStatus === "cancelled") {
      return "Subscription is already cancelled";
    }
    return `Cannot perform actions on a subscription with status '${currentStatus}'`;
  }

  if (!transitions.includes(action)) {
    return `Cannot '${action}' a subscription that is currently '${currentStatus}'`;
  }

  return null; // valid
}

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
 * Generates an array of date strings (YYYY-MM-DD) for the last N days.
 * Uses LOCAL time to match MySQL's DATE() output.
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

// ── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/user/dashboard-summary
 * Returns stats + preview lists for the customer dashboard.
 */
export async function getDashboardSummary(req, res) {
  try {
    const customerId = req.user.id;

    // Sync expired subscriptions first
    await syncExpiredSubscriptions(customerId);

    // ── 1. Stats ──────────────────────────────────────────────────────────

    // Active subscriptions count
    const [activeRows] = await DB.execute(
      `SELECT COUNT(*) AS count
       FROM subscriptions
       WHERE customer_id = ? AND status = 'active' AND is_deleted = FALSE`,
      [customerId]
    );

    // Monthly spend (normalize yearly to monthly)
    const [spendRows] = await DB.execute(
      `SELECT SUM(
         CASE
           WHEN p.billing_cycle = 'monthly' THEN p.price
           WHEN p.billing_cycle = 'yearly'  THEN p.price / 12
           ELSE 0
         END
       ) AS total
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.customer_id = ? AND s.status = 'active' AND s.is_deleted = FALSE`,
      [customerId]
    );

    // Upcoming payments (active subs with future expiry)
    const [upcomingCountRows] = await DB.execute(
      `SELECT COUNT(*) AS count
       FROM subscriptions
       WHERE customer_id = ? AND status = 'active' AND expires_at >= NOW() AND is_deleted = FALSE`,
      [customerId]
    );

    const stats = {
      activeSubscriptions: activeRows[0].count || 0,
      monthlySpend: toNum(spendRows[0].total),
      upcomingPayments: upcomingCountRows[0].count || 0,
    };

    // ── 2. Subscriptions Preview (LIMIT 5) ────────────────────────────────

    const [subscriptionsPreview] = await DB.execute(
      `SELECT
         s.id,
         p.name       AS plan_name,
         bp.display_name AS business_name,
         p.price,
         CASE
           WHEN s.expires_at IS NOT NULL AND s.expires_at < NOW() THEN 'expired'
           ELSE s.status
         END AS status,
         s.expires_at
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN business_profiles bp ON p.business_id = bp.business_id
       WHERE s.customer_id = ? AND s.is_deleted = FALSE
       ORDER BY s.created_at DESC
       LIMIT 5`,
      [customerId]
    );

    // ── 3. Upcoming Payments (LIMIT 5) ────────────────────────────────────

    const [upcomingPayments] = await DB.execute(
      `SELECT
         s.id,
         p.name,
         p.price,
         s.expires_at
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.customer_id = ? AND s.status = 'active' AND s.is_deleted = FALSE
       ORDER BY s.expires_at ASC
       LIMIT 5`,
      [customerId]
    );

    // ── 4. Recent Activity (LIMIT 5) ──────────────────────────────────────

    const [recentActivity] = await DB.execute(
      `SELECT
         se.event_type,
         se.created_at,
         p.name AS plan_name
       FROM subscription_events se
       JOIN subscriptions s ON se.subscription_id = s.id
       JOIN plans p ON s.plan_id = p.id
       WHERE s.customer_id = ? AND s.is_deleted = FALSE
       ORDER BY se.created_at DESC
       LIMIT 5`,
      [customerId]
    );

    return res.status(200).json({
      success: true,
      data: {
        stats,
        subscriptionsPreview,
        upcomingPayments,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("getDashboardSummary error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/user/subscriptions
 * Paginated list with ?status, ?search, ?page, ?limit filters.
 */
export async function getSubscriptions(req, res) {
  try {
    const customerId = req.user.id;

    // Sync expired subscriptions first
    await syncExpiredSubscriptions(customerId);

    const { status, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    // Build dynamic WHERE
    const conditions = ["s.customer_id = ?", "s.is_deleted = FALSE"];
    const params = [customerId];

    if (status) {
      conditions.push("s.status = ?");
      params.push(status);
    }
    if (search) {
      conditions.push("(p.name LIKE ? OR bp.display_name LIKE ?)");
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    const whereClause = conditions.join(" AND ");

    // Total count
    const [countRows] = await DB.execute(
      `SELECT COUNT(*) AS total
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN business_profiles bp ON p.business_id = bp.business_id
       WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Paginated data
    const [subscriptions] = await DB.execute(
      `SELECT
         s.id,
         p.name       AS plan_name,
         bp.display_name AS business_name,
         p.price,
         p.billing_cycle,
         CASE
           WHEN s.expires_at IS NOT NULL AND s.expires_at < NOW() THEN 'expired'
           ELSE s.status
         END AS status,
         s.expires_at,
         s.created_at
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN business_profiles bp ON p.business_id = bp.business_id
       WHERE ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      params
    );

    return res.status(200).json({
      success: true,
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getSubscriptions error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/user/subscriptions/:id
 * Returns single subscription + plan + business + full event timeline.
 */
export async function getSubscriptionDetails(req, res) {
  try {
    const customerId = req.user.id;
    const subscriptionId = parseInt(req.params.id, 10);

    if (isNaN(subscriptionId)) {
      return res.status(400).json({ success: false, message: "Invalid subscription ID" });
    }

    const [rows] = await DB.execute(
      `SELECT
         s.id,
         s.status,
         s.start_date,
         s.started_at,
         s.paused_at,
         s.resumed_at,
         s.cancelled_at,
         s.expires_at,
         s.created_at,
         CASE
           WHEN s.expires_at IS NOT NULL AND s.expires_at < NOW() THEN 'expired'
           ELSE s.status
         END AS computed_status,
         p.id          AS plan_id,
         p.name        AS plan_name,
         p.price,
         p.billing_cycle,
         p.description AS plan_description,
         bp.display_name AS business_name,
         bp.logo_url,
         bp.support_email
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN business_profiles bp ON p.business_id = bp.business_id
       WHERE s.id = ? AND s.customer_id = ? AND s.is_deleted = FALSE`,
      [subscriptionId, customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
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
        subscription: {
          id: row.id,
          status: row.computed_status,
          start_date: row.start_date,
          started_at: row.started_at,
          paused_at: row.paused_at,
          resumed_at: row.resumed_at,
          cancelled_at: row.cancelled_at,
          expires_at: row.expires_at,
          created_at: row.created_at,
        },
        plan: {
          id: row.plan_id,
          name: row.plan_name,
          price: row.price,
          billing_cycle: row.billing_cycle,
          description: row.plan_description,
        },
        business: {
          name: row.business_name,
          logo_url: row.logo_url,
          support_email: row.support_email,
        },
        events,
      },
    });
  } catch (error) {
    console.error("getSubscriptionDetails error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * PATCH /api/user/subscriptions/:id/status
 * Body: { "action": "pause" | "resume" | "cancel" }
 *
 * Validates customer ownership, enforces state-transition rules,
 * uses transaction for atomic update + event insert.
 */
export async function updateSubscriptionStatus(req, res) {
  try {
    const customerId = req.user.id;
    const subscriptionId = parseInt(req.params.id, 10);

    if (isNaN(subscriptionId)) {
      return res.status(400).json({ success: false, message: "Invalid subscription ID" });
    }

    const { action } = req.body;
    if (!action || !["pause", "resume", "cancel"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'pause', 'resume', or 'cancel'",
      });
    }

    // Fetch with ownership validation + plan details for expiry calculation
    const [rows] = await DB.execute(
      `SELECT s.id, s.status, p.billing_cycle
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id = ? AND s.customer_id = ? AND s.is_deleted = FALSE`,
      [subscriptionId, customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    const subscription = rows[0];

    // Enforce state-transition rules
    const error = validateTransition(subscription.status, action);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // Determine SQL update + event type
    let updateQuery;
    let eventType;
    let updateParams = [subscriptionId];

    switch (action) {
      case "pause":
        updateQuery = `UPDATE subscriptions SET status = 'paused', paused_at = NOW() WHERE id = ?`;
        eventType = "paused";
        break;
      case "resume": {
        const expiresAt = calculateExpiry(subscription.billing_cycle);
        updateQuery = `UPDATE subscriptions SET status = 'active', resumed_at = NOW(), expires_at = ?, paused_at = NULL WHERE id = ?`;
        updateParams = [expiresAt, subscriptionId];
        eventType = "resumed";
        break;
      }
      case "cancel":
        updateQuery = `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?`;
        eventType = "cancelled";
        break;
    }

    // Atomic: both update and event must succeed or both fail
    await DB.beginTransaction();
    try {
      await DB.execute(updateQuery, updateParams);
      await DB.execute(
        `INSERT INTO subscription_events (subscription_id, event_type) VALUES (?, ?)`,
        [subscriptionId, eventType]
      );
      await DB.commit();
    } catch (txError) {
      await DB.rollback();
      throw txError;
    }

    const newStatus = action === "resume" ? "active" : action === "cancel" ? "cancelled" : "paused";

    return res.status(200).json({
      success: true,
      data: {
        message: `Subscription ${action}d successfully`,
        subscription_id: subscriptionId,
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("updateSubscriptionStatus (user) error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * POST /api/user/subscriptions/bulk-action
 * Body: { "ids": [1,2,3], "action": "pause" | "cancel" }
 *
 * Processes each subscription individually within a transaction.
 * Skips invalid/unauthorized IDs without crashing the entire request.
 */
export async function bulkAction(req, res) {
  try {
    const customerId = req.user.id;
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids must be a non-empty array" });
    }
    if (!action || !["pause", "cancel"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'pause' or 'cancel'",
      });
    }

    // Sanitize IDs
    const validIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid IDs provided" });
    }

    // Fetch all owned subscriptions in one query
    const placeholders = validIds.map(() => "?").join(", ");
    const [subscriptions] = await DB.execute(
      `SELECT s.id, s.status, p.billing_cycle
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id IN (${placeholders}) AND s.customer_id = ? AND s.is_deleted = FALSE`,
      [...validIds, customerId]
    );

    const results = { updated: [], skipped: [], errors: [] };

    await DB.beginTransaction();
    try {
      for (const sub of subscriptions) {
        const transitionError = validateTransition(sub.status, action);
        if (transitionError) {
          results.skipped.push({ id: sub.id, reason: transitionError });
          continue;
        }

        let updateQuery;
        let eventType;
        let updateParams = [sub.id];

        if (action === "pause") {
          updateQuery = `UPDATE subscriptions SET status = 'paused', paused_at = NOW() WHERE id = ?`;
          eventType = "paused";
        } else {
          updateQuery = `UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?`;
          eventType = "cancelled";
        }

        await DB.execute(updateQuery, updateParams);
        await DB.execute(
          `INSERT INTO subscription_events (subscription_id, event_type) VALUES (?, ?)`,
          [sub.id, eventType]
        );
        results.updated.push(sub.id);
      }

      // IDs that weren't found (not owned or deleted)
      const foundIds = subscriptions.map((s) => s.id);
      for (const id of validIds) {
        if (!foundIds.includes(id) && !results.skipped.find((s) => s.id === id)) {
          results.skipped.push({ id, reason: "Not found or not owned" });
        }
      }

      await DB.commit();
    } catch (txError) {
      await DB.rollback();
      throw txError;
    }

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("bulkAction (user) error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/user/activity
 * Extended activity feed with ?limit query param (default 20, max 100).
 */
export async function getActivity(req, res) {
  try {
    const customerId = req.user.id;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const [activities] = await DB.execute(
      `SELECT
         se.event_type,
         se.created_at,
         p.name AS plan_name,
         bp.display_name AS business_name
       FROM subscription_events se
       JOIN subscriptions s ON se.subscription_id = s.id
       JOIN plans p ON s.plan_id = p.id
       JOIN business_profiles bp ON p.business_id = bp.business_id
       WHERE s.customer_id = ? AND s.is_deleted = FALSE
       ORDER BY se.created_at DESC
       LIMIT ${Number(limit)}`,
      [customerId]
    );

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("getActivity error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/user/billing-summary
 * Returns totalSpent, thisMonth spend, and failedPayments count.
 */
export async function getBillingSummary(req, res) {
  try {
    const customerId = req.user.id;

    // Get all subscription IDs owned by this customer
    const [subRows] = await DB.execute(
      `SELECT id FROM subscriptions WHERE customer_id = ? AND is_deleted = FALSE`,
      [customerId]
    );

    if (subRows.length === 0) {
      return res.status(200).json({
        success: true,
        data: { totalSpent: 0, thisMonth: 0, failedPayments: 0 },
      });
    }

    const subIds = subRows.map((r) => r.id);
    const placeholders = subIds.map(() => "?").join(", ");

    // Total spent (captured payments only)
    const [totalRows] = await DB.execute(
      `SELECT SUM(amount) AS total
       FROM payments
       WHERE subscription_id IN (${placeholders}) AND status = 'captured'`,
      subIds
    );

    // This month
    const [monthRows] = await DB.execute(
      `SELECT SUM(amount) AS total
       FROM payments
       WHERE subscription_id IN (${placeholders})
         AND status = 'captured'
         AND MONTH(created_at) = MONTH(CURDATE())
         AND YEAR(created_at) = YEAR(CURDATE())`,
      subIds
    );

    // Failed payments
    const [failedRows] = await DB.execute(
      `SELECT COUNT(*) AS count
       FROM payments
       WHERE subscription_id IN (${placeholders}) AND status = 'failed'`,
      subIds
    );

    return res.status(200).json({
      success: true,
      data: {
        totalSpent: toNum(totalRows[0].total),
        thisMonth: toNum(monthRows[0].total),
        failedPayments: failedRows[0].count || 0,
      },
    });
  } catch (error) {
    console.error("getBillingSummary error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/user/transactions
 * Paginated payments list joined with subscriptions + plans.
 */
export async function getTransactions(req, res) {
  try {
    const customerId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    // Count
    const [countRows] = await DB.execute(
      `SELECT COUNT(*) AS total
       FROM payments pay
       JOIN subscriptions s ON pay.subscription_id = s.id
       WHERE s.customer_id = ? AND s.is_deleted = FALSE`,
      [customerId]
    );
    const total = countRows[0].total;

    // Paginated data
    const [transactions] = await DB.execute(
      `SELECT
         pay.id,
         pay.amount,
         pay.currency,
         pay.status,
         pay.payment_method,
         pay.created_at,
         p.name AS plan_name,
         bp.display_name AS business_name
       FROM payments pay
       JOIN subscriptions s ON pay.subscription_id = s.id
       JOIN plans p ON s.plan_id = p.id
       JOIN business_profiles bp ON p.business_id = bp.business_id
       WHERE s.customer_id = ? AND s.is_deleted = FALSE
       ORDER BY pay.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
      [customerId]
    );

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getTransactions error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/user/analytics?range=7d|30d|90d
 * Returns spendTrend, subscriptionGrowth, cancellations time-series.
 * Zero-fills missing days for complete date series.
 */
export async function getAnalytics(req, res) {
  try {
    const customerId = req.user.id;
    const days = parseRange(req.query.range);
    const dateSeries = generateDateSeries(days);

    // Sync expired subscriptions first
    await syncExpiredSubscriptions(customerId);

    // ── Spend Trend (daily sum of captured payments) ──────────────────────

    const [spendRows] = await DB.execute(
      `SELECT
         DATE(pay.created_at) AS date,
         SUM(pay.amount) AS value
       FROM payments pay
       JOIN subscriptions s ON pay.subscription_id = s.id
       WHERE s.customer_id = ?
         AND pay.status = 'captured'
         AND pay.created_at >= CURDATE() - INTERVAL ${Number(days)} DAY
         AND s.is_deleted = FALSE
       GROUP BY DATE(pay.created_at)
       ORDER BY DATE(pay.created_at) ASC`,
      [customerId]
    );

    const spendMap = new Map(spendRows.map((r) => [toDateString(r.date), toNum(r.value)]));
    const spendTrend = dateSeries.map((date) => ({
      date,
      value: spendMap.get(date) || 0,
    }));

    // ── Subscription Growth (new subs per day) ───────────────────────────

    const [growthRows] = await DB.execute(
      `SELECT
         s.start_date AS date,
         COUNT(*) AS value
       FROM subscriptions s
       WHERE s.customer_id = ?
         AND s.start_date >= CURDATE() - INTERVAL ${Number(days)} DAY
         AND s.is_deleted = FALSE
       GROUP BY s.start_date
       ORDER BY s.start_date ASC`,
      [customerId]
    );

    const growthMap = new Map(growthRows.map((r) => [toDateString(r.date), r.value]));
    const subscriptionGrowth = dateSeries.map((date) => ({
      date,
      value: growthMap.get(date) || 0,
    }));

    // ── Cancellations (per day) ──────────────────────────────────────────

    const [cancelRows] = await DB.execute(
      `SELECT
         DATE(s.cancelled_at) AS date,
         COUNT(*) AS value
       FROM subscriptions s
       WHERE s.customer_id = ?
         AND s.status = 'cancelled'
         AND s.cancelled_at >= CURDATE() - INTERVAL ${Number(days)} DAY
         AND s.is_deleted = FALSE
       GROUP BY DATE(s.cancelled_at)
       ORDER BY DATE(s.cancelled_at) ASC`,
      [customerId]
    );

    const cancelMap = new Map(cancelRows.map((r) => [toDateString(r.date), r.value]));
    const cancellations = dateSeries.map((date) => ({
      date,
      value: cancelMap.get(date) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        spendTrend,
        subscriptionGrowth,
        cancellations,
      },
    });
  } catch (error) {
    console.error("getAnalytics (user) error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile from the users table.
 */
export async function getProfile(req, res) {
  try {
    const [rows] = await DB.execute(
      `SELECT id, username, email, role, created_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * PUT /api/user/profile
 * Updates the authenticated user's username and/or email.
 */
export async function updateProfile(req, res) {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: "At least one of username or email is required",
      });
    }

    // Build dynamic update
    const fields = [];
    const params = [];

    if (username) {
      fields.push("username = ?");
      params.push(username.trim());
    }
    if (email) {
      fields.push("email = ?");
      params.push(email.trim().toLowerCase());
    }

    params.push(req.user.id);

    const [result] = await DB.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Return updated profile
    const [rows] = await DB.execute(
      `SELECT id, username, email, role, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: rows[0],
      message: "Profile updated successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }
    console.error("updateProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
