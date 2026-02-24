import jwt from 'jsonwebtoken'

function auth(req, res, next) {
  const token = req.cookies.userToken;
  if (!token) {
    return res.status(401).json({
      massage: "not authorized",
    });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: error,
      massage: "not authorized",
    });
  }
}

export {auth}
