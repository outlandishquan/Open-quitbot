'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '@/utils/randomizer';
import { calculateScore, type ScoreResult } from '@/utils/scoring';

const TOTAL_SECONDS = 5 * 60; // 5 minutes

export interface QuizProps {
  questions: Question[];
  onComplete: (result: ScoreResult, answers: number[]) => void;
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const submitQuiz = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    const correct = answers.reduce((acc, choice, i) => {
      return acc + (choice === questions[i].correctAnswer ? 1 : 0);
    }, 0);
    const result = calculateScore(questions.length, correct);
    onComplete(result, answers);
  }, [answers, questions, onComplete, submitted]);

  useEffect(() => {
    if (submitted) return;
    if (secondsLeft <= 0) {
      submitQuiz();
      return;
    }
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, submitted, submitQuiz]);

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion) return null;

  return (
    <div className="py-5 sm:py-8">
      {/* ── Progress + Timer ────────────── */}
      <div className="mb-5 flex items-center gap-4 sm:mb-6">
        <div className="min-w-0 flex-1">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full sm:h-2"
            style={{ background: 'var(--border-primary)' }}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-og-purple to-og-blue"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-1.5 text-[11px] font-medium theme-text-m sm:text-xs">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div
          className={`shrink-0 rounded-lg border px-3 py-1.5 font-mono text-xs font-bold tabular-nums sm:rounded-xl sm:px-4 sm:py-2 sm:text-base ${secondsLeft <= 60
              ? 'border-red-500/40 bg-red-500/10 text-red-400'
              : 'text-og-glow'
            }`}
          style={
            secondsLeft > 60
              ? { borderColor: 'var(--border-primary)', background: 'var(--card-bg)' }
              : undefined
          }
        >
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* ── Question card ──────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="rounded-2xl border p-5 shadow-glow-sm backdrop-blur-sm sm:p-7"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--card-bg)' }}
        >
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-og-glow/60 sm:text-xs">
            {currentQuestion.category} · {currentQuestion.difficulty}
          </p>
          <h2 className="mb-5 text-base font-semibold leading-relaxed theme-text sm:mb-7 sm:text-lg">
            {currentQuestion.question}
          </h2>

          <ul className="space-y-2.5 sm:space-y-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const selected = answers[currentIndex] === optionIndex;
              return (
                <motion.li
                  key={optionIndex}
                  whileHover={{ scale: 1.008 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(optionIndex)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm sm:px-5 sm:py-3.5 ${selected
                        ? 'border-og-purple/70 bg-og-purple/15 shadow-[inset_0_0_20px_rgba(139,92,246,0.08)]'
                        : 'hover:border-og-purple/30'
                      }`}
                    style={
                      selected
                        ? { color: 'var(--text-primary)' }
                        : {
                          borderColor: 'var(--border-subtle)',
                          background: 'var(--input-bg)',
                          color: 'var(--text-secondary)',
                        }
                    }
                  >
                    <span className={`mt-px shrink-0 font-bold ${selected ? 'text-og-glow' : 'theme-text-m'}`}>
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    <span>{option}</span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ─────────────────── */}
      <div className="mt-5 flex items-center justify-between sm:mt-7">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-xl border px-4 py-2 text-xs font-semibold transition hover:border-og-purple/40 disabled:pointer-events-none disabled:opacity-30 sm:px-5 sm:py-2.5 sm:text-sm theme-text-2"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--card-bg)' }}
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl bg-gradient-to-r from-og-purple to-og-blue px-5 py-2 text-xs font-bold text-white shadow-glow-sm transition-all hover:shadow-glow hover:brightness-110 active:scale-[0.98] sm:px-6 sm:py-2.5 sm:text-sm"
        >
          {currentIndex < questions.length - 1 ? 'Next →' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
