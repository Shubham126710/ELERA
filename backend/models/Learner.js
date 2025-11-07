import mongoose from "mongoose";

const masterySchema = new mongoose.Schema(
  {
    topic: { type: String, index: true },
    score: { type: Number, default: 0.5, min: 0, max: 1 }, // mastery between 0 and 1
    streak: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
    attempts: { type: Number, default: 0 },
    timeOnTaskSec: { type: Number, default: 0 },
  },
  { _id: false }
);

const learnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },
    mastery: [masterySchema],
    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Learner", learnerSchema);