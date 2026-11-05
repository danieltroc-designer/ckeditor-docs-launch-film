import React from 'react';
import { useF } from '../time';
import { AbsoluteFill } from 'remotion';
import { C, F, E, tw, kf, drift } from '../theme';
import { Words, Stage3D, Cam } from '../ui';
import { T, START, DUR, rng } from '../timeline';
import { useFmt, pf } from '../format';

// "Before": no UI, just text losing things. Dark violet stage.
const BG = '#F4F4F5';
const TX = '#2B2B2E';
const GR = (a) => `rgba(43,43,46,${a})`;
const SZ = 112;

// VHS rewind look: tracking bands, scanlines, jitter, on-screen display
const VHS = ({ f, k }) => {
  const fm = useFmt();
  if (k <= 0.001) return null;
  const r = rng(Math.floor(f) + 3);
  const bands = [0, 1, 2].map((b) => ({ y: ((f * (26 + b * 9) + b * 430) % (fm.H + 220)) - 120, h: 34 + b * 22 }));
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: k }}>
      <svg width={fm.W} height={fm.H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="1.4" fill="rgba(43,43,46,0.07)" />
          </pattern>
        </defs>
        <rect width={fm.W} height={fm.H} fill="url(#scan)" />
        {bands.map((b, i) => (
          <g key={i}>
            <rect x="0" y={b.y} width={fm.W} height={b.h} fill="#fff" opacity="0.5" />
            {Array.from({ length: 26 }, (_, n) => (
              <rect key={n} x={r() * fm.W} y={b.y + r() * b.h} width={30 + r() * 220} height={1.5 + r() * 2.5} fill="rgba(43,43,46,0.3)" />
            ))}
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};


const OSD = ({ children, style, top = 64 }) => (
  <div style={{ position: 'absolute', left: 92, top, fontFamily: F.mono, fontWeight: 500, fontSize: 40, letterSpacing: '0.08em', color: '#fff', textShadow: `0 0 0 #3a3a3e, 2px 2px 0 #3a3a3e, -1px -1px 0 #3a3a3e, 2px -1px 0 #3a3a3e, -1px 2px 0 #3a3a3e`, ...style }}>{children}</div>
);

// 1. Lost formatting: every chunk keeps changing style, then everything flattens to plain grey text
const CHUNKS = ['Lost', ' ', 'for', 'mat', 'ting', '.'];
const STYLES = [
  { fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400 },
  { fontFamily: F.mono, fontWeight: 500, fontSize: '0.82em' },
  { fontFamily: F.display, fontWeight: 900, textDecoration: 'underline', textDecorationColor: GR(0.6), textDecorationThickness: 8, textUnderlineOffset: 10 },
  { fontFamily: F.serif, fontWeight: 700, fontSize: '1.12em' },
  { fontFamily: F.display, fontWeight: 800, background: GR(0.14), padding: '0 6px' },
  { fontFamily: F.display, fontWeight: 500, color: GR(0.55) },
  { fontFamily: F.serif, fontWeight: 400, textDecoration: 'line-through', textDecorationColor: GR(0.7), textDecorationThickness: 6 },
  { fontFamily: F.display, fontWeight: 700, fontSize: '0.9em', letterSpacing: '0.04em' },
];
const LostFormatting = ({ f, t }) => {
  const settled = f >= t.glitch[1];
  // style changes get slower towards the end, like it is running out of energy
  const span = t.glitch[1] - t.glitch[0];
  const q = Math.max(0, Math.min(1, (f - t.glitch[0]) / span));
  const step = Math.floor((f - t.glitch[0]) / (5 + 9 * q));
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', height: SZ * 1.15 }}>
      {CHUNKS.map((c, i) => {
        let st;
        if (f < t.glitch[0]) st = { fontFamily: F.display, fontWeight: 700 };
        else if (settled) st = { fontFamily: F.serif, fontWeight: 400, fontSize: '0.92em', color: GR(0.45) };
        else st = c === '\u00a0' ? { fontFamily: F.display } : STYLES[Math.floor(rng(i * 53 + step * 7 + 11)() * STYLES.length)];
        return <span key={i} style={{ whiteSpace: 'pre', ...st }}>{c}</span>;
      })}
    </span>
  );
};

// 2. Lost track: version names pile up next to it, plus comments nobody can answer
const FILES = ['reimbursements-v1.docx', 'reimbursements-v2.docx', 'reimbursements-v2.1.docx', 'reimbursements-v2.1A.docx', 'reimbursements-v2.1A-final.docx', 'reimbursements-v3-FINAL.docx', 'reimbursements-v23d.docx', 'reimbursements-v23d-final(2).docx'];
const Versions = ({ f, t, down = false }) => {
  const n = t.versions.filter((v) => f >= v).length;
  return (
    <div style={{ position: 'absolute', left: 0, ...(down ? { top: 0 } : { bottom: 22 }), width: 760, height: 10 }}>
      {FILES.slice(0, n).map((name, i) => {
        const age = n - 1 - i; // 0 = newest
        const p = tw(f, t.versions[i], t.versions[i] + 10, 0, 1, E.out);
        const y = down ? age * 44 - (1 - p) * 20 : -age * 44 - (1 - p) * -20;
        const o = age === 0 ? p : Math.max(0, 0.62 - age * 0.13);
        return (
          <div key={name} style={{ position: 'absolute', left: 0, top: y, fontFamily: F.mono, fontWeight: 500, fontSize: 32, color: age === 0 ? TX : GR(0.8), opacity: o, whiteSpace: 'nowrap', textDecoration: age > 0 ? 'line-through' : 'none', textDecorationColor: GR(0.5) }}>
            {name}
          </div>
        );
      })}
    </div>
  );
};
const Comment = ({ f, at, x, y, who, text }) => {
  const p = tw(f, at, at + 16, 0, 1, E.out);
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 12px 12px', borderRadius: 18, background: '#fff', color: TX, fontFamily: F.ui, fontWeight: 600, fontSize: 24, opacity: p, transform: `translateY(${(1 - p) * 16}px) scale(${0.9 + 0.1 * p})`, transformOrigin: '0 100%', whiteSpace: 'nowrap', boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 20px 40px -18px rgba(0,0,0,0.25)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 99, background: who[1], color: who[2], display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700 }}>{who[0]}</div>
      {text}
    </div>
  );
};

// 3. Lost time: the letters slowly tip over and lie flat
const LostTime = ({ f, t }) => {
  const letters = 'Lost time.'.split('');
  return (
    <span style={{ display: 'inline-block', perspective: 900 }}>
      {letters.map((c, i) => {
        const p = tw(f, t.fall[0] + i * 2.6, t.fall[0] + i * 2.6 + 34, 0, 1, E.in);
        return (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', transformOrigin: '50% 88%', transform: `rotateX(${p * 84}deg)`, opacity: 1 - p * 0.55 }}>{c}</span>
        );
      })}
    </span>
  );
};

// rewinding document lines (abstract)
const Rush = ({ f, t }) => {
  const fm = useFmt();
  const o = 1 - tw(f, t.rewind[1] - 8, t.rewind[1] + 10);
  if (o <= 0) return null;
  const r = rng(5);
  const bars = Array.from({ length: 34 }, (_, i) => ({ x: fm.portrait ? 40 + r() * (fm.W - 200) : 150 + r() * 1500, w: 120 + r() * 520, y0: r() * (fm.H + 320), v: 26 + r() * 22 }));
  return (
    <AbsoluteFill style={{ opacity: o * 0.5 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ position: 'absolute', left: b.x, top: ((b.y0 - f * b.v) % (fm.H + 320) + (fm.H + 320)) % (fm.H + 320) - 160, width: b.w, height: 14, borderRadius: 7, background: GR(i % 7 === 0 ? 0.4 : 0.18) }} />
      ))}
    </AbsoluteFill>
  );
};

export const Problem = () => {
  const f = useF();
  const g = f + START.problem;
  const t = T.problem;
  const d = drift(g, 1, 1.7);
  const fm = useFmt();
  const osdTop = pf(fm, 64, { post: 64, tall: 200 });
  const vhs = 1 - tw(f, t.rewind[1] - 10, t.rewind[1] + 8, 0, 1, E.inOut);
  const jit = vhs > 0.01 ? (rng(Math.floor(f) * 7 + 1)() - 0.5) * 26 * vhs : 0;
  const tc = Math.max(0, Math.round((1 - f / t.rewind[1]) * 254));
  const tcs = `-00:${String(Math.floor(tc / 60)).padStart(2, '0')}:${String(tc % 60).padStart(2, '0')}`;
  const line = (at) => {
    const p = tw(f, at, at + 26, 0, 1, E.out);
    return { opacity: p, transform: `translateY(${(1 - p) * 36}px)` };
  };
  const top = fm.H / 2 - (SZ * 1.15 * 3) / 2 - pf(fm, 0, { post: 90, tall: 160 });
  const left = pf(fm, 150, { post: 90, tall: 90 });
  const z = kf(f, [[0, 1.0], [DUR.problem, 1.05, E.lin]]);

  return (
    <AbsoluteFill style={{ background: BG, filter: 'grayscale(1)' }}>
      <Rush f={f} t={t} />
      <Stage3D persp={2400}>
        <Cam x={d.x + jit} y={d.y} z={z * d.s}>
          <div style={{ position: 'absolute', left, top, fontFamily: F.display, fontWeight: 700, fontSize: SZ, lineHeight: 1.15, letterSpacing: '-0.03em', color: TX, whiteSpace: 'nowrap' }}>
            <div style={{ height: SZ * 1.15, ...line(t.l1) }}><LostFormatting f={f} t={t} /></div>
            <div style={{ position: 'relative', height: SZ * 1.15, ...line(t.l2) }}>
              Lost track.
              {fm.portrait ? null : (
                <div style={{ position: 'absolute', left: 640, top: 0, height: SZ * 1.15 }}>
                  <Versions f={f} t={t} />
                </div>
              )}
            </div>
            <div style={{ height: SZ * 1.15, color: GR(0.5), ...line(t.l3) }}><LostTime f={f} t={t} /></div>
          </div>
          {fm.portrait ? (
            <div style={{ position: 'absolute', left: left + 4, top: top + SZ * 1.15 * 3 + 56, height: 10, opacity: 1 - tw(f, t.fall[0], t.fall[0] + 40) * 0.4 }}>
              <Versions f={f} t={t} down />
            </div>
          ) : null}
          <Comment f={f} at={t.comments[0]} x={pf(fm, 1330, { post: fm.W - 480, tall: fm.W - 480 })} y={pf(fm, top - 30, { post: top - 200, tall: top - 230 })} who={['T', GR(0.2), TX]} text="Who changed this?" />
          <Comment f={f} at={t.comments[1]} x={pf(fm, 1460, { post: fm.W - 250, tall: fm.W - 250 })} y={pf(fm, top + 70, { post: top - 110, tall: top - 140 })} who={['P', GR(0.55), '#fff']} text="Why?" />
        </Cam>
      </Stage3D>
      <VHS f={f} k={vhs} />
      {f < t.rewind[1] ? <OSD top={osdTop}>◀◀ REWIND <span style={{ marginLeft: 26, fontSize: 30 }}>{tcs}</span></OSD> : null}
      {f >= t.rewind[1] && f < t.rewind[1] + 40 ? <OSD top={osdTop} style={{ opacity: 1 - tw(f, t.rewind[1] + 26, t.rewind[1] + 40) }}>▶ PLAY</OSD> : null}
      <div style={{ position: 'absolute', left: 92, top: osdTop + 10, fontFamily: F.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.22em', color: GR(0.5), opacity: tw(f, t.rewind[1] + 36, t.rewind[1] + 56) }}>BEFORE</div>
    </AbsoluteFill>
  );
};
