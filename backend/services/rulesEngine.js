import Attempt from "../models/Attempt.js";

// Evaluate a very limited expression safely by substituting known variables
function evalIfExpr(ifExpr, context) {
  const allowed = {
    mastery: Number(context.mastery ?? 0),
    streak: Number(context.streak ?? 0),
    attempts: Number(context.attempts ?? 0),
    timeSinceTopicMinutes: Number(context.timeSinceTopicMinutes ?? 0),
    lastCorrect: Number(context.lastCorrect ?? 0),
    lastWrong: Number(context.lastWrong ?? 0),
    mode: String(context.mode ?? "formative"),
  };
  // Only allow comparisons, logical ops, numbers, parentheses, variable names
  const expr = ifExpr
    .replace(/mastery/g, allowed.mastery)
    .replace(/streak/g, allowed.streak)
    .replace(/attempts/g, allowed.attempts)
    .replace(/timeSinceTopicMinutes/g, allowed.timeSinceTopicMinutes)
    .replace(/lastCorrect/g, allowed.lastCorrect)
    .replace(/lastWrong/g, allowed.lastWrong)
    .replace(/mode\s*==\s*'([^']+)'/g, (_, m) => (allowed.mode === m ? 'true' : 'false'))
    .replace(/mode\s*===\s*'([^']+)'/g, (_, m) => (allowed.mode === m ? 'true' : 'false'));

  // Validate that only allowed characters remain
  if (!/^[-+()*\s0-9.<>=!&|truefals]+$/.test(expr)) {
    return false;
  }
  try {
    // eslint-disable-next-line no-eval
    return !!eval(expr);
  } catch {
    return false;
  }
}

export async function determineNextDifficulty({ rulesDoc, mastery, streak, attempts, timeSinceTopicMinutes, lastCorrect, lastWrong, mode }) {
  if (!rulesDoc || !rulesDoc.conditions || rulesDoc.conditions.length === 0) {
    return "medium";
  }
  for (const cond of rulesDoc.conditions) {
    if (evalIfExpr(cond.ifExpr, { mastery, streak, attempts, timeSinceTopicMinutes, lastCorrect, lastWrong, mode })) {
      return cond.nextDifficulty || "medium";
    }
  }
  return "medium";
}

export async function filterBySpacing({ learnerId, candidateIds, cooldownMins }) {
  if (!candidateIds.length) return [];
  const since = new Date(Date.now() - (cooldownMins ?? 1440) * 60 * 1000);
  const recent = await Attempt.find({
    learnerId,
    questionId: { $in: candidateIds },
    createdAt: { $gte: since },
  }).select("questionId");
  const recentSet = new Set(recent.map(r => String(r.questionId)));
  return candidateIds.filter(id => !recentSet.has(id.toString()));
}

export function pickRandom(arr) {
  if (!arr.length) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}
