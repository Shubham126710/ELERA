import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

dotenv.config();
// Provide a safe dev default for JWT if not set
if (!process.env.JWT_SECRET) {
	process.env.JWT_SECRET = "dev-secret-change-me";
}
// Only connect immediately if not running in a test environment. Tests can invoke connectDB manually if needed.
if (process.env.NODE_ENV !== "test") {
	connectDB();
}

const app = express();
// Trust proxy headers so req.ip reflects real client IP in dev proxies
app.set("trust proxy", true);
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/courses", courseRoutes);

app.get("/", (req, res) => res.send("Adaptive Learning API Running ✅"));

// Export app for supertest; start server only when not under test
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;