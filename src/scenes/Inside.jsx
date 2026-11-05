import React from 'react';
import { useF } from '../time';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, ink, F, E, tw, kf, drift, shadow, lim, HL, HTOP, headRight } from '../theme';
import { Chat, Editor, Page, Ins, Del, FINAL, Words, Bubble, Mention, Stage3D, Cam, Card, useMeasure } from '../ui';
import { T, START, DUR } from '../timeline';
import { useFmt, pf, hlStyle, headDock } from '../format';

export const Inside = () => {
  const f = useF();
  const g = f + START.inside;
  const t = T.inside;
  const S = t.sugg.map((a) => tw(f, a, a + 26, 0, 1, E.out));
  const d = drift(g, 1, 0.4);
  const [href, hm] = useMeasure();
  const fm = useFmt();
  const TL = headRight(hm) + 24; // window settles ~24px left of here
  const dock = headDock(fm, hm, 2); // portrait: the window sits below the headline

  const page = (
    <Page
      o={{
        summary: (
          <>
            This policy covers <Del t="every business trip" p={S[0]} /><Ins pre=" " t="all work travel" p={S[1]} />, from booking to reimbursement, for all Fernhill Labs staff.
          </>
        ),
        booking: (
          <>
            Book flights and hotels through the travel portal at least <Del t="14" p={S[2]} /><Ins pre=" " t="21" p={S[3]} /> days ahead.
          </>
        ),
        hotel: (
          <>
            <Del t="€180" p={S[4]} /><Ins pre=" " t="€160" p={S[5]} />
          </>
        ),
        meals: (
          <>
            <Del t="€60" p={S[6]} /><Ins pre=" " t="€55" p={S[7]} />
          </>
        ),
        list: [
          <>
            Trips under €1,000 need <Del t="approval from your direct manager before booking" p={S[8]} /><Ins pre=" " t="manager approval first" p={S[9]} />.
          </>,
          FINAL[1],
          <>
            Submit <Del t="all of your" p={S[10]} /> expense claims within <Del t="thirty" p={S[11]} /><Ins pre=" " t="30" p={S[11]} /> days of return.
          </>,
        ],
      }}
    />
  );

  // window: settles from a deeper tilt, then keeps easing
  const ry = kf(f, [[0, -24], [120, -17, E.out], [DUR.inside, -14, E.soft]]);
  const rx = kf(f, [[0, 7], [120, 4, E.out], [DUR.inside, 3, E.soft]]);
  const wx = kf(f, [[0, 60], [120, 0, E.out], [DUR.inside, -24, E.soft]]);
  const camZ = kf(f, [[0, 1], [DUR.inside, 1.045, E.lin]]);
  const countP = tw(f, t.count, t.count + 34, 0, 1, E.out);
  const n = Math.round(4 + 8 * tw(f, t.sugg[0], t.count + 10, 0, 1, E.soft));
  const ul = tw(f, t.underline[0], t.underline[1], 0, 1, E.inOut);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Stage3D persp={2000}>
        <Cam x={d.x} y={d.y} z={camZ * d.s} rz={d.r * 0.3}>
          {/* the app */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: fm.W, height: fm.H, transform: fm.portrait ? `translateY(${wx}px) rotateY(${ry * 0.7}deg) rotateX(${rx}deg)` : `translateX(${wx}px) rotateY(${ry}deg) rotateX(${rx}deg)`, transformOrigin: fm.portrait ? `${dock.x}px ${dock.y}px` : `${TL}px 540px`, transformStyle: 'preserve-3d' }}>
            <Chat x={fm.portrait ? dock.x : TL} y={fm.portrait ? dock.y + 24 : 150} w={1120} h={fm.portrait ? fm.H - dock.y + 60 : 960} title="Travel policy" who="anna">
              <Bubble>
                <Mention text="@CKEditor Docs tighten the whole policy as suggestions." />
              </Bubble>
              <Editor w={'100%'} page={page} />
            </Chat>
          </div>
          {/* near layer: counter chip */}
          <div
            style={{
              position: 'absolute',
              left: pf(fm, 700, { post: 150, tall: 150 }),
              top: pf(fm, 930, { post: fm.H - 210, tall: fm.H - 420 }),
              transform: `translateZ(120px) translateY(${(1 - countP) * 30}px)`,
              opacity: countP,
              background: C.white,
              borderRadius: 99,
              padding: '16px 26px 16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: `0 0 0 1px ${ink(0.06)}, ${shadow(1.1)}`,
              fontFamily: F.ui,
              fontWeight: 700,
              fontSize: 30,
              color: C.ink,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 99, background: C.lime, boxShadow: `0 0 0 4px ${lim(0.3)}` }} />
            {n} suggestions
          </div>
        </Cam>
      </Stage3D>
      {/* headline, in its own calm plane */}
      <div ref={href} style={{ ...hlStyle(fm, 2), transform: `translate(${d.x * 0.4}px, ${-f * 0.03}px)` }}>
        <div data-m="head" style={{ display: 'inline-block' }}>
        <div>Manage documents</div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ position: 'absolute', left: -6, right: -6, bottom: 6, height: 24, background: C.lime, transformOrigin: '0 50%', transform: `scaleX(${ul})`, borderRadius: 4 }} />
          <div style={{ position: 'relative' }}>
            <Words text="inside your ChatGPT." f={f} at={t.words2} stagger={6} dur={40} />
          </div>
        </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
