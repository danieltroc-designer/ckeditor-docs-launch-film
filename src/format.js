// Output formats. 16:9 is the approved master and must render exactly as before: every
// format-dependent value below returns the original 16:9 number for `land`.
// The portrait formats reuse the same scenes with their own headline placement, window
// rectangles and camera framing.
import { useVideoConfig } from 'remotion';
import { HL, HTOP, GAP, headRight } from './theme.js';

export const FORMATS = {
  land: { id: 'land', label: '16x9', W: 1920, H: 1080, portrait: false },
  post: { id: 'post', label: '4x5', W: 1080, H: 1350, portrait: true },
  tall: { id: 'tall', label: '9x16', W: 1080, H: 1920, portrait: true },
};
export const fmtOf = (w, h) => (w > h ? FORMATS.land : h / w > 1.5 ? FORMATS.tall : FORMATS.post);
export const useFmt = () => {
  const { width, height } = useVideoConfig();
  return fmtOf(width, height);
};

// pick a value per format: pf(fm, landValue, { post, tall }) (portrait values default to each other)
export const pf = (fm, land, p = {}) => (fm.id === 'land' ? land : fm.id === 'tall' ? (p.tall ?? p.post) : (p.post ?? p.tall));

// headlines: 16:9 sits left and vertically centred; portrait sits at the top, clear of the
// platform UI that covers the top of 9:16 feeds
const HLP = { post: { left: 90, top: 96 }, tall: { left: 90, top: 250 } };
const LINE = 80 * 1.15;
export const hlStyle = (fm, lines) => (fm.id === 'land' ? { ...HL, top: HTOP[lines] } : { ...HL, left: HLP[fm.id].left, top: HLP[fm.id].top });

// where the app window docks on a caption screen: GAP px after the longest line (16:9)
// or GAP px below the last line (portrait)
export const headDock = (fm, m, lines) => {
  if (fm.id === 'land') return { x: headRight(m), y: 150 };
  const h = m && m.head ? m.head.h : lines * LINE;
  return { x: HLP[fm.id].left, y: HLP[fm.id].top + h + GAP };
};

// move a window group whose window rect is [WX, WY, WW, WH] into its dock. Portrait docks every
// window at the opening screen's width (1120) and grows it further if needed so it bleeds off the
// bottom; use it with transformOrigin at the window's top-left (WX, WY).
export const dockMove = (fm, dock, WX, WY, WW, WH) => ({
  x: dock.x - WX,
  y: dock.y - WY,
  s: fm.portrait ? Math.max(1120 / WW, (fm.H - dock.y + 40) / WH) : 1,
});

// camera framing in the format's own frame: put scene point (cx,cy) at frame point (sx,sy), zoom z
export const framer = (fm) => (cx, cy, z, sx = fm.W / 2, sy = fm.H / 2) => ({
  x: sx - fm.W / 2 - z * (cx - fm.W / 2),
  y: sy - fm.H / 2 - z * (cy - fm.H / 2),
  z,
});
