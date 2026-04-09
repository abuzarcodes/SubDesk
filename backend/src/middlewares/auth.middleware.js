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

export { auth };
