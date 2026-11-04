import React from 'react';
import { useF } from '../time';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, ink, F, E, tw, kf, drift, frameAt, shadow, clamp01, HL, HTOP, headRight } from '../theme';
import { Chat, Editor as Ed, Page, Ins, Del, Hl, Card, Tag, Avatar, Bubble, Stage3D, Cam, Words, useMeasure, FINAL, SlideBlur, slideSpeed } from '../ui';
import { T, START, P, typed, K } from '../timeline';

const BIG = { x: 310, y: 70, w: 1300, h: 940 };
const SM = { tom: 30, anna: 660, priya: 1290, y: 200, w: 600, h: 720 };
const BS = -168; // editor body scroll in Anna's window
const INNER = (BIG.w - 76) * 0.88; // editor width in the big window

const Mini = () => (
  <div style={{ width: '166%', transform: 'scale(.6)', transformOrigin: '0 0' }}>
    <Ed w={'100%'} mk={null} page={<Page mk={null} />} />
  </div>
);

// who is who: a person card pinned to the top of each window
const Person = ({ who, name, role, x, y, p = 1 }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 22px 10px 10px', borderRadius: 99, background: C.white, boxShadow: `0 0 0 1px ${ink(0.07)}, ${shadow(0.9)}`, fontFamily: F.ui, opacity: p, transform: `translateY(${(1 - p) * 16}px)`, zIndex: 10 }}>
    <Avatar who={who} size={52} />
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
      <span style={{ fontWeight: 700, fontSize: 22, color: C.ink }}>{name}</span>
      <span style={{ fontWeight: 500, fontSize: 16, color: ink(0.6) }}>{role}</span>
    </div>
  </div>
);

export const Team = () => {
  const f = useF();
  const g = f + START.team;
  const t = T.team;
  const d = drift(g, 1, 5.3);
  const [ref, m] = useMeasure();
  const [href, hm] = useMeasure();
  const TL = headRight(hm);
  const cap = Math.max(t.caption, t.recede[0] + 0.8 * (t.recede[1] - t.recede[0]));

  const enter = [0, 8, 16].map((o) => tw(f, o, o + 46, 0, 1, E.out));
  const reg = tw(f, t.regroup[0], t.regroup[1], 0, 1, E.inOut);
  const land = t.land.map((a) => tw(f, a, a + 24, 0, 1, E.out));
  const strike = t.land.map((a) => tw(f, a - 4, a + 12, 0, 1, E.inOut));
  const recede = tw(f, t.recede[0], t.recede[1], 0, 1, E.inOut);

  const page = (
    <Page
      o={{
        booking: <>Book flights and hotels through the travel portal <Hl p={land[1]}>at least 14 days ahead</Hl>.</>,
        hotel: <><Del t="€180" p={strike[0]} /><Ins pre=" " t="€160" p={land[0]} /></>,
        meals: <><Del t="€60" p={strike[2]} /><Ins pre=" " t="€55" p={land[2]} /></>,
        list: [FINAL[0], FINAL[1], <><Hl p={land[3]}>Submit expense claims within 30 days of return.</Hl></>],
      }}
    />
  );

  let cards = <div />, targets = null, cam = frameAt(330, 560, 1.28);
  const camKeys = [
    [0, frameAt(SM.tom + SM.w / 2, 525, 1.3)],
    [t.look[0], frameAt(SM.tom + SM.w / 2, 525, 1.3)],
    [t.look[1], frameAt(SM.priya + SM.w / 2, 525, 1.3), E.inOut],
    [t.wide[0], frameAt(SM.priya + SM.w / 2, 525, 1.3)],
    [t.wide[1], frameAt(960, 560, 1), E.inOut],
  ];
  if (m && m.side && m.hotel && m.meals && m.booking && m.li2) {
    const SD = m.side;
    const order = [['p1', m.booking.y], ['t1', m.hotel.y], ['t2', m.meals.y], ['p2', m.li2.y]];
    const H = { p1: 96, t1: 74, t2: 74, p2: 96 };
    const tops = {};
    let bottom = -999;
    for (const [k, y] of order) {
      const top = Math.max(y - SD.y - 12, bottom + 12);
      tops[k] = top;
      bottom = top + H[k];
    }
    tops.r = bottom + 10;
    const rep = typed(P.reply, t.reply, f);
    cards = (
      <>
        <Card who="priya" name="Priya" ai comment top={tops.p1} p={land[1]}>Add an exception for urgent client travel.</Card>
        <Card who="tom" name="Tom" ai top={tops.t1} p={land[0]}><b style={{ color: C.ink }}>Replace</b> €180 with €160</Card>
        <Card who="tom" name="Tom" ai top={tops.t2} p={land[2]}><b style={{ color: C.ink }}>Replace</b> €60 with €55</Card>
        <Card who="priya" name="Priya" ai comment top={tops.p2} p={land[3]} on={tw(f, t.push[0], t.push[1]) * (1 - tw(f, t.sendR, t.sendR + 20))}>Check this against local tax rules.</Card>
        <Card who="anna" name="Anna" comment top={tops.r} left={30} p={tw(f, t.push[0] + 16, t.push[0] + 46)}>
          {rep || <span style={{ color: ink(0.35) }}>Reply…</span>}
          {f > t.push[0] + 30 && f < t.sendR + 6 ? <span style={{ display: 'inline-block', width: 2, height: 18, marginLeft: 2, verticalAlign: -3, background: C.purple, opacity: Math.floor(f / 32) % 2 ? 0.15 : 1 }} /> : null}
        </Card>
      </>
    );
    targets = {
      t1: [m.hotel.cx, m.hotel.cy + BS],
      p1: [m.booking.x + m.booking.w * 0.66, m.booking.cy + BS],
      t2: [m.meals.cx, m.meals.cy + BS],
      p2: [m.li2.x + 240, m.li2.cy + BS],
      reply: [SD.x + SD.w / 2, SD.y + tops.r + 34 + BS],
    };
    const cP = frameAt((m.booking.x + SD.x + SD.w) / 2, targets.reply[1] - 105, 1.58);
    camKeys.push([t.push[0], frameAt(960, 540, 1)], [t.push[1], cP, E.inOut], [t.sendR + 12, cP], [t.recede[1], frameAt(960, 540, 1), E.inOut]);
  }
  cam = kf(f, camKeys);
  if (f > t.look[0] && f < t.look[1]) {
    // one smooth move with a gentle pull-back in the middle, so the pan never gets fast enough to strobe
    const p = E.inOut(tw(f, t.look[0], t.look[1]));
    cam = frameAt(SM.tom + SM.w / 2 + (SM.priya - SM.tom) * p, 525, 1.3 - 0.2 * Math.sin(Math.PI * p));
  }

  // the colleagues' windows fan out a little, then fall back into depth
  const side = (who) => {
    const dir = who === 'tom' ? -1 : 1;
    const e = enter[who === 'tom' ? 0 : 2];
    return {
      opacity: e * (1 - reg * 0.3) * (1 - recede),
      transform: `translateX(${dir * reg * 150}px) translateY(${(1 - e) * 40}px) translateZ(${-reg * 700}px) rotateY(${dir * -(6 + reg * 8)}deg)`,
      transformOrigin: who === 'tom' ? `${SM.tom + SM.w}px 560px` : `${SM.priya}px 560px`,
      filter: reg > 0.01 ? `blur(${reg * 7}px)` : undefined,
    };
  };
  const tomIn = f < t.sendT ? typed(P.tom, t.tom, f) : '';
  const priIn = f < t.sendP ? typed(P.priya, t.priya, f) : '';
  const bubT = tw(f, t.sendT + 2, t.sendT + 30);
  const bubP = tw(f, t.sendP + 2, t.sendP + 30);
  const AR = {
    x: SM.anna + (BIG.x - SM.anna) * reg,
    y: SM.y + (BIG.y - SM.y) * reg,
    w: SM.w + (BIG.w - SM.w) * reg,
    h: SM.h + (BIG.h - SM.h) * reg,
  };
  const grp = { x: recede * (TL - BIG.x), y: recede * (150 - BIG.y), s: 1, ry: -recede * 15, rx: recede * 3 };

  const flies = targets
    ? [
        ['t1', 'tom', '€160', t.fly[0]],
        ['p1', 'priya', 'Comment', t.fly[1]],
        ['t2', 'tom', '€55', t.fly[2]],
        ['p2', 'priya', 'Comment', t.fly[3]],
      ].map(([k, who, label, at]) => {
        const p = clamp01((f - at) / 46);
        if (f < at || p >= 1) return null;
        const e = E.inOut(p);
        const from = who === 'tom' ? [210, 700] : [1710, 700];
        const to = targets[k];
        const x = from[0] + (to[0] - from[0]) * e;
        const y = from[1] + (to[1] - from[1]) * e - Math.sin(e * Math.PI) * 180;
        const sc = 0.55 + 0.45 * e - 0.2 * Math.max(0, (p - 0.85) / 0.15);
        return (
          <div key={k} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${sc})`, filter: `blur(${(1 - e) * 5}px)`, opacity: p > 0.88 ? 1 - (p - 0.88) / 0.12 : Math.min(1, p * 5) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px 14px 16px', borderRadius: 99, background: C.white, boxShadow: shadow(0.9), fontFamily: F.ui, fontWeight: 700, fontSize: 26, color: C.ink, whiteSpace: 'nowrap' }}>
              <Avatar who={who} size={32} />
              {label}
            </div>
          </div>
        );
      })
    : null;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <SlideBlur id="sb-team" v={slideSpeed(f, t.recede, TL - BIG.x, K.team, E.inOut)}><Stage3D persp={2200}>
        <Cam x={cam.x + d.x} y={cam.y + d.y} z={cam.z * d.s}>
          <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translate(${grp.x}px, ${grp.y}px) scale(${grp.s}) rotateY(${grp.ry}deg) rotateX(${grp.rx}deg)`, transformOrigin: `${BIG.x}px 540px` }}>
            <div style={{ position: 'absolute', inset: 0, ...side('tom') }}>
              <Chat x={SM.tom} y={SM.y} w={SM.w} h={SM.h} title="Travel policy" who="tom" input={tomIn} caret={f < t.sendT} f={f} feedY={-bubT * 80}>
                <Mini />
              </Chat>
              <div style={{ position: 'absolute', left: SM.tom + 100, width: SM.w - 130, top: SM.y + SM.h - 196, display: 'flex', flexDirection: 'column', fontFamily: F.ui, fontSize: 20, color: C.ink }}>
                <Bubble p={bubT}>{P.tom}</Bubble>
              </div>
              <Person who="tom" name="Tom" role="Finance" x={SM.tom + 30} y={SM.y - 82} p={tw(f, 10, 40)} />
            </div>
            <div style={{ position: 'absolute', inset: 0, ...side('priya') }}>
              <Chat x={SM.priya} y={SM.y} w={SM.w} h={SM.h} title="Travel policy" who="priya" input={priIn} caret={f > t.sendT && f < t.sendP} f={f} feedY={-bubP * 80}>
                <Mini />
              </Chat>
              <div style={{ position: 'absolute', left: SM.priya + 100, width: SM.w - 130, top: SM.y + SM.h - 196, display: 'flex', flexDirection: 'column', fontFamily: F.ui, fontSize: 20, color: C.ink }}>
                <Bubble p={bubP}>{P.priya}</Bubble>
              </div>
              <Person who="priya" name="Priya" role="Legal" x={SM.priya + 30} y={SM.y - 82} p={tw(f, 22, 52)} />
            </div>
            {/* Anna: one window that grows from her seat into the shared document */}
            <div style={{ position: 'absolute', inset: 0, opacity: enter[1], transform: `translateY(${(1 - enter[1]) * 40}px) translateZ(${-60 * (1 - reg)}px)` }}>
              <Person who="anna" name="Anna" role="Operations lead" x={SM.anna + 30} y={SM.y - 82} p={tw(f, 16, 46) * (1 - tw(f, t.regroup[0], t.regroup[0] + 20))} />
              <Chat x={AR.x} y={AR.y} w={AR.w} h={AR.h} title="Travel policy" who="anna" tag={reg > 0.6 ? <Tag who="anna">Anna · Owner</Tag> : null}>
                <div style={{ position: 'relative', height: 10 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: INNER, transform: `scale(${(AR.w - 76) * 0.88 / INNER})`, transformOrigin: '0 0' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: INNER, opacity: 1 - tw(f, t.regroup[0] + 10, t.regroup[0] + 40) }}>
                      <Ed w={'100%'} mk={null} page={<Page mk={null} />} />
                    </div>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: INNER, opacity: tw(f, t.regroup[0] + 10, t.regroup[0] + 40) }}>
                      <Ed w={'100%'} mk={null} side={cards} sideW={340} page={page} bodyH={640} bodyScroll={BS} />
                    </div>
                  </div>
                </div>
              </Chat>
            </div>
            {/* invisible twin at the final size, only for measuring layout */}
            <div ref={ref} style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, visibility: 'hidden' }}>
              <Chat x={BIG.x} y={BIG.y} w={BIG.w} h={BIG.h} title="Travel policy" who="anna" tag={<Tag who="anna">Anna · Owner</Tag>}>
                <Ed w={'100%'} side={<div />} sideW={340} page={page} bodyH={640} />
              </Chat>
            </div>
          </div>
          <div style={{ position: 'absolute', inset: 0 }}>{flies}</div>
        </Cam>
      </Stage3D></SlideBlur>
      <div ref={href} style={{ ...HL, top: HTOP[3] }}>
        <div data-m="head" style={{ display: 'inline-block' }}>
          <div><Words text="Your colleagues." f={f} at={cap} /></div>
          <div><Words text="Their ChatGPTs." f={f} at={cap + 22} /></div>
          <div style={{ color: C.purple }}><Words text="One document." f={f} at={cap + 44} /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
