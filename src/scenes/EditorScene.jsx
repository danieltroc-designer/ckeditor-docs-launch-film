import React from 'react';
import { useF } from '../time';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, ink, F, E, tw, kf, drift, frameAt, HL, HTOP, headRight } from '../theme';
import { Chat, Editor as Ed, Bubble, Mention, Words, Stage3D, Cam, Cursor, cursorAt, DRAFT, Page, useMeasure, SlideBlur, slideSpeed } from '../ui';
import { T, START, DUR, P, typed, K } from '../timeline';

// chat window geometry
const WX = 210, WY = 70, WW = 1500, WH = 940;
const FEED = 520; // earlier messages sit just above the composer
const sh = (r, d) => ({ ...r, y: r.y + d, cy: r.cy + d });

export const Editor = () => {
  const f = useF();
  const g = f + START.editor;
  const t = T.editor;
  const d = drift(g, 1, 2.9);
  const [ref, m] = useMeasure();
  const [href, hm] = useMeasure();
  const TL = headRight(hm);
  const cap = Math.max(t.caption, t.recede[0] + 0.8 * (t.recede[1] - t.recede[0]));

  const input = f < t.send ? typed(P.editor, t.type, f) : '';
  const bubble = tw(f, t.bubble, t.bubble + 30, 0, 1, E.out);
  const card = tw(f, t.card, t.card + 40, 0, 1, E.out);
  const reveal = t.blocks.slice(0, 5).map((a) => tw(f, a, a + 30, 0, 1, E.out));
  const recede = tw(f, t.recede[0], t.recede[1], 0, 1, E.inOut);

  // camera
  let cam = { x: 0, y: 0, z: 1 };
  let curXY = null;
  let hi = null;
  let scroll = 0;
  if (m && m.composer && m.toolbar && m.table && m.prior) {
    const SC = -(FEED + m.prior.h + 18);
    scroll = SC * tw(f, t.send + 2, t.pull[1], 0, 1, E.inOut);
    const comp = [m.composer.cx, m.composer.cy];
    const tb = sh(m.toolbar, SC);
    const tab = sh(m.table, SC);
    m.hotel = sh(m.hotel, 0);
    const c0 = frameAt(comp[0], (m.prior.y + comp[1]) / 2 + 20, 1.32, 960, 560);
    const c1 = frameAt(960, 540, 1);
    const c2 = frameAt(tb.x + 330, tb.cy + 40, 1.95, 960, 470);
    const c3 = frameAt(tab.cx, tab.cy + 70, 1.42, 960, 540);
    cam = kf(f, [
      [0, c0],
      [t.pull[0], c0],
      [t.pull[1], c1, E.inOut],
      [t.toolbar[0], c1],
      [t.toolbar[1], c2, E.inOut],
      [t.table[0], c2],
      [t.table[1], c3, E.inOut],
      [t.recede[0], c3],
      [t.recede[1], c1, E.inOut],
    ]);
    const H = (k) => [m['tb-' + k].cx + 4, m['tb-' + k].cy + 6 + SC];
    const keys = [
      [t.toolbar[0] + 10, tb.x + 560, tb.cy + 160],
      [t.hovers[0], ...H('head')],
      [t.hovers[1], ...H('image')],
      [t.hovers[2], ...H('table')],
      [t.hovers[3], ...H('list')],
      [t.table[1] - 4, m.hotel.cx + 30, m.hotel.cy + 8 + SC],
      [t.recede[1], m.hotel.cx + 60, m.hotel.cy + 120 + SC],
    ];
    curXY = cursorAt(f, keys);
    hi = f >= t.hovers[3] - 6 && f < t.table[0] ? 'list' : f >= t.hovers[2] - 6 ? (f < t.table[0] ? 'table' : null) : f >= t.hovers[1] - 6 ? 'image' : f >= t.hovers[0] - 6 ? 'head' : null;
  }
  const curO = tw(f, t.toolbar[0] + 4, t.toolbar[0] + 18) * (1 - tw(f, t.recede[0], t.recede[0] + 16));

  // window group: recedes to the right, tilting away
  const tilt = kf(f, [[0, 20], [t.send, 6, E.soft], [t.pull[1], 0, E.inOut]]);
  const grp = {
    x: recede * (TL - WX),
    y: recede * (150 - WY),
    s: 1,
    ry: -recede * 15,
    rx: recede * 3 + tilt,
  };
  const enter = tw(f, 0, 40, 0, 1, E.out);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <SlideBlur id="sb-editor" v={slideSpeed(f, t.recede, TL - WX, K.editor, E.inOut)}><Stage3D persp={2200}>
        <Cam x={cam.x + d.x} y={cam.y + d.y} z={cam.z * d.s}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translate(${grp.x}px, ${grp.y + (1 - enter) * 50}px) scale(${grp.s}) rotateY(${grp.ry}deg) rotateX(${grp.rx}deg)`,
              transformOrigin: recede > 0 ? `${WX}px 540px` : '960px 953px',
              transformStyle: 'preserve-3d',
              opacity: enter,
            }}
          >
            <div ref={ref} style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080 }}>
              <Chat x={WX} y={WY} w={WW} h={WH} title="Travel policy" who="anna" input={input} caret={f < t.send} f={f} send={tw(f, t.send - 4, t.send) * (1 - tw(f, t.send, t.send + 8))} feedY={FEED} scrollY={scroll}>
                <div data-m="prior" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <Bubble>We need a travel policy that legal can sign off by Friday.</Bubble>
                  <div style={{ fontSize: 20, lineHeight: 1.55, color: ink(0.82), maxWidth: '78%' }}>Happy to help. Do you want it as a real document your team can review together?</div>
                </div>
                <Bubble p={bubble}>
                  <Mention text={P.editor} />
                </Bubble>
                <div style={{ opacity: card, transform: `translateY(${(1 - card) * 40}px) scale(${0.985 + 0.015 * card})`, transformOrigin: '50% 0' }}>
                  <Ed w={'100%'} hi={hi} page={<Page reveal={reveal} o={{ list: DRAFT }} />} />
                </div>
              </Chat>
              {curXY ? <Cursor x={curXY[0]} y={curXY[1]} opacity={curO} scale={1 / cam.z} /> : null}
            </div>
          </div>
        </Cam>
      </Stage3D></SlideBlur>
      <div style={{ position: 'absolute', left: 92, top: 74, fontFamily: F.mono, fontWeight: 500, fontSize: 26, letterSpacing: "0.22em", color: C.purple, opacity: tw(f, 4, 24) * (1 - tw(f, 150, 180)) }}>AFTER</div>
      <div ref={href} style={{ ...HL, top: HTOP[3], transform: `translateX(${d.x * 0.3}px)` }}>
        <div data-m="head" style={{ display: 'inline-block' }}>
          <div><Words text="A full document" f={f} at={cap} stagger={5} dur={40} /></div>
          <div><Words text="editor in your" f={f} at={cap + 12} stagger={5} dur={40} /></div>
          <div style={{ color: C.purple }}><Words text="ChatGPT window." f={f} at={cap + 24} stagger={5} dur={40} /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
