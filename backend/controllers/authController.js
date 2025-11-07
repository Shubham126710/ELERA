import Learner from "../models/Learner.js";
import LoginEvent from "../models/LoginEvent.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "student" } = req.body;
    const existing = await Learner.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const learner = await Learner.create({ name, email, password: hashed, role });

    res.json({ msg: "Registration successful", learner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let learner = await Learner.findOne({ email });
    // Auto-provision demo account for local dev if not found and matches demo creds
    if (!learner && email === 'demo@elera.test' && password === 'password') {
      const hashed = await bcrypt.hash('password', 10);
      learner = await Learner.create({ name: 'Demo User', email, password: hashed, role: 'student' });
    }
    if (!learner) {
      await LoginEvent.create({
        email,
        success: false,
        reason: "user_not_found",
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "",
      });
      return res.status(400).json({ msg: "User not found" });
    }

    const valid = await bcrypt.compare(password, learner.password);
    if (!valid) {
      await LoginEvent.create({
        email,
        user: learner._id,
        success: false,
        reason: "invalid_password",
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "",
      });
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign({ id: learner._id, role: learner.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // Update aggregate login info (non-blocking)
    try {
      learner.lastLoginAt = new Date();
      learner.loginCount = (learner.loginCount || 0) + 1;
      await learner.save();
    } catch {}
    await LoginEvent.create({
      email,
      user: learner._id,
      success: true,
      reason: "ok",
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });
    res.json({ token, learner });
  } catch (err) {
    try {
      await LoginEvent.create({
        email: req.body?.email,
        success: false,
        reason: "error",
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "",
      });
    } catch {}
    res.status(500).json({ error: err.message });
  }
};