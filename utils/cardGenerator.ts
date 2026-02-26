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
  g.addColorStop(0, '#00f0b5');
  g.addColorStop(0.5, '#00c9a7');
  g.addColorStop(1, '#f5a623');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 181, 0.5)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
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

  // 1) Warm dark gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#0f0e0c');
  bgGrad.addColorStop(0.4, '#1a1917');
  bgGrad.addColorStop(0.7, '#151412');
  bgGrad.addColorStop(1, '#0f0e0c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Dot matrix pattern
  ctx.fillStyle = 'rgba(42, 40, 36, 0.4)';
  const step = 24;
  for (let x = 12; x <= w; x += step) {
    for (let y = 12; y <= h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2) Glassmorphism overlay (rounded rect)
  const glassLeft = PADDING;
  const glassTop = PADDING;
  const glassW = w - PADDING * 2;
  const glassH = h - PADDING * 2;
  ctx.save();
  drawRoundedRect(ctx, glassLeft, glassTop, glassW, glassH, 32);
  ctx.clip();
  ctx.fillStyle = 'rgba(26, 25, 23, 0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 181, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 3) Glow border
  ctx.strokeStyle = 'rgba(0, 240, 181, 0.12)';
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
  ctx.strokeStyle = 'rgba(0, 240, 181, 0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
  ctx.stroke();

  // 6) @username
  ctx.fillStyle = '#ede8df';
  ctx.font = 'bold 42px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const usernameY = avatarY + avatarRadius + 60;
  ctx.fillText(`@${username || 'anonymous'}`, centerX, usernameY);

  // 7) Score — large and prominent
  ctx.fillStyle = '#00f0b5';
  ctx.font = 'bold 72px system-ui, sans-serif';
  const scoreY = usernameY + 80;
  ctx.fillText(`${scorePercentage}%`, centerX, scoreY);

  // 8) Rank tier
  ctx.fillStyle = '#a8a196';
  ctx.font = '34px system-ui, sans-serif';
  const rankY = scoreY + 56;
  ctx.fillText(rank, centerX, rankY);

  // 9) Powered-by footer
  ctx.fillStyle = 'rgba(168, 161, 150, 0.35)';
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
