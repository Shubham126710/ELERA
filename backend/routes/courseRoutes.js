import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { listCourses, listSubjects, listQuestions, getLearningPath } from "../controllers/courseController.js";

const router = express.Router();

// Anyone logged in can browse courses and subjects
router.get("/", protect, listCourses);
router.get("/:course/subjects", protect, listSubjects);
router.get("/:course/questions", protect, listQuestions);
router.get("/learning-path/:course", protect, getLearningPath);

export default router;
