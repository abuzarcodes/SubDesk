import { DB } from "../mysqlDB/database.js";

// GET /api/business/page-config
export const getPageConfig = async (req, res) => {
  try {
    const businessId = req.user.id;

    const [profiles] = await DB.query(`SELECT * FROM business_profiles WHERE business_id = ?`, [businessId]);
    const [configs] = await DB.query(`SELECT * FROM page_configs WHERE business_id = ?`, [businessId]);

    if (profiles.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({
      profile: profiles[0],
      config: configs.length > 0 ? configs[0] : {}
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/business/page-config
export const updatePageConfig = async (req, res) => {
  try {
    const businessId = req.user.id;
    const { theme, layout, components } = req.body;

    if (!theme || !layout || !components) {
      return res.status(400).json({ message: "theme, layout, and components are required" });
    }

    await DB.query(
      `UPDATE page_configs SET theme = ?, layout = ?, components = ? WHERE business_id = ?`,
      [JSON.stringify(theme), JSON.stringify(layout), JSON.stringify(components), businessId]
    );

    res.status(200).json({ message: "Page Config Updated successfully" });
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/business/profile
export const updateProfile = async (req, res) => {
  try {
    const businessId = req.user.id;
    const { display_name, logo_url, tagline, support_email, slug } = req.body;

    let formattedSlug = null;
    if (slug) {
      formattedSlug = slug.toLowerCase().replace(/\s+/g, '-');
      // check for uniqueness
      const [existing] = await DB.query(`SELECT id FROM business_profiles WHERE slug = ? AND business_id != ?`, [formattedSlug, businessId]);
      if (existing.length > 0) {
        return res.status(400).json({ message: "Slug is already heavily used. Choose another." });
      }
    }

    await DB.query(
      `UPDATE business_profiles 
       SET display_name = COALESCE(?, display_name), 
           logo_url = COALESCE(?, logo_url), 
           tagline = COALESCE(?, tagline), 
           support_email = COALESCE(?, support_email), 
           slug = COALESCE(?, slug) 
       WHERE business_id = ?`,
      [display_name, logo_url, tagline, support_email, formattedSlug, businessId]
    );

    res.status(200).json({ message: "Profile Updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// POST /api/business/page-config/publish
export const publishPageConfig = async (req, res) => {
  try {
    await DB.query(`UPDATE page_configs SET is_published = TRUE WHERE business_id = ?`, [req.user.id]);
    res.status(200).json({ message: "Page Published successfully" });
  } catch (error) {
    console.error("Error publishing config:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/business/page-config/unpublish
export const unpublishPageConfig = async (req, res) => {
  try {
    await DB.query(`UPDATE page_configs SET is_published = FALSE WHERE business_id = ?`, [req.user.id]);
    res.status(200).json({ message: "Page Unpublished successfully" });
  } catch (error) {
    console.error("Error unpublishing config:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
