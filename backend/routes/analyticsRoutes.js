import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { learnerSummary } from "../controllers/analyticsController.js";

const router = express.Router();

// Instructor/Admin can view any learner; students can view self
router.get("/learner/:id/summary", protect, learnerSummary);

export default router;
