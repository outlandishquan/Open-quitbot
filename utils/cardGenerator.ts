import type { RankTier } from './scoring';

const CARD_SIZE = 1024;
const PADDING = 48;
const TITLE = 'OpenGradient IQ Board';

export interface CardOptions {
  username: string;
  scorePercentage: number;
  rank: RankTier;
  avatarImage: HTMLImageElement | null;
  useGradientFallback: boolean;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGradientFallbackAvatar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, '#8b5cf6');
  g.addColorStop(0.5, '#3b82f6');
  g.addColorStop(1, '#06b6d4');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.6)';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Simple "neural" circle accent
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawCard(canvas: HTMLCanvasElement, options: CardOptions): void {
  const {
    username,
    scorePercentage,
    rank,
    avatarImage,
    useGradientFallback,
  } = options;

  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = CARD_SIZE;
  const h = CARD_SIZE;

  // 1) Futuristic gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#0f0a1a');
  bgGrad.addColorStop(0.3, '#1e1b4b');
  bgGrad.addColorStop(0.6, '#0f172a');
  bgGrad.addColorStop(1, '#0c0a1d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Neural mesh accent (subtle grid)
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
  ctx.lineWidth = 1;
  const step = 64;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 2) Glassmorphism overlay (rounded rect)
  const glassLeft = PADDING;
  const glassTop = PADDING;
  const glassW = w - PADDING * 2;
  const glassH = h - PADDING * 2;
  ctx.save();
  drawRoundedRect(ctx, glassLeft, glassTop, glassW, glassH, 32);
  ctx.clip();
  ctx.fillStyle = 'rgba(18, 18, 26, 0.75)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 3) Glow border
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, glassLeft + 2, glassTop + 2, glassW - 4, glassH - 4, 30);
  ctx.stroke();

  const centerX = w / 2;

  // ── Layout: vertically center all content ──
  // Content block: title(36) + gap + avatar(260 diam) + gap + username(42) + gap + score(72) + gap + rank(32)
  // Total approx: 36 + 40 + 260 + 50 + 42 + 30 + 72 + 24 + 32 = ~586
  // Offset from top = (1024 - 586) / 2 ≈ 219

  const titleY = 168;
  const avatarRadius = 130;
  const avatarY = titleY + 40 + avatarRadius; // = ~328

  // 4) Title at top-center
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(TITLE, centerX, titleY);

  // 5) Profile picture (circular)
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
  ctx.clip();
  if (avatarImage && !useGradientFallback && avatarImage.complete && avatarImage.naturalWidth) {
    const scale = Math.max(avatarRadius * 2 / avatarImage.width, avatarRadius * 2 / avatarImage.height);
    const sw = avatarImage.width * scale;
    const sh = avatarImage.height * scale;
    ctx.drawImage(
      avatarImage,
      centerX - sw / 2, avatarY - sh / 2, sw, sh
    );
  } else {
    drawGradientFallbackAvatar(ctx, centerX, avatarY, avatarRadius);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.6)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 6) @username
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 42px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const usernameY = avatarY + avatarRadius + 60;
  ctx.fillText(`@${username || 'anonymous'}`, centerX, usernameY);

  // 7) Score — large and prominent
  ctx.fillStyle = '#a78bfa';
  ctx.font = 'bold 72px system-ui, sans-serif';
  const scoreY = usernameY + 80;
  ctx.fillText(`${scorePercentage}%`, centerX, scoreY);

  // 8) Rank tier
  ctx.fillStyle = '#94a3b8';
  ctx.font = '34px system-ui, sans-serif';
  const rankY = scoreY + 56;
  ctx.fillText(rank, centerX, rankY);

  // 9) Powered-by footer
  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Powered by OpenGradient', centerX, h - PADDING - 16);
}

export function exportCardAsPNG(canvas: HTMLCanvasElement): void {
  const link = document.createElement('a');
  link.download = `opengradient-iq-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function getShareUrl(canvas: HTMLCanvasElement): { url: string; text: string } {
  const url = typeof window !== 'undefined' ? window.location.origin : '';
  const text = `I just took the OpenGradient IQ Board quiz. Check out my result! ${url}`;
  return { url, text };
}
