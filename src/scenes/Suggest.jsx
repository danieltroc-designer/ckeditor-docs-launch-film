import React from 'react';
import { useF } from '../time';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, ink, pur, F, E, tw, kf, drift, frameAt, shadow, HL, HTOP, headRight } from '../theme';
import { Chat, Editor as Ed, Page, Ins, Del, Card, Icon, Stage3D, Cam, Cursor, Ring, cursorAt, pressAt, Words, useMeasure, Bubble, SlideBlur, slideSpeed } from '../ui';
import { T, START, DUR, P, typed, K } from '../timeline';
import { useFmt, hlStyle, headDock, dockMove, framer } from '../format';

// chat window per format [x, y, w, h]; portrait keeps page and a narrower card column side by side
const GEO = { land: [210, 70, 1500, 940], post: [20, 95, 1040, 1160], tall: [20, 380, 1040, 1160] };

export const Suggest = () => {
  const f = useF();
  const g = f + START.suggest;
  const s = T.suggest;
  const d = drift(g, 1, 4.1);
  const [ref, m] = useMeasure();
  const [href, hm] = useMeasure();
  const fm = useFmt();
  const [WX, WY, WW, WH] = GEO[fm.id];
  const BH = WH - 300; // editor body height (640 in 16:9)
  const dock = headDock(fm, hm, 3);
  const mv = dockMove(fm, dock, WX, WY, WW, WH);
  const CS = fm.portrait ? 112 : 94; // spacing between stacked suggestion cards
  const cd = Math.max(0, s.recede[0] + 0.8 * (s.recede[1] - s.recede[0]) - s.caption[0]);
  // scroll the editor body so section 3 sits at the bottom of the visible page, right above the composer
  const BS = m && m.page && m.list ? Math.min(0, m.page.y + BH - 44 - (m.list.y + m.list.h)) : 0;
  const sh = (r) => ({ ...r, y: r.y + BS, cy: r.cy + BS });

  const input = f < s.send ? typed(P.suggest, s.type, f) : '';
  const sg = s.sugg.map((a) => tw(f, a, a + 26, 0, 1, E.out));
  const st = s.sugg.map((a) => tw(f, a - 6, a + 12, 0, 1, E.inOut)); // strike lines
  const a1 = tw(f, s.accept1 + 4, s.accept1 + 26, 0, 1, E.inOut);
  const r2 = tw(f, s.reject2 + 4, s.reject2 + 26, 0, 1, E.inOut);
  const aa = tw(f, s.acceptAll + 4, s.acceptAll + 30, 0, 1, E.inOut);

  const list = [
    <>Trips under €1,000 need <Del t="approval from your direct manager before booking" p={st[0]} gone={a1} /><Ins pre=" " t="manager approval first" p={sg[0]} acc={a1} />.</>,
    <>Trips over €1,000 also need <Del t="Finance sign-off" p={st[1]} restore={r2} /><Ins pre=" " t="a director’s approval" p={sg[1] * (1 - r2)} />.</>,
    <>Submit <Del t="all of your " p={st[2]} gone={aa} />expense claims within <Del t="thirty" p={st[3]} gone={aa} /><Ins pre={aa > 0.5 ? "" : " "} t="30" p={sg[3]} acc={aa} /> days of return.</>,
  ];

  let cam = { x: 0, y: 0, z: 1 };
  let cards = null, cur = null, btn = {};
  if (m && m.list && m.side && m.composer && m.acceptall) {
    const L = sh(m.list), SD = sh(m.side);
    const tops = [];
    tops[2] = m.li2.y + BS - SD.y - 58;
    tops[1] = tops[2] - CS;
    tops[0] = tops[1] - CS;
    const top = (i) => tops[i];
    const cardOn = (i, at) => tw(f, at - 24, at - 8, 0, 1, E.out);
    cards = [
      <Card key={0} who="anna" name="Anna" ai top={top(0)} p={tw(f, s.cards[0], s.cards[0] + 30)} on={cardOn(0, s.accept1)} out={tw(f, s.accept1 + 6, s.accept1 + 24, 0, 1, E.in)} accent={f > s.accept1 - 10 ? 'ok' : null}>
        <b style={{ color: C.ink }}>Replace</b> with “manager approval first”
      </Card>,
      <Card key={1} who="anna" name="Anna" ai top={top(1)} p={tw(f, s.cards[1], s.cards[1] + 30)} on={cardOn(1, s.reject2)} out={tw(f, s.reject2 + 6, s.reject2 + 24, 0, 1, E.in)} accent={f > s.reject2 - 10 ? 'no' : null}>
        <b style={{ color: C.ink }}>Replace</b> with “a director’s approval”
      </Card>,
      <Card key={2} who="anna" name="Anna" ai top={top(2)} p={tw(f, s.cards[2], s.cards[2] + 30)} out={tw(f, s.acceptAll + 6, s.acceptAll + 24, 0, 1, E.in)}>
        <b style={{ color: C.ink }}>Tighten</b> wording, “thirty” to “30”
      </Card>,
    ];
    const bx = (i, k) => [SD.x + (k === 'ok' ? 241 : 274), SD.y + top(i) + 27];
    btn = { ok1: bx(0, 'ok'), no2: bx(1, 'no'), all: [m.acceptall.cx, m.acceptall.cy] };
    const midList = [(L.x + SD.x + SD.w) / 2, L.cy];
    const fa = framer(fm);
    const c0 = fm.portrait ? fa(midList[0], WY + WH / 2, 1.18) : frameAt((L.cx + m.composer.cx) / 2, (L.cy + m.composer.cy) / 2, 1.38);
    const c1 = fm.portrait ? fa(midList[0], midList[1] - 30, 1.27) : frameAt(midList[0], midList[1] - 50, 1.5);
    const c2 = fm.portrait ? fa(WX + WW / 2, WY + WH / 2, 1.0) : frameAt(980, 520, 1.1);
    const c3 = fm.portrait ? fa(fm.W / 2, fm.H / 2, 1) : frameAt(960, 540, 1);
    cam = kf(f, [
      [0, c0],
      [s.send + 6, c0],
      [s.send + 56, c1, E.inOut],
      [s.reject2 + 8, c1],
      [s.acceptAll - 2, c2, E.inOut],
      [s.recede[0], c2],
      [s.recede[1], c3, E.inOut],
    ]);
    const keys = [
      [s.cards[2] + 16, btn.ok1[0] - 240, btn.ok1[1] + 160],
      [s.accept1 - 4, ...btn.ok1],
      [s.accept1 + 14, btn.ok1[0] - 20, btn.ok1[1] + 30],
      [s.reject2 - 4, ...btn.no2],
      [s.reject2 + 16, btn.no2[0] - 60, btn.no2[1] + 40],
      [s.acceptAll - 4, ...btn.all],
      [s.recede[1], btn.all[0] - 80, btn.all[1] + 160],
    ];
    const [cx, cy] = cursorAt(f, keys);
    cur = { cx, cy, o: tw(f, s.cards[2] + 8, s.cards[2] + 22) * (1 - tw(f, s.recede[0], s.recede[0] + 14)), press: pressAt(f, [s.accept1, s.reject2, s.acceptAll]) };
  }
  const recede = tw(f, s.recede[0], s.recede[1], 0, 1, E.inOut);
  const grp = { x: recede * mv.x, y: recede * mv.y, s: 1 + recede * (mv.s - 1), ry: -recede * 15, rx: recede * 3 };
  const bub = tw(f, s.bubble, s.bubble + 24, 0, 1, E.out) * (1 - tw(f, s.sugg[0] - 8, s.sugg[0] + 10, 0, 1, E.in));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <SlideBlur id="sb-suggest" v={0.4 * slideSpeed(f, s.recede, dock.x - WX, K.suggest, E.inOut)}><Stage3D persp={2200}>
        <Cam x={cam.x + d.x} y={cam.y + d.y} z={cam.z * d.s}>
          <div style={{ position: 'absolute', inset: 0, transform: `translate(${grp.x}px, ${grp.y}px) scale(${grp.s}) rotateY(${grp.ry}deg) rotateX(${grp.rx}deg)`, transformOrigin: fm.portrait ? `${WX}px ${WY}px` : `${WX}px 540px`, transformStyle: 'preserve-3d' }}>
            <div ref={ref} style={{ position: 'absolute', left: 0, top: 0, width: fm.W, height: fm.H }}>
              <Chat x={WX} y={WY} w={WW} h={WH} title="Travel policy" who="anna" input={input} caret={f < s.send} f={f} send={tw(f, s.send - 4, s.send) * (1 - tw(f, s.send, s.send + 8))}>
                <Ed
                  w={'100%'}
                  hi={f > s.sugg[0] - 10 && f < s.recede[0] ? 'track' : null}
                  head={
                    <div data-m="acceptall" style={{ height: 36, padding: '0 15px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, fontWeight: 700, background: C.purple, color: '#fff', transform: `scale(${1 - pressAt(f, [s.acceptAll]) * 0.06})` }}>
                      <Icon n="check" size={17} w={2.2} /> Accept all
                    </div>
                  }
                  side={cards || <div />}
                  page={<Page o={{ list }} />}
                  bodyH={BH}
                  sideW={fm.portrait ? 260 : 300}
                  bodyScroll={BS}
                />
              </Chat>
              {cur ? <Ring x={cur.cx} y={cur.cy} f={f} at={s.accept1} /> : null}
              {cur ? <Ring x={cur.cx} y={cur.cy} f={f} at={s.reject2} /> : null}
              {cur ? <Ring x={cur.cx} y={cur.cy} f={f} at={s.acceptAll} /> : null}
              {cur ? <Cursor x={cur.cx} y={cur.cy} opacity={cur.o} press={cur.press} scale={1 / cam.z} /> : null}
            </div>
          </div>
        </Cam>
      </Stage3D></SlideBlur>
      <div ref={href} style={{ ...hlStyle(fm, 3) }}>
        <div data-m="head" style={{ display: 'inline-block' }}>
          <div><Words text="Read it." f={f} at={s.caption[0] + cd} /></div>
          <div><Words text="Accept it." f={f} at={s.caption[1] + cd} /></div>
          <div style={{ color: C.purple }}><Words text="Or don’t." f={f} at={s.caption[2] + cd} /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
