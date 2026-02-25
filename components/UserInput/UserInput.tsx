'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const AVATAR_URL = (username: string) =>
  `https://unavatar.io/twitter/${encodeURIComponent(username)}`;

export interface UserInputProps {
  onSubmit: (data: { username: string; avatarFile: File | null }) => void;
  initialUsername?: string;
}

export function UserInput({ onSubmit, initialUsername = '' }: UserInputProps) {
  const [username, setUsername] = useState(initialUsername);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [touched, setTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanUsername = username.replace(/^@/, '').trim();
  const isValidHandle = /^[A-Za-z0-9_]{1,15}$/.test(cleanUsername);
  const showError = touched && !isValidHandle;
  const avatarFromTwitter = cleanUsername && !useFallback && !avatarFile
    ? AVATAR_URL(cleanUsername)
    : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setUseFallback(false);
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidHandle) return;
    onSubmit({ username: cleanUsername, avatarFile });
  };

  const clearAvatar = useCallback(() => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setUseFallback(false);
  }, [avatarPreview]);

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-start justify-center pt-8 sm:items-center sm:pt-0">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-2xl border p-5 shadow-glow-sm backdrop-blur-sm sm:p-8"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'var(--card-bg)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide sm:text-sm sm:tracking-normal sm:normal-case sm:font-medium theme-text-2"
              >
                X (Twitter) username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="@yourhandle"
                required
                className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 sm:text-base ${showError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                    : 'focus:border-og-purple focus:ring-og-purple/30'
                  }`}
                style={{
                  borderColor: showError ? undefined : 'var(--border-primary)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                }}
              />
              {showError && (
                <p className="mt-1.5 text-xs text-red-400">
                  {cleanUsername.length === 0
                    ? 'Please enter your X (Twitter) handle to continue.'
                    : 'Invalid handle — use 1-15 characters (letters, numbers, underscores).'}
                </p>
              )}
            </div>

            {/* Avatar */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide sm:text-sm sm:tracking-normal sm:normal-case sm:font-medium theme-text-2">
                Profile picture
              </label>
              <p className="mb-3 text-[11px] leading-relaxed theme-text-3 sm:text-xs">
                Optional — we&apos;ll pull your X avatar, or you can upload one.
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 sm:h-20 sm:w-20"
                  style={{ borderColor: 'var(--border-primary)', background: 'var(--input-bg)' }}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Upload preview"
                      className="h-full w-full object-cover"
                    />
                  ) : avatarFromTwitter && !useFallback ? (
                    <Image
                      src={avatarFromTwitter}
                      alt="X avatar"
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                      unoptimized
                      onError={() => setUseFallback(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-og-purple/20 to-og-blue/20 text-xl text-og-glow/40">
                      ?
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:border-og-purple/50 sm:text-sm"
                    style={{
                      borderColor: 'var(--border-primary)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Upload image
                  </button>
                  {(avatarPreview || avatarFromTwitter) && (
                    <button
                      type="button"
                      onClick={clearAvatar}
                      className="rounded-lg border px-3 py-1.5 text-xs transition hover:opacity-80 sm:text-sm theme-text-3"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={touched && !isValidHandle}
              className={`w-full rounded-xl py-3 text-sm font-bold text-white shadow-glow-sm transition-all active:scale-[0.98] sm:text-base ${touched && !isValidHandle
                  ? 'cursor-not-allowed bg-gray-600 opacity-50'
                  : 'bg-gradient-to-r from-og-purple to-og-blue hover:shadow-glow hover:brightness-110'
                }`}
            >
              Start quiz
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
