import mongoose from "mongoose";

const conditionSchema = new mongoose.Schema(
  {
    ifExpr: { type: String, required: true }, // e.g., "mastery < 0.6 && streak < 3"
    nextDifficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  },
  { _id: false }
);

const ruleSchema = new mongoose.Schema(
  {
    topic: { type: String, index: true },
    cooldownMins: { type: Number, default: 1440 }, // spacing to avoid repeats
    conditions: [conditionSchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Rule", ruleSchema);