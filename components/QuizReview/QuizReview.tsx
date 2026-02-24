'use client';

import { motion } from 'framer-motion';
import type { Question } from '@/utils/randomizer';

export interface QuizReviewProps {
  questions: Question[];
  answers: number[];
}

export function QuizReview({ questions, answers }: QuizReviewProps) {
  const correctCount = answers.filter(
    (a, i) => a === questions[i].correctAnswer
  ).length;

  return (
    <div className="pb-4 sm:pb-8">
      {/* ── Section divider ─────────────── */}
      <div className="mb-6 flex items-center gap-4 sm:mb-8">
        <div
          className="h-px flex-1"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--border-primary), transparent)',
          }}
        />
        <h3 className="shrink-0 text-xs font-bold uppercase tracking-[0.2em] theme-text-m sm:text-sm">
          Question Review
        </h3>
        <div
          className="h-px flex-1"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--border-primary), transparent)',
          }}
        />
      </div>

      {/* ── Summary pills ──────────────── */}
      <div className="mb-5 flex justify-center gap-2 text-xs sm:mb-6 sm:text-sm">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-bold text-emerald-500">
          {correctCount} Correct
        </span>
        <span className="rounded-full bg-red-500/10 px-3 py-1 font-bold text-red-500">
          {questions.length - correctCount} Wrong
        </span>
      </div>

      {/* ── Questions list ─────────────── */}
      <div className="space-y-3 sm:space-y-4">
        {questions.map((q, qIndex) => {
          const userAnswer = answers[qIndex];
          const isCorrect = userAnswer === q.correctAnswer;
          const wasSkipped = userAnswer === -1;

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.04, duration: 0.25 }}
              className={`rounded-xl border p-4 sm:rounded-2xl sm:p-5 ${isCorrect
                  ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                  : 'border-red-500/30 bg-red-500/[0.04]'
                }`}
            >
              {/* Header */}
              <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] theme-text-m sm:text-xs">
                  Q{qIndex + 1} · {q.category} · {q.difficulty}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-xs ${isCorrect
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-red-500/15 text-red-500'
                    }`}
                >
                  {isCorrect ? '✓ Correct' : wasSkipped ? '— Skipped' : '✗ Wrong'}
                </span>
              </div>

              {/* Question */}
              <p className="mb-3 text-sm font-semibold leading-relaxed theme-text sm:mb-4">
                {q.question}
              </p>

              {/* Options */}
              <ul className="space-y-1.5 sm:space-y-2">
                {q.options.map((option, optIdx) => {
                  const isThisCorrect = optIdx === q.correctAnswer;
                  const isThisUserPick = optIdx === userAnswer;

                  let borderColor = 'var(--border-subtle)';
                  let bg = 'var(--input-bg)';
                  let textColor = 'var(--text-tertiary)';
                  let extraClass = '';

                  if (isThisCorrect) {
                    borderColor = 'rgba(16,185,129,0.4)';
                    bg = 'rgba(16,185,129,0.08)';
                    textColor = 'rgb(16,185,129)';
                  } else if (isThisUserPick && !isCorrect) {
                    borderColor = 'rgba(239,68,68,0.4)';
                    bg = 'rgba(239,68,68,0.08)';
                    textColor = 'rgb(239,68,68)';
                    extraClass = 'line-through decoration-red-500/30';
                  }

                  return (
                    <li
                      key={optIdx}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm ${extraClass}`}
                      style={{ borderColor, background: bg, color: textColor }}
                    >
                      <span className="shrink-0 font-bold opacity-60">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{option}</span>
                      {isThisCorrect && (
                        <span className="shrink-0 text-[10px] font-bold text-emerald-500 sm:text-xs">
                          ✓
                        </span>
                      )}
                      {isThisUserPick && !isCorrect && (
                        <span className="shrink-0 text-[10px] font-bold text-red-500 sm:text-xs">
                          Your pick
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
