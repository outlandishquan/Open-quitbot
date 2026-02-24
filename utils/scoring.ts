export type RankTier =
  | 'Gradient Architect'
  | 'Neural Elite'
  | 'Protocol Scholar'
  | 'Data Explorer'
  | 'Model Initiate';

export interface ScoreResult {
  percentage: number;
  correct: number;
  wrong: number;
  total: number;
  rank: RankTier;
}

const RANKS: { min: number; max: number; tier: RankTier }[] = [
  { min: 95, max: 100, tier: 'Gradient Architect' },
  { min: 85, max: 94, tier: 'Neural Elite' },
  { min: 70, max: 84, tier: 'Protocol Scholar' },
  { min: 50, max: 69, tier: 'Data Explorer' },
  { min: 0, max: 49, tier: 'Model Initiate' },
];

export function calculateScore(
  totalQuestions: number,
  correctCount: number
): ScoreResult {
  const wrong = totalQuestions - correctCount;
  const percentage =
    totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  const rank =
    RANKS.find((r) => percentage >= r.min && percentage <= r.max)?.tier ??
    'Model Initiate';

  return {
    percentage,
    correct: correctCount,
    wrong,
    total: totalQuestions,
    rank,
  };
}
