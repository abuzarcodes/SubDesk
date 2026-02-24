import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DB } from "../mysqlDB/database.js";

async function fetchAllUsers(req, res, next) {
  const [results] = await DB.execute(
    "select id,username,email,role,created_at from users;",
  );
  return results;
}

async function registerUser(req, res, next) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(401).json({ message: "all fields are required" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await DB.execute(
      `INSERT INTO users (username, email, password, role) 
     VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, "user"],
    );
    const [row] = await DB.execute(
      `select id,username,email,role from users where email=?`,
      [email],
    );
    const user = row[0];
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: 10000 },
    );

    res.cookie("userToken", token);
    res.status(200).json({ message: "registration successful" });
    return next();
  } catch (error) {
    return res.send(error);
  }
}

async function userLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const [rows] = await DB.execute(
      "SELECT id, email, password, role FROM users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: 10000 },
    );

    res.cookie("userToken", token);
    res.status(200).json({
      message: "Login successful",
    });
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// async function fetchUser(req,res,next) {
//   const [result] = await DB.execute(
//     `select id,username,email,role,created_at form users where id=?`,
//     [userID],
//   );

//   return result;
// }
export { fetchAllUsers, registerUser, userLogin };
