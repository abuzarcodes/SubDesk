import crypto from "crypto";
import Razorpay from "razorpay";
import { DB } from "../mysqlDB/database.js";
import { calculateExpiry } from "../utils/expiry.util.js";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createOrder(req, res) {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can subscribe." });
    }

    const { plan_id, business_id } = req.body;
    if (!plan_id || !business_id) {
      return res.status(400).json({ message: "Plan ID and business ID are required." });
    }

    // 1. Verify plan ownership
    const [planRows] = await DB.execute(
      `SELECT id, name, price, billing_cycle FROM plans WHERE id = ? AND business_id = ?`,
      [plan_id, business_id]
    );

    if (planRows.length === 0) {
      return res.status(404).json({ message: "Plan not found or does not belong to business." });
    }
    const plan = planRows[0];

    // 2. Prevent duplicate active subscriptions
    const [existingActive] = await DB.execute(
      `SELECT id FROM subscriptions WHERE customer_id = ? AND plan_id = ? AND status = 'active'`,
      [req.user.id, plan_id]
    );

    if (existingActive.length > 0) {
      return res.status(409).json({ message: "You are already subscribed to this plan." });
    }

    // 3. Idempotency: Check if a pending subscription for this plan by this customer already exists
    // This avoids creating duplicate subscriptions (and orders) if the user clicks "subscribe" repeatedly.
    const [existingPending] = await DB.execute(
      `SELECT id, razorpay_order_id, payment_status FROM subscriptions 
       WHERE customer_id = ? AND plan_id = ? AND status = 'inactive' AND payment_status IN ('pending', 'verified_pending')
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, plan_id]
    );

    if (existingPending.length > 0 && existingPending[0].razorpay_order_id) {
      // Re-use the existing order if we still have one that is pending
      const order = await razorpay.orders.fetch(existingPending[0].razorpay_order_id);
      return res.status(200).json({
        message: "Order already exists",
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        plan_name: plan.name,
      });
    }

    // 4. Create Razorpay order
    const amountInPaise = Math.round(Number(plan.price) * 100);
    const receiptId = `sub_${Date.now()}_${req.user.id}`;
    
    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(orderOptions);
    console.log("ORDER:", order);

    // 5. Save temporary subscription row
    const [result] = await DB.execute(
      `INSERT INTO subscriptions 
       (customer_id, plan_id, business_id, start_date, status, payment_status, razorpay_order_id) 
       VALUES (?, ?, ?, CURDATE(), 'inactive', 'pending', ?)`,
      [req.user.id, plan_id, business_id, order.id]
    );

    return res.status(201).json({
      message: "Order created successfully",
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      plan_name: plan.name,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Incomplete payment details." });
    }

    // 1. Signature validation
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature." });
    }

    // 2. Fetch Subscription and Plan to verify Amount Integrity
    const [rows] = await DB.execute(
      `SELECT s.id, s.status, s.payment_status, p.price, p.billing_cycle 
       FROM subscriptions s 
       JOIN plans p ON s.plan_id = p.id 
       WHERE s.razorpay_order_id = ?`,
      [razorpay_order_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Subscription record not found." });
    }

    const sub = rows[0];

    // Retry Safety: already processed?
    if (sub.status === 'active' || sub.payment_status === 'paid' || sub.payment_status === 'verified_pending') {
      return res.status(200).json({ message: "Payment already verified." });
    }

    // Check with Razorpay payment details for double security (Amount Integrity Check)
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const expectedAmountPaise = Math.round(Number(sub.price) * 100);
    
    if (payment.amount !== expectedAmountPaise) {
      return res.status(400).json({ message: "Payment amount mismatch." });
    }

    // 3. Mark as verified_pending (Webhook is the SSoT for final activation)
    await DB.execute(
      `UPDATE subscriptions SET payment_status = 'verified_pending', razorpay_payment_id = ? WHERE razorpay_order_id = ?`,
      [razorpay_payment_id, razorpay_order_id]
    );

    // Provide a proactive fallback logging into payments table right here, just in case webhook is delayed
    await DB.execute(
      `INSERT INTO payments 
       (subscription_id, razorpay_order_id, razorpay_payment_id, amount, currency, status, payment_method) 
       VALUES (?, ?, ?, ?, ?, ?, 'razorpay')`,
      [sub.id, razorpay_order_id, razorpay_payment_id, Number(sub.price), "INR", "verified_pending"]
    );

    return res.status(200).json({ message: "Payment verified, awaiting final confirmation." });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function webhookHandler(req, res) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // Verify webhook signature
    // Important: req.body MUST be raw Buffer here (handled via express.raw in routes)
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (generatedSignature !== signature) {
      console.error("Webhook signature mismatch.");
      return res.status(400).send("Invalid signature");
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;
    
    if (event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const razorpay_order_id = payment.order_id;
      const razorpay_payment_id = payment.id;
      const amountPaise = payment.amount;
      const currency = payment.currency;

      // Find tracking record
      const [rows] = await DB.execute(
        `SELECT s.id, s.status, s.payment_status, p.price, p.billing_cycle 
         FROM subscriptions s 
         JOIN plans p ON s.plan_id = p.id 
         WHERE s.razorpay_order_id = ?`,
        [razorpay_order_id]
      );

      if (rows.length > 0) {
        const sub = rows[0];

        // Idempotency check: if already active, do nothing
        if (sub.status !== "active" && sub.payment_status !== "paid") {
          
          // Integrity Check
          const expectedAmountPaise = Math.round(Number(sub.price) * 100);
          if (amountPaise === expectedAmountPaise) {
            
            const expiresAt = calculateExpiry(sub.billing_cycle);
            
            await DB.transaction(async (connection) => {
              // Mark subscription activated
              await connection.execute(
                `UPDATE subscriptions 
                 SET status = 'active', payment_status = 'paid', started_at = NOW(), expires_at = ?, razorpay_payment_id = ? 
                 WHERE id = ?`,
                [expiresAt, razorpay_payment_id, sub.id]
              );

              // Log payment as captured
              await connection.execute(
                `INSERT INTO payments 
                 (subscription_id, razorpay_order_id, razorpay_payment_id, amount, currency, status, payment_method, raw_payload) 
                 VALUES (?, ?, ?, ?, ?, ?, 'razorpay', ?)`,
                [sub.id, razorpay_order_id, razorpay_payment_id, Number(sub.price), currency, "captured", JSON.stringify(payload)]
              );
            });
            console.log(`Webhook: Subscription ${sub.id} activated successfully.`);
          } else {
             console.error(`Webhook: Amount mismatch for order ${razorpay_order_id}`);
          }
        } else {
          console.log(`Webhook: Subscription ${sub.id} already active, skipping.`);
        }
      }
    } else if (event === "payment.failed") {
      const payment = payload.payload.payment.entity;
      const razorpay_order_id = payment.order_id;
      const razorpay_payment_id = payment.id;

      const [rows] = await DB.execute(
        `SELECT id, price FROM subscriptions WHERE razorpay_order_id = ?`,
        [razorpay_order_id]
      );

      if (rows.length > 0) {
        const sub = rows[0];
        
        await DB.execute(
          `UPDATE subscriptions SET payment_status = 'failed', razorpay_payment_id = ? WHERE id = ?`,
          [razorpay_payment_id, sub.id]
        );

        await DB.execute(
          `INSERT INTO payments 
           (subscription_id, razorpay_order_id, razorpay_payment_id, amount, status, payment_method, raw_payload) 
           VALUES (?, ?, ?, ?, ?, 'razorpay', ?)`,
          [sub.id, razorpay_order_id, razorpay_payment_id, Number(sub.price), "failed", JSON.stringify(payload)]
        );
        console.log(`Webhook: Payment failed for subscription ${sub.id}.`);
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("webhookHandler error:", error);
    res.status(500).send("Server error");
  }
}
