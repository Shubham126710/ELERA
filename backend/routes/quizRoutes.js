import express from "express";
import { getNextQuestion, submitAnswer } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/next", protect, getNextQuestion);
router.post("/submit", protect, submitAnswer);

export default router;