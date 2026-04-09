import { DB } from "../mysqlDB/database.js";

export const getPublicSubscriptionPage = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let businessId = null;
    let slug = null;
    
    if (!isNaN(identifier)) {
      businessId = parseInt(identifier, 10);
    } else {
      slug = identifier;
    }

    // Attempt to get the business profile and config
    // Using a JOIN to get profile, config, and check user role simultaneously
    let query = `
      SELECT 
        bp.business_id, bp.display_name, bp.logo_url, bp.tagline, bp.support_email,
        pc.theme, pc.layout, pc.components
      FROM business_profiles bp
      JOIN page_configs pc ON bp.business_id = pc.business_id
      JOIN users u ON bp.business_id = u.id
      WHERE u.role = 'business' AND bp.is_active = TRUE AND pc.is_published = TRUE
    `;
    let queryParams = [];

    if (businessId) {
      query += ` AND bp.business_id = ?`;
      queryParams.push(businessId);
    } else {
      query += ` AND bp.slug = ?`;
      queryParams.push(slug);
    }

    const [businessData] = await DB.query(query, queryParams);

    if (!businessData || businessData.length === 0) {
      return res.status(404).json({ message: "Subscription page not found or unpublished" });
    }

    const data = businessData[0];

    // Fetch associated active plans for this business
    const [plans] = await DB.query(
      `SELECT id, name, price, billing_cycle, description, features, discount, benefits_available, benefits_not_available 
       FROM plans 
       WHERE business_id = ?`,
      [data.business_id]
    );

    return res.status(200).json({
      business: {
        id: data.business_id,
        display_name: data.display_name,
        logo_url: data.logo_url,
        tagline: data.tagline,
        support_email: data.support_email
      },
      plans: plans,
      config: {
        theme: data.theme,
        layout: data.layout,
        components: data.components
      }
    });
  } catch (error) {
    console.error("Error fetching public subscription page:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
