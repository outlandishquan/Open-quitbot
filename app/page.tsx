'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { UserInput } from '@/components/UserInput/UserInput';
import { Quiz } from '@/components/Quiz/Quiz';
import { Card } from '@/components/Card/Card';
import { QuizReview } from '@/components/QuizReview/QuizReview';
import { AiInsight } from '@/components/AiInsight/AiInsight';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import questionsData from '@/data/questions.json';
import { selectSessionQuestions } from '@/utils/randomizer';
import type { Question } from '@/utils/randomizer';
import type { ScoreResult } from '@/utils/scoring';

const AVATAR_URL = (username: string) =>
  `https://unavatar.io/twitter/${encodeURIComponent(username)}`;

type Step = 'input' | 'quiz' | 'result';

export default function Home() {
  const [step, setStep] = useState<Step>('input');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const allQuestions = useMemo(() => questionsData as Question[], []);

  const handleUserSubmit = (data: { username: string; avatarFile: File | null }) => {
    setUsername(data.username);
    setAvatarFile(data.avatarFile);
    setSessionQuestions(selectSessionQuestions(allQuestions));
    setStep('quiz');
  };

  const handleQuizComplete = (res: ScoreResult, ans: number[]) => {
    setResult(res);
    setAnswers(ans);
    setStep('result');
  };

  // Build structured results for AI analysis
  const quizResults = sessionQuestions.map((q, i) => ({
    question: q.question,
    userAnswer: answers[i] >= 0 ? q.options[answers[i]] : 'Skipped',
    correctAnswer: q.options[q.correctAnswer],
    isCorrect: answers[i] === q.correctAnswer,
    category: q.category,
    difficulty: q.difficulty,
  }));

  const avatarImageUrl =
    step !== 'input' && username && !avatarFile ? AVATAR_URL(username) : null;

  return (
    <main className="min-h-screen bg-radial-glow">
      {/* ── Header ─────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md theme-header"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3 sm:py-4">
          {/* Left: Logo + Title */}
          <div className="flex flex-1 items-center gap-3 sm:gap-4">
            <div
              className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border shadow-glow-sm sm:h-11 sm:w-11 sm:rounded-xl"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <Image
                src="/logo.jpg"
                alt="OpenGradient Logo"
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-og-glow to-og-blue bg-clip-text text-lg font-extrabold leading-tight text-transparent sm:text-xl md:text-2xl">
                OpenGradient IQ Board
              </h1>
              <p className="mt-0.5 text-[11px] font-medium tracking-wide theme-text-m sm:text-xs">
                Protocol literacy · 12 questions · 5 min
              </p>
            </div>
          </div>

          {/* Right: Theme toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* ── Content ────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.section
              key="input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <UserInput onSubmit={handleUserSubmit} />
            </motion.section>
          )}

          {step === 'quiz' && sessionQuestions.length > 0 && (
            <motion.section
              key="quiz"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <Quiz questions={sessionQuestions} onComplete={handleQuizComplete} />
            </motion.section>
          )}

          {step === 'result' && result && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                username={username || 'anonymous'}
                result={result}
                avatarImageUrl={avatarImageUrl}
                avatarFile={avatarFile}
                useGradientFallback={!avatarFile && !username}
              />
              {result && (
                <AiInsight
                  username={username || 'anonymous'}
                  score={result.correct}
                  total={sessionQuestions.length}
                  percentage={result.percentage}
                  rank={result.rank}
                  results={quizResults}
                />
              )}
              <QuizReview questions={sessionQuestions} answers={answers} />
            </motion.section>
          )}
        </AnimatePresence>
      </div>

    </main>
  );
}
