import jwt from "jsonwebtoken";

function auth(req, res, next) {
  const token = req.cookies.userToken;
  if (!token) {
    return res.status(401).json({
      message: "not authorized",
    });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: error,
      message: "not authorized",
    });
  }
}

/**
 * Require the authenticated user to have the 'business' role.
 * Must be placed AFTER the auth middleware in the chain.
 */
function requireBusiness(req, res, next) {
  if (req.user.role !== "business") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

/**
 * Require the authenticated user to have the 'customer' role.
 * Must be placed AFTER the auth middleware in the chain.
 */
function requireCustomer(req, res, next) {
  if (req.user.role !== "customer") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
}

export { auth, requireBusiness, requireCustomer };
