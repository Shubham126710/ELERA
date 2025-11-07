import Learner from "../models/Learner.js";
import Question from "../models/Question.js";
import Rule from "../models/Rule.js";
import Attempt from "../models/Attempt.js";
import TTLCache from "../utils/cache.js";
import { determineNextDifficulty, filterBySpacing, pickRandom } from "../services/rulesEngine.js";

const idsCache = new TTLCache(30_000, 500); // cache candidate ids by topic/difficulty for 30s

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const getNextQuestion = async (req, res) => {
  try {
    const { learnerId, course: requestedCourse, topic: requestedTopic, mode = "formative" } = req.body;
    const learner = await Learner.findById(learnerId);
    if (!learner) return res.status(404).json({ msg: "Learner not found" });

    // Choose topic: requested or lowest mastery topic available in bank
    let topic = requestedTopic;
    if (!topic) {
      if (learner.mastery?.length) {
        const sorted = [...learner.mastery].sort((a, b) => (a.score ?? 0.5) - (b.score ?? 0.5));
        topic = sorted[0]?.topic;
      }
      if (!topic) {
        const filter = { isActive: true };
        if (requestedCourse) filter.course = requestedCourse;
        const anyTopic = await Question.distinct("topic", filter);
        topic = anyTopic[0];
      }
    }
    if (!topic) return res.status(400).json({ msg: "No topic available" });

    const rules = await Rule.findOne({ topic, active: true }).lean();
    const m = learner.mastery.find((x) => x.topic === topic) || { score: 0.5, streak: 0, attempts: 0 };

    // Compute time since last attempt on this topic
    const lastAttempt = await Attempt.findOne({ learnerId, topic }).sort({ createdAt: -1 }).lean();
    const timeSinceTopicMinutes = lastAttempt ? Math.max(0, (Date.now() - new Date(lastAttempt.createdAt).getTime()) / 60000) : 99999;

    const difficulty = await determineNextDifficulty({
      rulesDoc: rules,
      mastery: m.score ?? 0.5,
      streak: m.streak ?? 0,
      attempts: m.attempts ?? 0,
      timeSinceTopicMinutes,
      mode,
    });

    // Candidate question ids by topic/difficulty
    const cacheKey = `${requestedCourse || 'any'}:${topic}:${difficulty}`;
    let candidateIds = idsCache.get(cacheKey);
    if (!candidateIds) {
      const qFilter = { topic, difficulty, isActive: true };
      if (requestedCourse) qFilter.course = requestedCourse;
      const docs = await Question.find(qFilter).select("_id").lean();
      candidateIds = docs.map((d) => d._id);
      idsCache.set(cacheKey, candidateIds);
    }

    // Spacing filter
    const cooled = await filterBySpacing({ learnerId, candidateIds, cooldownMins: rules?.cooldownMins ?? 60 });

    let finalIds = cooled;
    if (!finalIds.length) {
      // fallback: ignore spacing if necessary
      finalIds = candidateIds;
    }
    if (!finalIds.length) {
      // last fallback: any difficulty
      const anyFilter = { topic, isActive: true };
      if (requestedCourse) anyFilter.course = requestedCourse;
      const any = await Question.find(anyFilter).select("_id").lean();
      finalIds = any.map((d) => d._id);
    }
    if (!finalIds.length) {
      // Global fallback: any active question across all topics/courses
      const global = await Question.find({ isActive: true }).select('_id').lean();
      if (!global.length) return res.status(404).json({ msg: "No questions available" });
      finalIds = global.map(d => d._id);
    }

    const chosenId = pickRandom(finalIds);
  const q = await Question.findById(chosenId).lean();
    if (!q) return res.status(404).json({ msg: "Question not found" });

    // Randomize options for MCQ if enabled
    let options = q.options || [];
    if (q.type === "mcq" && q.randomizeOptions && options.length > 1) options = shuffle(options);

    // If global fallback changed topic, reflect real topic
    res.json({
      question: {
        _id: q._id,
        text: q.text,
        type: q.type,
        options,
        course: q.course,
        topic: q.topic,
        difficulty: q.difficulty,
        hints: q.hints,
        explanation: q.explanation,
      },
      difficulty: q.difficulty,
      topic: q.topic,
      course: requestedCourse || q.course || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { learnerId, questionId, topic, difficulty, selectedOption, usedHint = false, timeTakenSec = 0, mode = "formative" } = req.body;
    const learner = await Learner.findById(learnerId);
    if (!learner) return res.status(404).json({ msg: "Learner not found" });
    const q = await Question.findById(questionId).lean();
    if (!q) return res.status(404).json({ msg: "Question not found" });

    const isCorrect = q.type === "mcq" ? selectedOption === q.correctAnswer : Boolean(selectedOption && String(selectedOption).trim().length);
    const penalty = usedHint ? 0.1 : 0; // simple hint penalty

    const attempt = await Attempt.create({
      learnerId,
      questionId,
      topic: topic || q.topic,
      difficulty: difficulty || q.difficulty,
      mode,
      isCorrect,
      selectedOption: selectedOption ?? null,
      usedHint,
      penalty,
      points: isCorrect ? (q.difficulty === "hard" ? 3 : q.difficulty === "medium" ? 2 : 1) : 0,
      timeTakenSec,
    });

    // Update mastery EWMA
    const t = topic || q.topic;
    let m = learner.mastery.find((x) => x.topic === t);
    if (!m) {
      m = { topic: t, score: 0.5, streak: 0, attempts: 0, timeOnTaskSec: 0 };
      learner.mastery.push(m);
    }
    const baseAlpha = mode === "diagnostic" ? 0.5 : mode === "summative" ? 0.35 : 0.3;
    const effective = Math.max(0, (isCorrect ? 1 : 0) - penalty);
    const updated = (1 - baseAlpha) * (m.score ?? 0.5) + baseAlpha * effective;
    m.score = Number(updated.toFixed(2));
    m.streak = isCorrect ? (m.streak || 0) + 1 : 0;
    m.attempts = (m.attempts || 0) + 1;
    m.timeOnTaskSec = (m.timeOnTaskSec || 0) + (Number(timeTakenSec) || 0);
    m.lastAttemptAt = new Date();
    await learner.save();

    res.json({ msg: "Answer recorded", isCorrect, newMastery: m.score, streak: m.streak, attemptId: attempt._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};