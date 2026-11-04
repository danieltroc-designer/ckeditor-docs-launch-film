import React from 'react';
import { useF } from '../time';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { C, ink, lim, F, E, tw, drift, shadow } from '../theme';
import { Words } from '../ui';
import { T, START, DUR } from '../timeline';

const H = 92; // logo height
const LW = (131 / 25) * H; // logo width
const WORD0 = 24 / 131; // where the wordmark starts in the svg

export const LogoScene = () => {
  const f = useF();
  const fps = 60;
  const g = f + START.logo;
  const t = T.logo;
  const d = drift(g, 0.6, 7.7);
  const o0 = t.outStart;

  const sp = (at, cfg) => spring({ frame: f - at, fps, config: { damping: 18, stiffness: 120, mass: 0.9, ...cfg } });
  const icon = sp(t.icon);
  const leaf = sp(t.icon + 12, { damping: 15 });
  const word = tw(f, t.word, t.word + 40, 0, 1, E.out);
  const docs = tw(f, t.docs, t.docs + 36, 0, 1, E.out);
  const rule = tw(f, t.rule[0], t.rule[1], 0, 1, E.inOut);
  const pill = tw(f, t.pill, t.pill + 34, 0, 1, E.out);

  // out: reverse order, quicker
  const oPill = tw(f, o0, o0 + 18, 0, 1, E.in);
  const oRule = tw(f, o0 + 4, o0 + 30, 0, 1, E.inOut);
  const oDocs = tw(f, o0 + 10, o0 + 30, 0, 1, E.in);
  const oWord = tw(f, o0 + 14, o0 + 40, 0, 1, E.inOut);
  const oLeaf = tw(f, o0 + 26, o0 + 44, 0, 1, E.in);
  const oIcon = tw(f, o0 + 32, o0 + 54, 0, 1, E.in);

  const total = LW + H * 0.26 + H * 2.05;
  const left = 960 - total / 2;
  const top = 392;
  const push = 1 + tw(f, 0, DUR.logo, 0, 0.03, E.lin);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ transform: `translate(${d.x}px, ${d.y}px) scale(${push})`, transformOrigin: '960px 500px' }}>
        {/* lockup */}
        <div style={{ position: 'absolute', left, top, height: H, width: total }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: LW, height: H, transformOrigin: `${(10 / 131) * LW}px ${H / 2}px`, transform: `scale(${icon * (1 - oIcon)}) rotate(${(1 - icon) * -50 + oIcon * 40}deg)` }}>
            <Img src={staticFile('logo-purple.svg')} style={{ position: 'absolute', inset: 0, width: LW, height: H }} />
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, width: LW, height: H, opacity: Math.min(1, leaf * 2) * (1 - oLeaf), transform: `translate(${(1 - leaf) * 46 + oLeaf * 50}px, ${(1 - leaf) * 46 - oLeaf * 20}px)` }}>
            <Img src={staticFile('logo-lime.svg')} style={{ position: 'absolute', inset: 0, width: LW, height: H }} />
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, width: LW, height: H, clipPath: `inset(-10% ${Math.max(1 - word, oWord) * (1 - WORD0) * 100}% -10% ${WORD0 * 100}%)`, transform: `translateX(${(1 - word) * -30 - oWord * 20}px)` }}>
            <Img src={staticFile('logo-word.svg')} style={{ position: 'absolute', inset: 0, width: LW, height: H }} />
          </div>
          <div style={{ position: 'absolute', left: LW + H * 0.26, top: -H * 0.07, overflow: 'hidden', height: H * 1.2 }}>
            <div style={{ fontFamily: F.docs, fontWeight: 600, fontSize: H * 1.02, lineHeight: 1, color: '#0F001B', transform: `translateY(${(1 - docs) * 110 - oDocs * 110}%)` }}>Docs</div>
          </div>
        </div>
        {/* line + call to action, centred, with room to breathe */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: top + H + 78, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
          <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 46, letterSpacing: '-0.02em', color: C.ink }}>
            <Words text="Draft with AI, edit with peers." f={f} at={t.tag} stagger={4} dur={38} out={o0 - 2} />
          </div>
          <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 26, letterSpacing: '0.01em', color: ink(0.55), opacity: pill * (1 - oPill), transform: `translateY(${(1 - pill) * 16 + oPill * -12}px)` }}>
            Available directly inside ChatGPT
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
