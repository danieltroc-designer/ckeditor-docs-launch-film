import React from 'react';
import { useF } from '../time';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, ink, pur, lim, F, E, tw, kf, drift, frameAt, shadow, clamp01, lerp, HL, HTOP, headRight } from '../theme';
import { Chat, Editor as Ed, Page, Ins, Del, Card, Icon, Logo, Stage3D, Cam, Cursor, Ring, cursorAt, pressAt, Words, useMeasure, Toolbar, SlideBlur, slideSpeed } from '../ui';
import { T, START, DUR, K } from '../timeline';

const WX = 210, WY = 70, WW = 1500, WH = 940;
const APP = { x: 110, y: 60, w: 1700, h: 960 };
const ROWS = [['Today, 16:40', 'Anna', 'Accepted 4 suggestions'], ['Today, 15:12', 'Tom', '2 AI-generated suggestions'], ['Today, 14:55', 'Priya', '2 AI-generated comments'], ['Today, 11:02', 'Anna', 'Drafted the policy with AI']];

const WebApp = ({ f, t, menuP, toastP }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: APP.w, height: APP.h, background: C.bg, borderRadius: 26, overflow: 'hidden', boxShadow: `0 0 0 1px ${ink(0.08)}, ${shadow(1.2)}`, fontFamily: F.ui, color: C.ink }}>
    <div style={{ height: 76, background: C.white, display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px', borderBottom: `1px solid ${ink(0.07)}` }}>
      <Logo h={24} />
      <div style={{ width: 1, height: 24, background: ink(0.12) }} />
      <div style={{ flex: 1, fontSize: 19, color: ink(0.62) }}>Travel policy 2027</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 18px', borderRadius: 12, boxShadow: `0 0 0 1px ${ink(0.14)}`, fontWeight: 600, fontSize: 17 }}>
        <Icon n="share" size={19} /> Share
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', borderRadius: 12, background: C.purple, color: '#fff', fontWeight: 700, fontSize: 17, transform: `scale(${1 - pressAt(f, [t.exportBtn]) * 0.06})` }}>
        Export <Icon n="chevron" size={18} w={2} />
      </div>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 76, right: 0, height: 48, background: C.white, borderBottom: `1px solid ${ink(0.07)}` }}>
      <Toolbar />
    </div>
    <div style={{ position: 'absolute', left: 48, top: 170, width: 260, fontSize: 16, lineHeight: 2.1, color: ink(0.6) }}>
      <div style={{ color: C.ink, fontWeight: 600 }}>Travel policy 2027</div>
      <div style={{ paddingLeft: 14 }}>Summary</div>
      <div style={{ paddingLeft: 14 }}>1. Booking</div>
      <div style={{ paddingLeft: 14, color: C.purple }}>2. Reimbursement</div>
      <div style={{ paddingLeft: 14 }}>3. Approvals</div>
    </div>
    <div style={{ position: 'absolute', left: 400, top: 160, width: 900, height: 900, background: C.white, borderRadius: 10, boxShadow: `0 0 0 1px ${ink(0.07)}, 0 24px 60px -30px ${ink(0.3)}`, padding: '60px 72px', boxSizing: 'border-box' }}>
      <Page mk={null} o={{ hotel: '€160', meals: '€55' }} />
    </div>
    {/* export menu */}
    <div style={{ position: 'absolute', right: 30, top: 84, width: 270, background: C.white, borderRadius: 16, padding: 8, boxShadow: `0 0 0 1px ${ink(0.08)}, ${shadow(0.8)}`, opacity: menuP, transform: `translateY(${(1 - menuP) * -8}px) scale(${0.97 + 0.03 * menuP})`, transformOrigin: '100% 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', borderRadius: 10, background: f > t.word - 16 ? pur(0.08) : 'transparent', fontSize: 18, fontWeight: 600 }}>
        <Icon n="doc" size={21} /> Word (.docx)
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', fontSize: 18, fontWeight: 600, color: ink(0.7) }}>
        <Icon n="doc" size={21} /> PDF
      </div>
    </div>
    {/* toast */}
    <div style={{ position: 'absolute', left: '50%', bottom: 44, transform: `translate(-50%, ${(1 - toastP) * 30}px)`, opacity: toastP, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 26px 16px 18px', borderRadius: 99, background: C.ink, color: '#fff', fontWeight: 600, fontSize: 19 }}>
      <div style={{ width: 28, height: 28, borderRadius: 99, background: C.lime, color: C.ink, display: 'grid', placeItems: 'center' }}>
        <Icon n="check" size={17} w={2.4} />
      </div>
      Travel policy 2027.docx is ready
    </div>
  </div>
);

export const Export = () => {
  const f = useF();
  const g = f + START.export;
  const t = T.export;
  const d = drift(g, 1, 6.2);
  const [ref, m] = useMeasure();
  const [href, hm] = useMeasure();
  const TL = headRight(hm);
  const cd = Math.max(0, t.recede[0] + 0.8 * (t.recede[1] - t.recede[0]) - t.words[0]);

  const aa = tw(f, t.acceptAll + 4, t.acceptAll + 28, 0, 1, E.inOut);
  const histP = tw(f, t.hist + 2, t.hist + 26, 0, 1, E.out);
  const scrub = kf(f, [[t.scrub[0], 0], [t.scrub[0] + 22, 3, E.inOut], [t.scrub[1], 0, E.inOut]]);
  const grow = tw(f, t.grow[0], t.grow[1], 0, 1, E.inOut);
  const menuP = tw(f, t.exportBtn + 2, t.exportBtn + 14, 0, 1, E.out) * (1 - tw(f, t.word + 4, t.word + 14));
  const toastP = tw(f, t.toast, t.toast + 26, 0, 1, E.out);
  const recede = tw(f, t.recede[0], t.recede[1], 0, 1, E.inOut);

  const page = <Page o={{ hotel: <><Del t="€180" gone={aa} /><Ins pre={aa > 0.9 ? '' : ' '} t="€160" acc={aa} /></>, meals: <><Del t="€60" gone={aa} /><Ins pre={aa > 0.9 ? '' : ' '} t="€55" acc={aa} /></> }} />;

  let cur = null, ed = null;
  if (m && m.acceptall && m['tb-history'] && m.expand && m.page) {
    ed = m.page; // editor body rect, for the hand-off into the web app
    const A = [m.acceptall.cx, m.acceptall.cy], Hs = [m['tb-history'].cx, m['tb-history'].cy], X = [m.expand.cx, m.expand.cy];
    const ex = [APP.x + APP.w - 92, APP.y + 38], wd = [APP.x + APP.w - 190, APP.y + 84 + 8 + 26];
    const keys = [
      [0, A[0] - 160, A[1] + 220],
      [t.acceptAll - 4, ...A],
      [t.hist - 4, ...Hs],
      [t.expand - 4, ...X],
      [t.grow[1] + 4, X[0] - 30, X[1] + 40],
      [t.exportBtn - 4, ...ex],
      [t.word - 4, ...wd],
      [t.recede[0] + 10, wd[0] - 60, wd[1] + 140],
    ];
    const [cx, cy] = cursorAt(f, keys);
    cur = { cx, cy, press: pressAt(f, [t.acceptAll, t.hist, t.expand, t.exportBtn, t.word]) };
  }
  // camera: on the editor header first, then whole
  const cam = kf(f, [[0, frameAt(1130, 420, 1.24)], [t.hist + 10, frameAt(1150, 430, 1.24)], [t.expand + 4, frameAt(1150, 430, 1.24)], [t.grow[1], frameAt(960, 535, 1.06)], [t.recede[0], frameAt(960, 540, 1.09)], [t.recede[1], frameAt(960, 540, 1)]]);

  // chat fades as the web app takes over; app grows from the chat window rect
  const appRect = {
    x: lerp(WX, APP.x, grow),
    y: lerp(WY, APP.y, grow),
    s: lerp(WW / APP.w, 1, grow),
  };
  const grp = { x: recede * (TL - APP.x), y: recede * (150 - APP.y), s: 1, ry: -recede * 15, rx: recede * 3 };

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <SlideBlur id="sb-export" v={slideSpeed(f, t.recede, TL - APP.x, K.export, E.inOut)}><Stage3D persp={2200}>
        <Cam x={cam.x + d.x} y={cam.y + d.y} z={cam.z * d.s}>
          <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translate(${grp.x}px, ${grp.y}px) scale(${grp.s}) rotateY(${grp.ry}deg) rotateX(${grp.rx}deg)`, transformOrigin: `${APP.x}px 540px` }}>
            <div ref={ref} style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: 1 - tw(f, t.grow[0] + 6, t.grow[0] + 26) }}>
              <Chat x={WX} y={WY} w={WW} h={WH} title="Travel policy" who="anna">
                <div style={{ position: 'relative' }}>
                  <Ed
                    w={'100%'}
                    hi={f > t.hist - 8 ? 'history' : null}
                    head={
                      <div data-m="acceptall" style={{ height: 36, padding: '0 15px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 700, background: C.purple, color: '#fff', opacity: 1 - aa * 0.5 }}>
                        <Icon n="check" size={17} w={2.2} /> Accept all
                      </div>
                    }
                    side={
                      <>
                        <Card who="tom" name="Tom" ai top={m && m.hotel ? m.hotel.y - m.side.y - 14 : 250} p={1} out={aa}><b style={{ color: C.ink }}>Replace</b> €180 with €160</Card>
                        <Card who="tom" name="Tom" ai top={m && m.hotel ? m.hotel.y - m.side.y + 72 : 340} p={1} out={aa}><b style={{ color: C.ink }}>Replace</b> €60 with €55</Card>
                      </>
                    }
                    page={page}
                  />
                  {/* revision history panel */}
                  <div style={{ position: 'absolute', right: 0, top: 104, bottom: 0, width: 380, background: C.white, borderLeft: `1px solid ${ink(0.08)}`, padding: '22px 20px', boxSizing: 'border-box', opacity: histP, transform: `translateX(${(1 - histP) * 40}px)`, fontFamily: F.ui }}>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 14, color: C.ink }}>Revision history</div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 0, right: 0, top: scrub * 76, height: 70, borderRadius: 12, background: pur(0.08), boxShadow: `inset 0 0 0 1px ${pur(0.25)}` }} />
                      {ROWS.map((r, i) => (
                        <div key={i} style={{ position: 'relative', height: 76, padding: '12px 14px', boxSizing: 'border-box', fontSize: 15, lineHeight: 1.4, color: ink(0.7) }}>
                          <div style={{ fontWeight: 700, color: C.ink }}>{r[0]} · {r[1]}</div>
                          {r[2]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Chat>
            </div>
            {grow > 0 ? (
              <div style={{ position: 'absolute', left: appRect.x, top: appRect.y, transform: `scale(${appRect.s})`, transformOrigin: '0 0', opacity: tw(f, t.grow[0], t.grow[0] + 16) }}>
                <WebApp f={f} t={t} menuP={menuP} toastP={toastP} />
              </div>
            ) : null}
            {cur ? <Ring x={cur.cx} y={cur.cy} f={f} at={t.acceptAll} /> : null}
            {cur ? <Ring x={cur.cx} y={cur.cy} f={f} at={t.hist} /> : null}
            {cur ? <Ring x={cur.cx} y={cur.cy} f={f} at={t.expand} /> : null}
            {cur ? <Ring x={cur.cx} y={cur.cy} f={f} at={t.exportBtn} /> : null}
            {cur ? <Ring x={cur.cx} y={cur.cy} f={f} at={t.word} /> : null}
            {cur ? <Cursor x={cur.cx} y={cur.cy} press={cur.press} scale={1 / cam.z} opacity={1 - tw(f, t.recede[0], t.recede[0] + 14)} /> : null}
          </div>
        </Cam>
      </Stage3D></SlideBlur>
      <div ref={href} style={{ ...HL, top: HTOP[3] }}>
        <div data-m="head" style={{ display: 'inline-block' }}>
          <div><Words text="Reviewed." f={f} at={t.words[0] + cd} /></div>
          <div><Words text="Approved." f={f} at={t.words[1] + cd} /></div>
          <div style={{ color: C.purple }}><Words text="Exported." f={f} at={t.words[2] + cd} /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
