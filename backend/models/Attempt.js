import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Learner", index: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", index: true },
    topic: { type: String, index: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    mode: { type: String, enum: ["diagnostic", "formative", "summative"], default: "formative" },
    isCorrect: { type: Boolean, required: true },
    selectedOption: { type: String },
    response: { type: String },
    usedHint: { type: Boolean, default: false },
    penalty: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    timeTakenSec: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export default mongoose.model("Attempt", attemptSchema);