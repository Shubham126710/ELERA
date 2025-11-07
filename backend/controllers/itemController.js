import Question from "../models/Question.js";

export const exportItems = async (req, res) => {
  try {
    const items = await Question.find({}).lean();
    res.json({ count: items.length, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const importItems = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ msg: "items must be an array" });
    const cleaned = items.map((i) => ({ ...i, _id: undefined }));
    const result = await Question.insertMany(cleaned, { ordered: false });
    res.json({ inserted: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
