export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: Difficulty;
  category: string;
}

const EASY_RATIO = 0.4;
const MEDIUM_RATIO = 0.4;
const HARD_RATIO = 0.2;
const QUESTIONS_PER_SESSION = 12;

/**
 * Picks n unique random indices from 0..max (exclusive).
 */
function pickRandomIndices(n: number, max: number): number[] {
  if (n >= max) return Array.from({ length: max }, (_, i) => i);
  const indices = new Set<number>();
  while (indices.size < n) indices.add(Math.floor(Math.random() * max));
  return Array.from(indices);
}

/**
 * Selects 12 questions with no duplicates and mix:
 * 40% easy, 40% medium, 20% hard.
 */
export function selectSessionQuestions(all: Question[]): Question[] {
  const byDiff = {
    easy: all.filter((q) => q.difficulty === 'easy'),
    medium: all.filter((q) => q.difficulty === 'medium'),
    hard: all.filter((q) => q.difficulty === 'hard'),
  };

  const nEasy = Math.round(QUESTIONS_PER_SESSION * EASY_RATIO);
  const nMedium = Math.round(QUESTIONS_PER_SESSION * MEDIUM_RATIO);
  const nHard = QUESTIONS_PER_SESSION - nEasy - nMedium;

  const pick = (arr: Question[], k: number) => {
    if (arr.length <= k) return [...arr];
    const indices = pickRandomIndices(k, arr.length);
    return indices.map((i) => arr[i]);
  };

  const selected = [
    ...pick(byDiff.easy, nEasy),
    ...pick(byDiff.medium, nMedium),
    ...pick(byDiff.hard, nHard),
  ];

  // Shuffle so difficulty order isn't predictable
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  return selected;
}
