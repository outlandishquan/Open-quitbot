'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AiInsightProps {
    username: string;
    score: number;
    total: number;
    percentage: number;
    rank: string;
    results: Array<{
        question: string;
        userAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        category: string;
        difficulty: string;
    }>;
}

interface AnalysisData {
    analysis: string;
    transactionHash: string | null;
    verified: boolean;
    model: string;
}

export function AiInsight({
    username,
    score,
    total,
    percentage,
    rank,
    results,
}: AiInsightProps) {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchAnalysis() {
            try {
                const res = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, score, total, percentage, rank, results }),
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json: AnalysisData = await res.json();
                if (!cancelled) setData(json);
            } catch (e: any) {
                if (!cancelled) setError(e.message || 'Failed to get AI analysis');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchAnalysis();
        return () => { cancelled = true; };
    }, [username, score, total, percentage, rank, results]);

    return (
        <div className="mt-6 sm:mt-8">
            {/* ── Section divider ─────────────────── */}
            <div className="mb-5 flex items-center gap-4 sm:mb-6">
                <div
                    className="h-px flex-1"
                    style={{
                        background: 'linear-gradient(to right, transparent, var(--border-primary), transparent)',
                    }}
                />
                <div className="flex shrink-0 items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-og-purple">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] theme-text-m sm:text-sm">
                        AI Analysis
                    </h3>
                </div>
                <div
                    className="h-px flex-1"
                    style={{
                        background: 'linear-gradient(to right, transparent, var(--border-primary), transparent)',
                    }}
                />
            </div>

            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl border p-5 sm:p-7"
                        style={{ borderColor: 'var(--border-subtle)', background: 'var(--card-bg)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative h-5 w-5">
                                <div className="absolute inset-0 animate-spin rounded-full border-2 border-og-purple/30 border-t-og-purple" />
                            </div>
                            <p className="text-sm font-medium theme-text-2">
                                Generating TEE-verified analysis...
                            </p>
                        </div>
                        <div className="mt-4 space-y-2.5">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-3 animate-pulse rounded-full"
                                    style={{
                                        background: 'var(--border-primary)',
                                        width: `${85 - i * 15}%`,
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {error && !loading && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-red-500/30 bg-red-500/[0.05] p-5 sm:p-7"
                    >
                        <p className="text-sm text-red-400">
                            ⚠ Could not connect to the AI backend. Make sure the Python server is running on
                            port 8000.
                        </p>
                        <p className="mt-2 text-xs theme-text-m">
                            Run: <code className="rounded bg-red-500/10 px-1.5 py-0.5 text-red-400">cd backend && python server.py</code>
                        </p>
                    </motion.div>
                )}

                {data && !loading && (
                    <motion.div
                        key="analysis"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-2xl border p-5 sm:p-7"
                        style={{ borderColor: 'var(--border-subtle)', background: 'var(--card-bg)' }}
                    >
                        {/* Verification badge — only show when TEE verified */}
                        {data.verified && (
                            <div className="mb-4">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-500 sm:text-xs">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    TEE Verified
                                </span>
                            </div>
                        )}

                        {/* AI Analysis content — render markdown-like text */}
                        <div
                            className="prose-sm max-w-none text-sm leading-relaxed theme-text-2"
                            style={{ lineHeight: '1.7' }}
                        >
                            {data.analysis.split('\n').map((line, i) => {
                                if (!line.trim()) return <br key={i} />;

                                // Headers
                                if (line.startsWith('### '))
                                    return (
                                        <h4 key={i} className="mt-4 mb-2 text-sm font-bold theme-text">
                                            {line.replace('### ', '')}
                                        </h4>
                                    );
                                if (line.startsWith('## '))
                                    return (
                                        <h3 key={i} className="mt-4 mb-2 text-base font-bold theme-text">
                                            {line.replace('## ', '')}
                                        </h3>
                                    );

                                // Horizontal rule
                                if (line.trim() === '---') return <hr key={i} className="my-3 border-none" style={{ borderTop: '1px solid var(--border-primary)' }} />;

                                // List items
                                if (line.trim().startsWith('- '))
                                    return (
                                        <p key={i} className="ml-3 flex gap-2">
                                            <span className="text-og-purple">•</span>
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: line
                                                        .trim()
                                                        .slice(2)
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>'),
                                                }}
                                            />
                                        </p>
                                    );

                                // Numbered list items
                                if (/^\d+\.\s/.test(line.trim()))
                                    return (
                                        <p key={i} className="ml-3"
                                            dangerouslySetInnerHTML={{
                                                __html: line
                                                    .trim()
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>'),
                                            }}
                                        />
                                    );

                                // Regular paragraph
                                return (
                                    <p key={i}
                                        dangerouslySetInnerHTML={{
                                            __html: line
                                                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
                                                .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* Transaction hash */}
                        {data.transactionHash && (
                            <div
                                className="mt-5 rounded-xl border p-3 sm:p-4"
                                style={{ borderColor: 'var(--border-subtle)', background: 'var(--input-bg)' }}
                            >
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-og-glow/60 sm:text-xs">
                                    On-chain verification
                                </p>
                                <p className="break-all font-mono text-[11px] theme-text-3 sm:text-xs">
                                    Tx: {data.transactionHash}
                                </p>
                            </div>
                        )}

                        {/* Powered by badge */}
                        <div className="mt-4 flex items-center justify-end gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-og-purple">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                            <span className="text-[10px] font-medium theme-text-m sm:text-xs">
                                Powered by OpenGradient
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
