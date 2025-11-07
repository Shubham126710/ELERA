import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, unique: true },
    subjects: [{ type: String }], // e.g., ["Algebra", "Geometry"]
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
