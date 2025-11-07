import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    course: { type: String, index: true },
    text: { type: String, required: true },
    type: { type: String, enum: ["mcq", "short", "code"], default: "mcq" },
    options: [{ type: String }],
    correctAnswer: { type: String },
    topic: { type: String, index: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy", index: true },
    bloomLevel: { type: String },
    skills: [{ type: String, index: true }],
    outcomes: [{ type: String }],
    hints: [{ type: String }],
    explanation: { type: String },
    randomizeOptions: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    sourceUrl: { type: String },
  },
  { timestamps: true }
);

questionSchema.index({ course: 1, topic: 1, difficulty: 1 });

export default mongoose.model("Question", questionSchema);