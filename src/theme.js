import { Easing, interpolate } from 'remotion';

export const C = {
  bg: '#F5F2F7',
  ink: '#1C0038',
  purple: '#7F00FD',
  lime: '#B0EB1D',
  white: '#FFFFFF',
};
export const ink = (a) => `rgba(28,0,56,${a})`;
export const pur = (a) => `rgba(127,0,253,${a})`;
export const lim = (a) => `rgba(176,235,29,${a})`;

export const F = {
  display: 'Mulish',
  ui: 'Public Sans',
  mono: 'Source Code Pro',
  serif: 'Tinos',
  docs: 'Saira Semi Condensed',
};

export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-ish out
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  glide: Easing.bezier(0.45, 0, 0.2, 1),
  lin: (x) => x,
};

export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const lerp = (a, b, p) => a + (b - a) * p;

// tween 0..1 (or from..to) between frames a and b
export const tw = (f, a, b, from = 0, to = 1, ease = E.out) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

// piecewise keyframes: keys = [[frame, valueOrObject, ease?], ...]
export function kf(f, keys, ease = E.inOut) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1, e1] = keys[i + 1];
    if (f <= f1) {
      const p = (e1 || ease)(clamp01((f - f0) / (f1 - f0)));
      if (typeof v0 === 'number') return lerp(v0, v1, p);
      const o = {};
      for (const k in v0) {
        if (k === 'z') o.z = Math.exp(lerp(Math.log(v0.z), Math.log(v1.z), p));
        else o[k] = lerp(v0[k], v1[k], p);
      }
      return o;
    }
  }
  return keys[keys.length - 1][1];
}

// always-on slow drift from the global frame
export const drift = (g, amp = 1, seed = 0) => ({
  x: Math.sin(g / 173 + seed) * 6 * amp + Math.sin(g / 61 + seed * 2) * 1.5 * amp,
  y: Math.cos(g / 151 + seed) * 4 * amp,
  r: Math.sin(g / 211 + seed) * 0.35 * amp,
  s: 1 + Math.sin(g / 197 + seed) * 0.004 * amp,
});

export const shadow = (d = 1) =>
  `0 1px 2px ${ink(0.05)}, 0 ${10 * d}px ${28 * d}px ${-10 * d}px ${ink(0.12)}, 0 ${46 * d}px ${110 * d}px ${-34 * d}px ${ink(0.22)}`;

// camera framing: put scene point (cx,cy) at stage point (sx,sy) with zoom z (origin = stage centre)
export const frameAt = (cx, cy, z, sx = 960, sy = 540) => ({
  x: sx - 960 - z * (cx - 960),
  y: sy - 540 - z * (cy - 540),
  z,
});

// one headline style for every caption screen; the UI always sits GAP px after the longest line
export const HL = { position: 'absolute', left: 150, fontFamily: 'Mulish', fontWeight: 700, fontSize: 80, lineHeight: 1.15, letterSpacing: '-0.03em', color: '#1C0038', whiteSpace: 'nowrap' };
export const HTOP = { 2: 378, 3: 332 };
export const GAP = 64;
export const headRight = (m) => (m && m.head ? 150 + m.head.w + GAP : 980);
