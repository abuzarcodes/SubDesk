import { DB } from "../mysqlDB/database.js";

async function createPlan(req, res) {
  try {
    console.log("Create Plan Request Body:", req.body);
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Only business users can create plans" });
    }

    const { 
      name, 
      price, 
      billing_cycle, 
      description, 
      features, 
      discount, 
      benefits_available, 
      benefits_not_available 
    } = req.body;
    
    if (!name || !price || !billing_cycle) {
      return res.status(400).json({ message: "Name, price, and billing cycle are required" });
    }

    const [result] = await DB.execute(
      `INSERT INTO plans (business_id, name, price, billing_cycle, description, features, discount, benefits_available, benefits_not_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, 
        name, 
        price, 
        billing_cycle, 
        description || null, 
        features ? JSON.stringify(features) : null, 
        discount || 0.00, 
        benefits_available ? JSON.stringify(benefits_available) : null, 
        benefits_not_available ? JSON.stringify(benefits_not_available) : null
      ]
    );

    return res.status(201).json({
      message: "Plan created successfully",
      plan: { 
        id: result.insertId, 
        name, 
        price, 
        billing_cycle,
        description,
        features,
        discount,
        benefits_available,
        benefits_not_available
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getPlans(req, res) {
  try {
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Only business users can view their plans" });
    }

    const [plans] = await DB.execute(
      `SELECT id, name, price, billing_cycle, description, features, discount, benefits_available, benefits_not_available, created_at FROM plans WHERE business_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json(plans);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getPublicPlans(req, res) {
  try {
    const { businessId } = req.params;

    const [business] = await DB.execute(
      `SELECT id, username FROM users WHERE id = ? AND role = 'business'`,
      [businessId]
    );

    if (business.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }

    const [plans] = await DB.execute(
      `SELECT id, name, price, billing_cycle, description, features, discount, benefits_available, benefits_not_available, created_at FROM plans WHERE business_id = ? ORDER BY created_at DESC`,
      [businessId]
    );

    return res.status(200).json({
      business: { id: business[0].id, name: business[0].username },
      plans,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function updatePlan(req, res) {
  try {
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Only business users can update plans" });
    }

    const { id } = req.params;
    const { 
      name, 
      price, 
      billing_cycle, 
      description, 
      features, 
      discount, 
      benefits_available, 
      benefits_not_available 
    } = req.body;

    if (!name || !price || !billing_cycle) {
      return res.status(400).json({ message: "Name, price, and billing cycle are required" });
    }

    const [result] = await DB.execute(
      `UPDATE plans SET name = ?, price = ?, billing_cycle = ?, description = ?, features = ?, discount = ?, benefits_available = ?, benefits_not_available = ? WHERE id = ? AND business_id = ?`,
      [
        name, 
        price, 
        billing_cycle, 
        description || null, 
        features ? JSON.stringify(features) : null, 
        discount || 0.00, 
        benefits_available ? JSON.stringify(benefits_available) : null, 
        benefits_not_available ? JSON.stringify(benefits_not_available) : null,
        id, 
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Plan not found or unauthorized to update" });
    }

    // Fetch the updated plan to return it
    const [updatedPlans] = await DB.execute(
      `SELECT id, name, price, billing_cycle, description, features, discount, benefits_available, benefits_not_available, created_at FROM plans WHERE id = ? AND business_id = ?`,
      [id, req.user.id]
    );

    return res.status(200).json({
      message: "Plan updated successfully",
      plan: updatedPlans[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deletePlan(req, res) {
  try {
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Only business users can delete plans" });
    }

    const { id } = req.params;

    const [result] = await DB.execute(
      `DELETE FROM plans WHERE id = ? AND business_id = ?`,
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Plan not found or unauthorized to delete" });
    }

    return res.status(200).json({
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

export { createPlan, getPlans, getPublicPlans, updatePlan, deletePlan };
