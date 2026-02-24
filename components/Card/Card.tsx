'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  drawCard,
  exportCardAsPNG,
  getShareUrl,
  type CardOptions,
} from '@/utils/cardGenerator';
import type { ScoreResult } from '@/utils/scoring';

export interface CardProps {
  username: string;
  result: ScoreResult;
  avatarImageUrl: string | null;
  avatarFile: File | null;
  useGradientFallback: boolean;
}

export function Card({
  username,
  result,
  avatarImageUrl,
  avatarFile,
  useGradientFallback,
}: CardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [avatarImg, setAvatarImg] = useState<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (avatarFile) {
      objectUrl = URL.createObjectURL(avatarFile);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setAvatarImg(img);
        setLoaded(true);
      };
      img.onerror = () => setLoaded(true);
      img.src = objectUrl;
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }
    if (avatarImageUrl && !avatarFile) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setAvatarImg(img);
        setLoaded(true);
      };
      img.onerror = () => setLoaded(true);
      img.src = avatarImageUrl;
      return;
    }
    setLoaded(true);
    setAvatarImg(null);
  }, [avatarFile, avatarImageUrl]);

  useEffect(() => {
    if (!loaded || !canvasRef.current) return;
    const opts: CardOptions = {
      username,
      scorePercentage: result.percentage,
      rank: result.rank,
      avatarImage: avatarImg,
      useGradientFallback: useGradientFallback || !avatarImg,
    };
    drawCard(canvasRef.current, opts);
  }, [username, result, avatarImg, useGradientFallback, loaded]);

  const handleDownload = () => {
    if (canvasRef.current) exportCardAsPNG(canvasRef.current);
  };

  const handleShare = () => {
    const { url, text } = getShareUrl(canvasRef.current!);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="py-6 sm:py-10"
    >
      {/* ── Score summary ────────────────── */}
      <div className="mb-5 text-center sm:mb-7">
        <h2 className="text-xl font-extrabold theme-text sm:text-2xl">
          Your Result
        </h2>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm sm:gap-3 sm:text-base">
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
            {result.correct} correct
          </span>
          <span className="theme-text-m">·</span>
          <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500">
            {result.wrong} wrong
          </span>
          <span className="theme-text-m">·</span>
          <span className="font-bold theme-text">{result.percentage}%</span>
        </div>
        <p className="mt-2 text-sm font-bold text-og-glow sm:text-base">
          {result.rank}
        </p>
      </div>

      {/* ── Canvas card ──────────────────── */}
      <div className="mx-auto max-w-sm">
        <div
          className="rounded-2xl border p-2.5 shadow-glow-sm sm:p-4"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--card-bg)' }}
        >
          <canvas
            ref={canvasRef}
            width={1024}
            height={1024}
            className="w-full rounded-xl border"
            style={{ borderColor: 'var(--border-subtle)', height: 'auto', aspectRatio: '1 / 1' }}
          />
        </div>
      </div>

      {/* ── Actions ──────────────────────── */}
      <div className="mt-5 flex justify-center gap-3 sm:mt-6">
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-xl bg-gradient-to-r from-og-purple to-og-blue px-5 py-2.5 text-sm font-bold text-white shadow-glow-sm transition-all hover:shadow-glow hover:brightness-110 active:scale-[0.98]"
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:border-og-purple/40 theme-text-2"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--card-bg)' }}
        >
          Share to X
        </button>
      </div>
    </motion.div>
  );
}
