import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DB } from "../mysqlDB/database.js";

async function fetchAllUsers(req, res) {
  try {
    const [results] = await DB.execute(
      "SELECT id, username, email, role, created_at FROM users;"
    );
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
}

async function registerUser(req, res) {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const userRole = role === "business" ? "business" : "customer";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await DB.execute(
      `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, userRole]
    );

    const [row] = await DB.execute(
      `SELECT id, username, email, role FROM users WHERE email = ?`,
      [email]
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
      { expiresIn: "7d" }
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Server error", error });
  }
}

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const [rows] = await DB.execute(
      "SELECT id, username, email, password, role FROM users WHERE email = ?",
      [email]
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
      { expiresIn: "7d" }
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getMe(req, res) {
  return res.status(200).json({ user: req.user });
}

async function logoutUser(req, res) {
  res.clearCookie("userToken");
  return res.status(200).json({ message: "Logged out successfully" });
}

export { fetchAllUsers, registerUser, userLogin, getMe, logoutUser };
