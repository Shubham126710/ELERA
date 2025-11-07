import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { exportItems, importItems } from "../controllers/itemController.js";

const router = express.Router();

function requireInstructor(req, res, next){
  const role = req.user?.role
  if(role === 'instructor' || role === 'admin') return next()
  return res.status(403).json({ msg: 'Instructor role required' })
}

router.get('/export', protect, requireInstructor, exportItems)
router.post('/import', protect, requireInstructor, importItems)

export default router;
