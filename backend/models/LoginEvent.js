import mongoose from "mongoose";

const loginEventSchema = new mongoose.Schema(
  {
    email: { type: String, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Learner" },
    success: { type: Boolean, required: true },
    reason: { type: String, enum: ["ok", "user_not_found", "invalid_password", "error"], default: "ok" },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

loginEventSchema.index({ createdAt: -1 });

export default mongoose.model("LoginEvent", loginEventSchema);
