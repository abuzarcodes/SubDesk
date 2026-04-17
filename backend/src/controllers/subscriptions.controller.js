import { DB } from "../mysqlDB/database.js";
import { calculateExpiry } from "../utils/expiry.util.js";

/**
 * Lazy-update helper to synchronize database status for expired subscriptions.
 * Works on a batch of subscription objects already containing 'expires_at' or 'computed_status'.
 */
async function syncExpiredSubscriptions(subscriptions) {
  try {
    const expiredIds = subscriptions
      .filter((sub) => {
        const isExpiredByDate = sub.expires_at && new Date(sub.expires_at) < new Date();
        const isNotYetMarked = sub.status !== "expired";
        return isExpiredByDate && isNotYetMarked;
      })
      .map((sub) => sub.id);

    if (expiredIds.length > 0) {
      await DB.query(
        `UPDATE subscriptions SET status = 'expired' WHERE id IN (?)`,
        [expiredIds]
      );
      console.log(`Lazy-sync: Marked ${expiredIds.length} subscriptions as expired.`);
    }
  } catch (error) {
    console.error("syncExpiredSubscriptions error:", error.message);
    // Non-blocking: we don't throw or return error to the user
  }
}

async function createSubscription(req, res) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can subscribe to plans" });
    }

    const { plan_id, business_id } = req.body;

    if (!plan_id || !business_id) {
      return res.status(400).json({ message: "Plan ID and business ID are required" });
    }

    // Verify the plan exists and belongs to the business
    const [planRows] = await DB.execute(
      `SELECT id, name, price, billing_cycle FROM plans WHERE id = ? AND business_id = ?`,
      [plan_id, business_id]
    );

    if (planRows.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const plan = planRows[0];

    // Check if customer already has an active subscription to this plan
    const [existing] = await DB.execute(
      `SELECT id FROM subscriptions WHERE customer_id = ? AND plan_id = ? AND status = 'active'`,
      [req.user.id, plan_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "You are already subscribed to this plan" });
    }

    return res.status(400).json({ message: "Direct subscription creation is deprecated. Please use the /api/payments/create-order flow." });


  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getBusinessSubscriptions(req, res) {
  try {
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [subscriptions] = await DB.execute(
      `SELECT s.id, s.start_date, s.status, s.created_at, s.expires_at,
              CASE 
                WHEN s.expires_at IS NOT NULL AND s.expires_at < NOW() THEN 'expired'
                ELSE s.status 
              END AS computed_status,
              p.name AS plan_name, p.price AS plan_price, p.billing_cycle,
              u.username AS customer_name, u.email AS customer_email
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN users u ON s.customer_id = u.id
       WHERE s.business_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    // Perform lazy update for any newly detected expired subs
    if (subscriptions.length > 0) {
      syncExpiredSubscriptions(subscriptions);
    }

    // Return subscriptions with status mapped to computed_status for the UI
    const result = subscriptions.map(s => ({
      ...s,
      status: s.computed_status // Ensure backward compatibility with UI expectation of 'status'
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getCustomerSubscriptions(req, res) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [subscriptions] = await DB.execute(
      `SELECT s.id, s.start_date, s.status, s.created_at, s.expires_at,
              CASE 
                WHEN s.expires_at IS NOT NULL AND s.expires_at < NOW() THEN 'expired'
                ELSE s.status 
              END AS computed_status,
              p.name AS plan_name, p.price AS plan_price, p.billing_cycle,
              bu.username AS business_name
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN users bu ON s.business_id = bu.id
       WHERE s.customer_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    // Perform lazy update for any newly detected expired subs
    if (subscriptions.length > 0) {
      syncExpiredSubscriptions(subscriptions);
    }

    // Map computed_status to status for the UI
    const result = subscriptions.map(s => ({
      ...s,
      status: s.computed_status
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// ── Subscription Status Management ─────────────────────────────────────────

/**
 * Centralized state-transition validator.
 * Returns null when the transition is valid, or an error message string.
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

  // Unknown / terminal status
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
 * PATCH /api/subscriptions/:id/status
 * Body: { "action": "pause" | "resume" | "cancel" }
 *
 * - Validates ownership (business_id)
 * - Enforces state-transition rules
 * - Uses a transaction for atomic update + event insert
 */
async function updateSubscriptionStatus(req, res) {
  try {
    const subscriptionId = parseInt(req.params.id, 10);
    if (isNaN(subscriptionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription ID" });
    }

    const { action } = req.body;
    if (!action || !["pause", "resume", "cancel"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'pause', 'resume', or 'cancel'",
      });
    }

    // Fetch with ownership validation and plan details for expiry calculation
    const [rows] = await DB.execute(
      `SELECT s.id, s.status, p.billing_cycle 
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.id = ? AND s.business_id = ?`,
      [subscriptionId, req.user.id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
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
    console.error("updateSubscriptionStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export {
  createSubscription,
  getBusinessSubscriptions,
  getCustomerSubscriptions,
  updateSubscriptionStatus,
};
