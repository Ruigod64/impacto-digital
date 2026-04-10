/**
 * favicon.js
 * - initFavicon:      renders the favicon as a squircle via canvas
 * - initSquircleClip: applies a CSS clip-path squircle to any element
 */

// ---- Shared squircle geometry ---- //

/**
 * Returns a CSS `clip-path: polygon(...)` string that traces
 * a superellipse (squircle) centered at 50% 50%.
 * @param {number} n      — superellipse exponent (4 = squircle)
 * @param {number} steps  — polygon point count (higher = smoother)
 */
function squirclePolygon(n = 4, steps = 72) {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const t   = (i / steps) * Math.PI * 2;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    const x   = 50 + 50 * Math.sign(cos) * Math.pow(Math.abs(cos), 2 / n);
    const y   = 50 + 50 * Math.sign(sin) * Math.pow(Math.abs(sin), 2 / n);
    points.push(`${x.toFixed(3)}% ${y.toFixed(3)}%`);
  }
  return `polygon(${points.join(', ')})`;
}

// ---- Favicon ---- //

export function initFavicon() {
  const link = document.getElementById('favicon');
  if (!link) return;

  const img = new Image();
  img.src = link.href;

  img.onload = function () {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Squircle clip on canvas (n=4)
    const cx = size / 2, cy = size / 2, r = size / 2, n = 4, steps = 128;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t   = (i / steps) * Math.PI * 2;
      const cos = Math.cos(t);
      const sin = Math.sin(t);
      const x   = cx + r * Math.sign(cos) * Math.pow(Math.abs(cos), 2 / n);
      const y   = cy + r * Math.sign(sin) * Math.pow(Math.abs(sin), 2 / n);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, 0, 0, size, size);
    link.href = canvas.toDataURL('image/png');
  };
}

// ---- Squircle clip-path for DOM elements ---- //

/**
 * Applies a squircle clip-path to a DOM element via CSS.
 * @param {string} selector — CSS selector of the target element
 */
export function initSquircleClip(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.style.clipPath = squirclePolygon(4, 72);
}
