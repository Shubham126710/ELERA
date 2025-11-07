import { describe, it, expect } from '@jest/globals';
import { determineNextDifficulty } from "../services/rulesEngine.js";

describe('rulesEngine.determineNextDifficulty', () => {
  it('falls back to medium when no rules', async () => {
    const diff = await determineNextDifficulty({ rulesDoc: null, mastery: 0.3 });
    expect(diff).toBe('medium');
  });

  it('selects easy when mastery < 0.6', async () => {
    const rulesDoc = { conditions: [
      { ifExpr: 'mastery < 0.6', nextDifficulty: 'easy' },
      { ifExpr: 'mastery >= 0.6 && mastery < 0.85', nextDifficulty: 'medium' },
      { ifExpr: 'mastery >= 0.85', nextDifficulty: 'hard' },
    ] };
    const diff = await determineNextDifficulty({ rulesDoc, mastery: 0.4, streak: 0, attempts: 3, timeSinceTopicMinutes: 10 });
    expect(diff).toBe('easy');
  });

  it('selects hard when mastery high', async () => {
    const rulesDoc = { conditions: [
      { ifExpr: 'mastery < 0.6', nextDifficulty: 'easy' },
      { ifExpr: 'mastery >= 0.6 && mastery < 0.85', nextDifficulty: 'medium' },
      { ifExpr: 'mastery >= 0.85', nextDifficulty: 'hard' },
    ] };
    const diff = await determineNextDifficulty({ rulesDoc, mastery: 0.9, streak: 5, attempts: 10, timeSinceTopicMinutes: 10 });
    expect(diff).toBe('hard');
  });
});
