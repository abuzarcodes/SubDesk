import { DB } from "../mysqlDB/database.js";

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
    const [plan] = await DB.execute(
      `SELECT id, name, price FROM plans WHERE id = ? AND business_id = ?`,
      [plan_id, business_id]
    );

    if (plan.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Check if customer already has an active subscription to this plan
    const [existing] = await DB.execute(
      `SELECT id FROM subscriptions WHERE customer_id = ? AND plan_id = ? AND status = 'active'`,
      [req.user.id, plan_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "You are already subscribed to this plan" });
    }

    const [result] = await DB.execute(
      `INSERT INTO subscriptions (customer_id, plan_id, business_id, start_date, status) VALUES (?, ?, ?, CURDATE(), 'active')`,
      [req.user.id, plan_id, business_id]
    );

    return res.status(201).json({
      message: "Subscription created successfully",
      subscription: { id: result.insertId, plan_id, business_id, status: "active" },
    });
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
      `SELECT s.id, s.start_date, s.status, s.created_at,
              p.name AS plan_name, p.price AS plan_price, p.billing_cycle,
              u.username AS customer_name, u.email AS customer_email
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN users u ON s.customer_id = u.id
       WHERE s.business_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json(subscriptions);
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
      `SELECT s.id, s.start_date, s.status, s.created_at,
              p.name AS plan_name, p.price AS plan_price, p.billing_cycle,
              bu.username AS business_name
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN users bu ON s.business_id = bu.id
       WHERE s.customer_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json(subscriptions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

export { createSubscription, getBusinessSubscriptions, getCustomerSubscriptions };
