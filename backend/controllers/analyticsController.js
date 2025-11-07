import Attempt from "../models/Attempt.js";
import Learner from "../models/Learner.js";

export const learnerSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;
    if (!(requester?.id === id || ["instructor", "admin"].includes(requester?.role))) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    const learner = await Learner.findById(id).lean();
    if (!learner) return res.status(404).json({ msg: "Learner not found" });

    const attempts = await Attempt.find({ learnerId: id }).sort({ createdAt: 1 }).lean();
    // Heatmap data: correctness rate per topic
    const byTopic = {};
    for (const a of attempts) {
      const t = a.topic || "General";
      byTopic[t] = byTopic[t] || { correct: 0, total: 0 };
      byTopic[t].total += 1;
      byTopic[t].correct += a.isCorrect ? 1 : 0;
    }
    const heatmap = Object.entries(byTopic).map(([topic, v]) => ({ topic, rate: v.total ? v.correct / v.total : 0 }));

    // Trajectory: moving average of last 10 attempts correctness
    const window = 10;
    const traj = [];
    let sum = 0;
    for (let i = 0; i < attempts.length; i++) {
      sum += attempts[i].isCorrect ? 1 : 0;
      if (i >= window) sum -= attempts[i - window].isCorrect ? 1 : 0;
      traj.push({ idx: i + 1, ma: i + 1 >= window ? sum / window : sum / (i + 1) });
    }

    res.json({ learner: { _id: learner._id, name: learner.name, email: learner.email, mastery: learner.mastery }, heatmap, trajectory: traj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
