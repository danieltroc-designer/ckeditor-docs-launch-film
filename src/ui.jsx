import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, ink, pur, lim, F, E, tw, clamp01, shadow } from './theme';

// ---------- hand-drawn line icons (20px grid) ----------
const P = {
  undo: 'M7.5 6L4.5 9l3 3M4.5 9h7.5a4 4 0 010 8H10',
  bold: null,
  link: 'M8.6 11.4l2.8-2.8M7.2 9.2l-1.6 1.6a2.6 2.6 0 003.7 3.7l1.5-1.5M12.8 10.8l1.6-1.6a2.6 2.6 0 00-3.7-3.7L9.2 7',
  image: 'M3.5 4.5h13v11h-13zM3.5 13l3.8-3.6 3.4 3.1 2-1.8 3.8 3.3M12.6 7.6h.02',
  table: 'M3.5 4.5h13v11h-13zM3.5 8.2h13M3.5 11.8h13M8 4.5v11',
  list: 'M7.5 5.5h9M7.5 10h9M7.5 14.5h9M3.9 5.5h.02M3.9 10h.02M3.9 14.5h.02',
  numlist: 'M8 5.5h8.5M8 10h8.5M8 14.5h8.5M3.4 4.6l1-.6v3.2M3.2 12.4h1.9l-1.9 2.6h2',
  comment: 'M4 4.5h12v8.6H9.4L5.6 16v-2.9H4z',
  track: 'M4.5 15.5l.8-3.3 7.6-7.6 2.5 2.5-7.6 7.6zM11.6 5.9l2.5 2.5',
  history: 'M10 6v4.2l2.8 1.7M3.8 10a6.2 6.2 0 101.8-4.4M3.6 3.4v3h3',
  expand: 'M11.5 3.5h5v5M8.5 16.5h-5v-5M16.5 3.5L11.6 8.4M3.5 16.5l4.9-4.9',
  check: 'M4.6 10.4l3.4 3.4 7.4-7.6',
  x: 'M5.4 5.4l9.2 9.2M14.6 5.4l-9.2 9.2',
  send: 'M10 15.5V5M5.6 9.2L10 4.8l4.4 4.4',
  chevron: 'M6 8l4 4 4-4',
  doc: 'M5 3.5h6.5l3.5 3.5v9.5H5zM11.5 3.5V7H15',
  share: 'M13.5 6.5a2 2 0 100-.01M6.5 12a2 2 0 100-.01M13.5 17.5a2 2 0 100-.01M8.3 11l3.4-2M8.3 13l3.4 2',
};
export const Icon = ({ n, size = 20, color = 'currentColor', w = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: 'block' }}>
    <path d={P[n]} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------- cursor ----------
export const Cursor = ({ x, y, scale = 1, opacity = 1, press = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      transform: `translate(${x}px,${y}px) scale(${scale * (1 - press * 0.12)})`,
      transformOrigin: '0 0',
      opacity,
      zIndex: 50,
      filter: `drop-shadow(0 3px 5px ${ink(0.28)})`,
    }}
  >
    <svg width="34" height="34" viewBox="0 0 30 30">
      <path d="M6 3.2l16.6 12.2-7.2 1.3 4.1 7.9-3.3 1.7-4.1-7.9-5.9 5z" fill={C.ink} stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  </div>
);
export const Ring = ({ x, y, f, at }) => {
  const p = clamp01((f - at) / 26);
  if (f < at || p >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 26,
        top: y - 26,
        width: 52,
        height: 52,
        borderRadius: 99,
        border: `2px solid ${C.purple}`,
        opacity: (1 - p) * 0.9,
        transform: `scale(${0.4 + E.out(p) * 1.1})`,
        zIndex: 49,
      }}
    />
  );
};

// cursor path: keys [[frame,x,y]], arcs gently
export function cursorAt(f, keys) {
  if (f <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b[0]) {
      const p = E.inOut(clamp01((f - a[0]) / (b[0] - a[0])));
      const dx = b[1] - a[1], dy = b[2] - a[2];
      const bow = Math.sin(p * Math.PI) * 0.08;
      return [a[1] + dx * p - dy * bow, a[2] + dy * p + dx * bow];
    }
  }
  const l = keys[keys.length - 1];
  return [l[1], l[2]];
}
export const pressAt = (f, clicks) => {
  let v = 0;
  for (const c of clicks) {
    const d = f - c;
    if (d > -3 && d < 9) v = Math.max(v, d < 0 ? (d + 3) / 3 : 1 - d / 9);
  }
  return v;
};

// ---------- type helpers ----------
export const Words = ({ text, f, at, stagger = 4, dur = 34, style, out, outDur = 18, em }) => {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline', ...style }}>
      {words.map((w, i) => {
        const p = tw(f, at + i * stagger, at + i * stagger + dur, 0, 1, E.out);
        const q = out == null ? 0 : tw(f, out + i * 2, out + i * 2 + outDur, 0, 1, E.in);
        const isEm = em && em.includes(i);
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 108 - q * 108}%)`,
                color: isEm ? C.purple : undefined,
              }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        );
      })}
    </span>
  );
};

// ---------- suggestions (insert types in, delete strikes through) ----------
export const Ins = ({ t, p = 1, acc = 0, who = 'lime', pre = '' }) => {
  const n = Math.round(t.length * clamp01(p));
  if (n <= 0) return null;
  const a = 1 - clamp01(acc);
  const bg = who === 'lime' ? lim(0.42 * a) : pur(0.12 * a);
  const line = who === 'lime' ? `rgba(104,150,0,${0.9 * a})` : pur(0.8 * a);
  return (
    <>
      {pre}
      <span style={{ background: bg, boxShadow: `inset 0 -2px 0 ${line}`, borderRadius: 3, padding: a > 0.02 ? '0 2px' : 0 }}>
        {t.slice(0, n)}
      </span>
    </>
  );
};
export const Del = ({ t, p = 1, gone = 0, restore = 0 }) => {
  const n = Math.round(t.length * (1 - clamp01(gone)));
  if (n <= 0) return null;
  const s = clamp01(p) * (1 - clamp01(restore));
  return (
    <span style={{ position: 'relative', color: s > 0 ? ink(1 - 0.5 * s) : undefined, background: pur(0.07 * s), borderRadius: 3 }}>
      {t.slice(0, n)}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: '54%',
          height: 2,
          width: `${s * 100}%`,
          background: C.purple,
          borderRadius: 2,
        }}
      />
    </span>
  );
};
export const Hl = ({ children, p = 1, color = C.ink }) => (
  <span
    style={{
      background: color === C.ink ? ink(0.075 * p) : lim(0.4 * p),
      boxShadow: `inset 0 -2px 0 ${color === C.ink ? ink(0.55 * p) : `rgba(104,150,0,${p})`}`,
      borderRadius: 3,
    }}
  >
    {children}
  </span>
);

// ---------- avatar ----------
export const Avatar = ({ who, size = 30 }) => {
  const m = { anna: [C.purple, '#fff', 'A'], tom: [C.lime, C.ink, 'T'], priya: [C.ink, '#fff', 'P'], ai: [C.ink, '#fff', 'AI'] }[who];
  return (
    <div style={{ width: size, height: size, borderRadius: 99, background: m[0], color: m[1], display: 'grid', placeItems: 'center', fontFamily: F.ui, fontWeight: 700, fontSize: size * 0.42, flex: 'none' }}>
      {m[2]}
    </div>
  );
};

// ---------- chat window: desktop-app chrome (simplified, no product logo) ----------
const G = {
  home: 'M4.5 10.6L12 4.5l7.5 6.1v8.4a1 1 0 01-1 1h-4.3v-5.6H9.8V20H5.5a1 1 0 01-1-1z',
  library: 'M8.5 4.5h9a2 2 0 012 2v9M5.5 7.5h9a1.5 1.5 0 011.5 1.5v9.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 18.5V9a1.5 1.5 0 011.5-1.5z',
  clock: 'M12 7.6V12l3 1.9M12 4a8 8 0 100 16 8 8 0 000-16z',
  at: 'M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zM15.2 9v4.2a2.3 2.3 0 004.6 0V12a7.8 7.8 0 10-3.1 6.2',
  apps: 'M5.5 4.5h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 011-1zM14.5 4.5h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 011-1zM5.5 13.5h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 011-1zM16.5 13.5a3 3 0 110 6 3 3 0 010-6z',
  back: 'M19 12H5.5M11 6l-6 6 6 6',
  fwd: 'M5 12h13.5M13 6l6 6-6 6',
  side: 'M5.5 5h13a1.5 1.5 0 011.5 1.5v11a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 17.5v-11A1.5 1.5 0 015.5 5zM9.5 5v14',
  compose: 'M11 4.5H6.5A2 2 0 004.5 6.5v11a2 2 0 002 2h11a2 2 0 002-2V13M17.6 3.9l2.5 2.5-7.6 7.6-3.3.8.8-3.3z',
};
const Gl = ({ n, size = 28, color = ink(0.86), w = 1.8, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
    <path d={G[n]} fill={fill || 'none'} stroke={fill ? 'none' : color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const RAIL = 84, TOP = 58;
export const Chat = ({ x, y, w, h, title = 'New chat', who = 'anna', tag, children, input = '', caret = false, f = 0, send = 0, style, feedY = 0, scrollY = 0 }) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      background: '#F3F1F5', borderRadius: 24, boxShadow: `0 0 0 1px ${ink(0.08)}, ${shadow(1)}`,
      overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: F.ui, color: C.ink, ...style,
    }}
  >
    {/* title bar: window dots, navigation, sidebar + new chat, title */}
    <div style={{ height: TOP, flex: 'none', display: 'flex', alignItems: 'center', padding: '0 18px 0 22px' }}>
      <div style={{ display: 'flex', gap: 8, width: RAIL - 6 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 99, background: ink(0.16) }} />)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Gl n="back" size={22} color={ink(0.3)} />
        <Gl n="fwd" size={22} color={ink(0.3)} />
        <div style={{ width: 6 }} />
        <Gl n="side" size={22} color={ink(0.62)} />
        <Gl n="compose" size={22} color={ink(0.62)} />
      </div>
      <div style={{ marginLeft: 22, fontWeight: 600, fontSize: 18, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{title}</div>
      {tag}
    </div>
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/* icon rail */}
      <div style={{ width: RAIL, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6, gap: 8 }}>
        <div style={{ width: 54, height: 54, borderRadius: 15, background: ink(0.07), display: 'grid', placeItems: 'center' }}>
          <Gl n="home" fill={C.ink} />
        </div>
        {['library', 'clock', 'at'].map((n) => (
          <div key={n} style={{ width: 54, height: 54, display: 'grid', placeItems: 'center' }}>
            <Gl n={n} />
          </div>
        ))}
        <div style={{ width: 54, height: 54, display: 'grid', placeItems: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', gap: 4 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 4.5, height: 4.5, borderRadius: 9, background: ink(0.7) }} />)}</div>
          <div style={{ position: 'absolute', right: 9, top: 12, width: 10, height: 10, borderRadius: 9, background: C.purple }} />
        </div>
        <div style={{ width: 38, height: 1, background: ink(0.1), margin: '4px 0' }} />
        <div style={{ width: 54, height: 54, display: 'grid', placeItems: 'center' }}>
          <Gl n="apps" />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ marginBottom: 22 }}><Avatar who={who} size={36} /></div>
      </div>
      {/* main panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', background: C.white, borderTopLeftRadius: 18, boxShadow: `-1px -1px 0 ${ink(0.06)}` }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 34px)', maskImage: 'linear-gradient(to bottom, transparent 0, #000 34px)' }}>
          <div style={{ position: 'absolute', left: '6%', right: '6%', top: 30 + feedY, display: 'flex', flexDirection: 'column', gap: 18, transform: scrollY ? `translateY(${scrollY}px)` : undefined }}>{children}</div>
        </div>
        <div data-m="composer" style={{ margin: '0 6% 24px', height: 66, flex: 'none', borderRadius: 22, border: `1px solid ${ink(0.12)}`, background: C.white, display: 'flex', alignItems: 'center', padding: '0 11px 0 24px', gap: 12, boxShadow: `0 12px 30px -18px ${ink(0.3)}` }}>
          <div style={{ flex: 1, fontSize: 20, whiteSpace: 'nowrap', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: input && input.length * 10.2 > (w - RAIL) * 0.88 - 110 ? 'flex-end' : 'flex-start' }}>
            {input ? <Mention text={input} /> : <span style={{ color: ink(0.38) }}>Message</span>}
            {caret ? <span style={{ width: 2, height: 24, marginLeft: 2, background: C.purple, opacity: Math.floor(f / 32) % 2 === 0 ? 1 : 0.15 }} /> : null}
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: input ? C.purple : ink(0.12), color: '#fff', display: 'grid', placeItems: 'center', transform: `scale(${1 - send * 0.12})` }}>
            <Icon n="send" size={22} w={2} />
          </div>
        </div>
      </div>
    </div>
  </div>
);
export const Mention = ({ text }) => {
  const m = '@CKEditor Docs';
  if (text.startsWith('@')) {
    const head = text.slice(0, Math.min(text.length, m.length));
    return (
      <span>
        <span style={{ color: C.purple, fontWeight: 600 }}>{head}</span>
        {text.slice(m.length)}
      </span>
    );
  }
  return <span>{text}</span>;
};
export const Bubble = ({ children, p = 1 }) => (
  <div
    style={{
      alignSelf: 'flex-end',
      maxWidth: '74%',
      background: C.bg,
      padding: '14px 20px',
      borderRadius: '22px 22px 6px 22px',
      fontSize: 19,
      lineHeight: 1.45,
      opacity: p,
      transform: `translateY(${(1 - p) * 18}px) scale(${0.97 + 0.03 * p})`,
      transformOrigin: '100% 100%',
    }}
  >
    {children}
  </div>
);

// ---------- CKEditor Docs editor ----------
export const Logo = ({ h = 20, docs = true, color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
    <Img src={staticFile('logo.svg')} style={{ height: h, width: 'auto', display: 'block' }} />
    {docs ? (
      <span style={{ fontFamily: F.docs, fontWeight: 600, fontSize: h * 1.02, lineHeight: 1, marginLeft: h * 0.26, position: 'relative', top: -h * 0.07, color: color || '#0F001B' }}>Docs</span>
    ) : null}
  </div>
);

const TB = ({ n, hi, children, mk }) => (
  <div data-m={mk ? 'tb-' + mk : undefined} style={{ minWidth: 34, height: 34, borderRadius: 8, display: 'grid', placeItems: 'center', padding: children ? '0 10px' : 0, background: hi ? pur(0.1) : 'transparent', color: hi ? C.purple : ink(0.78), fontWeight: 600, fontSize: 16 }}>
    {children || <Icon n={n} size={20} />}
  </div>
);
const Sep = () => <div style={{ width: 1, height: 22, background: ink(0.1), margin: '0 6px' }} />;

export const Toolbar = ({ hi }) => (
  <div data-m="toolbar" style={{ height: 48, display: 'flex', alignItems: 'center', gap: 2, padding: '0 12px', borderBottom: `1px solid ${ink(0.07)}`, background: '#FBFAFC' }}>
    <TB n="undo" hi={hi === 'undo'} mk="undo" />
    <Sep />
    <TB hi={hi === 'head'} mk="head">
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
        Heading 2 <Icon n="chevron" size={16} />
      </span>
    </TB>
    <Sep />
    <TB hi={hi === 'b'}><b>B</b></TB>
    <TB><i style={{ fontFamily: 'serif', fontSize: 18 }}>I</i></TB>
    <TB><u>U</u></TB>
    <Sep />
    <TB n="link" />
    <TB n="image" hi={hi === 'image'} mk="image" />
    <TB n="table" hi={hi === 'table'} mk="table" />
    <TB n="list" hi={hi === 'list'} mk="list" />
    <TB n="numlist" />
    <Sep />
    <TB n="comment" hi={hi === 'comment'} mk="comment" />
    <TB n="track" hi={hi === 'track'} mk="track" />
    <TB n="history" hi={hi === 'history'} mk="history" />
  </div>
);

export const Fernhill = ({ s = 1 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 * s, fontFamily: F.ui, fontWeight: 700, fontSize: 12 * s, letterSpacing: '0.08em', color: C.ink }}>
    <svg width={22 * s} height={22 * s} viewBox="0 0 22 22">
      <rect x="0" y="0" width="22" height="22" rx="6" fill={C.ink} />
      <path d="M11 5c3.2 2.4 3.6 7.8 0 12-3.6-4.2-3.2-9.6 0-12zM11 8v9" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
    FERNHILL LABS
  </div>
);

// The travel policy page. Slots override parts with suggestion markup.
export const Page = ({ o = {}, reveal, mk = '' }) => {
  const M = (k) => (mk === null ? undefined : mk + k);
  const R = (i) => {
    if (!reveal) return {};
    const p = reveal[i] == null ? 1 : reveal[i];
    return { opacity: p, transform: `translateY(${(1 - p) * 14}px)` };
  };
  const h2 = { fontFamily: F.ui, fontSize: 22, fontWeight: 700, margin: '22px 0 8px', color: C.ink };
  const pS = { margin: 0, fontSize: 18, lineHeight: 1.6, color: ink(0.86) };
  const td = { border: `1px solid ${ink(0.12)}`, padding: '9px 14px', textAlign: 'left' };
  return (
    <div style={{ fontFamily: F.ui, color: C.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...R(0) }}>
        <div data-m={M('title')} style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>Travel policy 2027</div>
        <Fernhill />
      </div>
      <div style={R(1)}>
        <div style={h2}>Summary</div>
        <p style={pS}>{o.summary || 'This policy covers every business trip, from booking to reimbursement, for all Fernhill Labs staff.'}</p>
      </div>
      <div style={R(2)}>
        <div style={h2}>1. Booking</div>
        <p data-m={M('booking')} style={pS}>{o.booking || 'Book flights and hotels through the travel portal at least 14 days ahead.'}</p>
      </div>
      <div style={R(3)}>
        <div style={h2}>2. Reimbursement</div>
        <table data-m={M('table')} style={{ borderCollapse: 'collapse', width: '100%', fontSize: 17 }}>
          <tbody>
            <tr style={{ background: '#F8F6FA' }}>
              <th style={{ ...td, fontWeight: 700 }}>Category</th>
              <th style={{ ...td, fontWeight: 700 }}>Limit</th>
              <th style={{ ...td, fontWeight: 700 }}>Receipt</th>
            </tr>
            <tr data-row="hotel">
              <td style={td}>Hotel, per night</td>
              <td style={td} data-m={M('hotel')}>{o.hotel || '€180'}</td>
              <td style={td}>Required</td>
            </tr>
            <tr>
              <td style={td}>Meals, per day</td>
              <td style={td} data-m={M('meals')}>{o.meals || '€60'}</td>
              <td style={td}>Required</td>
            </tr>
            <tr>
              <td style={td}>Taxis and trains</td>
              <td style={td}>€40</td>
              <td style={td}>Over €25</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={R(4)}>
        <div style={h2}>3. Approvals</div>
        <ul data-m={M('list')} style={{ margin: 0, paddingLeft: 24, fontSize: 18, lineHeight: 1.6, color: ink(0.86) }}>
          {(o.list || FINAL).map((li, i) => (
            <li key={i} data-m={M('li' + i)}>{li}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export const DRAFT = [
  'Trips under €1,000 need approval from your direct manager before booking.',
  'Trips over €1,000 also need Finance sign-off.',
  'Submit all of your expense claims within thirty days of return.',
];
export const FINAL = [
  'Trips under €1,000 need manager approval first.',
  'Trips over €1,000 also need Finance sign-off.',
  'Submit expense claims within 30 days of return.',
];

export const Editor = ({ w, hi, head, side, sideW = 300, page, pageReveal, mk, title = 'Travel policy 2027', bodyH, style, pad = 36, padB = 0, bodyScroll = 0, overlay }) => (
  <div style={{ width: w, background: C.white, borderRadius: 18, boxShadow: `0 0 0 1px ${ink(0.1)}, 0 18px 40px -24px ${ink(0.35)}`, overflow: 'hidden', fontFamily: F.ui, color: C.ink, position: 'relative', ...style }}>
    <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px 0 20px', borderBottom: `1px solid ${ink(0.07)}` }}>
      <Logo h={19} />
      <div style={{ width: 1, height: 20, background: ink(0.12) }} />
      <div style={{ flex: 1, fontSize: 16, color: ink(0.6) }}>{title}</div>
      {head}
      <div data-m="expand" style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', color: ink(0.7) }}>
        <Icon n="expand" />
      </div>
    </div>
    <Toolbar hi={hi} />
    <div style={{ height: bodyH, overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 24, padding: `${pad - 6}px ${pad}px ${pad + padB}px`, boxSizing: 'border-box', position: 'relative', transform: bodyScroll ? `translateY(${bodyScroll}px)` : undefined }}>
        <div data-m="page" style={{ flex: 1, minWidth: 0 }}>{page || <Page reveal={pageReveal} mk={mk} />}</div>
        {side !== undefined ? <div data-m="side" style={{ width: sideW, flex: 'none', position: 'relative' }}>{side}</div> : null}
      </div>
      {overlay}
    </div>
  </div>
);

// side card for a suggestion or comment
export const Card = ({ who, name, children, top, p = 1, on = 0, comment, out = 0, left = 0, accent, ai }) => {
  const vis = clamp01(p) * (1 - clamp01(out));
  return (
    <div
      style={{
        position: 'absolute',
        left,
        right: 0,
        top,
        background: C.white,
        borderRadius: 14,
        padding: '13px 15px',
        fontSize: 15,
        lineHeight: 1.45,
        color: ink(0.86),
        boxShadow: `0 0 0 ${1 + on}px ${on > 0.02 ? pur(0.3 + 0.7 * on) : ink(0.1)}, 0 14px 30px -18px ${ink(0.4)}`,
        opacity: vis,
        transform: `translateX(${(1 - E.out(clamp01(p))) * 36 + out * 24}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6, fontWeight: 700, color: C.ink, fontSize: 15 }}>
        {ai ? <AIAvatar size={24} /> : <Avatar who={who} size={24} />}
        <span>{ai ? 'ChatGPT' : name}</span>
        <span style={{ flex: 1 }} />
        {comment ? (
          <Icon n="comment" size={17} color={ink(0.45)} />
        ) : (
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', boxShadow: `0 0 0 1px ${ink(0.12)}`, background: accent === 'ok' ? pur(0.1) : 'transparent', color: ink(0.75) }}>
              <Icon n="check" size={16} w={2} />
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', boxShadow: `0 0 0 1px ${ink(0.12)}`, background: accent === 'no' ? pur(0.1) : 'transparent', color: ink(0.75) }}>
              <Icon n="x" size={16} w={2} />
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

// suggestions people generated with AI and then sent as their own
// generic assistant avatar for AI-authored suggestions (no product logo)
export const AIAvatar = ({ size = 24 }) => (
  <div style={{ width: size, height: size, borderRadius: 99, flex: 'none', display: 'grid', placeItems: 'center', background: C.white, boxShadow: `inset 0 0 0 1.5px ${pur(0.55)}` }}>
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 12 12"><path d="M6 0.6l1.25 3.6 3.65 1.3-3.65 1.3L6 10.4 4.75 6.8 1.1 5.5l3.65-1.3z" fill={C.purple} /></svg>
  </div>
);
export const AIPill = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px 3px 6px', borderRadius: 99, background: pur(0.1), color: C.purple, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
    <svg width="11" height="11" viewBox="0 0 12 12"><path d="M6 0.6l1.25 3.6 3.65 1.3-3.65 1.3L6 10.4 4.75 6.8 1.1 5.5l3.65-1.3z" fill={C.purple} /></svg>
    AI-generated
  </span>
);

export const Tag = ({ children, who }) => {
  const m = { anna: [pur(0.1), C.purple], tom: [lim(0.35), '#3D5200'], priya: [ink(0.07), C.ink] }[who];
  return (
    <div style={{ padding: '6px 13px', borderRadius: 99, background: m[0], color: m[1], fontSize: 14, fontWeight: 700 }}>{children}</div>
  );
};

// ---------- staging ----------
export const Stage3D = ({ children, persp = 2400 }) => (
  <AbsoluteFill style={{ perspective: persp, perspectiveOrigin: '50% 45%' }}>{children}</AbsoluteFill>
);
export const Cam = ({ x = 0, y = 0, z = 1, rx = 0, ry = 0, rz = 0, children, style }) => (
  <AbsoluteFill
    style={{
      transform: `translate(${x}px,${y}px) scale(${z}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
      transformOrigin: '960px 540px',
      transformStyle: 'preserve-3d',
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

// scene-level fade through background
export const sceneFade = (f, dur, inLen = 16, outLen = 16) =>
  Math.min(tw(f, 0, inLen, 0, 1, E.soft), 1 - tw(f, dur - outLen, dur, 0, 1, E.in));

// ---------- layout measurement (offsets relative to a positioned root, unaffected by transforms) ----------
import { useLayoutEffect, useRef, useState } from 'react';
import { delayRender, continueRender } from 'remotion';
export function useMeasure() {
  const ref = useRef(null);
  const [m, setM] = useState(null);
  const [handle] = useState(() => delayRender('measure layout'));
  useLayoutEffect(() => {
    let done = false;
    // wait until every web font is really loaded (not just "ready"), then two frames for layout,
    // so every render worker measures exactly the same layout
    const SPECS = ['500 20px Mulish', '600 20px Mulish', '700 20px Mulish', '800 20px Mulish', '900 20px Mulish', '400 20px "Public Sans"', '500 20px "Public Sans"', '600 20px "Public Sans"', '700 20px "Public Sans"', '400 20px "Source Code Pro"', '500 20px "Source Code Pro"', '600 20px "Saira Semi Condensed"', '400 20px Tinos', '700 20px Tinos'];
    const fontsLoaded = () => Promise.all(SPECS.map((sp) => document.fonts.load(sp).catch(() => null)))
      .then(() => document.fonts.ready)
      .then(() => Promise.all(Array.from(document.fonts).map((ff) => (ff.status === 'loaded' ? ff : ff.load().catch(() => ff)))));
    const twoFrames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    fontsLoaded().then(twoFrames).then(() => {
      if (done) return;
      const root = ref.current;
      const out = {};
      if (root) {
        root.querySelectorAll('[data-m]').forEach((el) => {
          let x = 0, y = 0, e = el;
          while (e && e !== root) {
            x += e.offsetLeft;
            y += e.offsetTop;
            e = e.offsetParent;
          }
          out[el.getAttribute('data-m')] = { x, y, w: el.offsetWidth, h: el.offsetHeight, cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2 };
        });
      }
      setM(out);
      continueRender(handle);
    });
    return () => { done = true; };
  }, []);
  return [ref, m];
}

// Horizontal motion blur for big lateral moves: fills the gaps between the sub-frame samples.
// The filter is always on (never toggled), so the layer is rasterised the same way on every frame.
// v = on-screen speed in px per 60 fps frame.
export const SlideBlur = ({ v, id, children }) => {
  const sd = Math.max(0.05, Math.min(24, Math.abs(v) / 6));
  return (
    <AbsoluteFill style={{ filter: `url(#${id})` }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={`${sd.toFixed(2)} 0.05`} />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};
// smooth speed estimate (wide central difference, so easing-solver noise cannot make it flicker)
export const slideSpeed = (f, r, dist, k, ease) => {
  const p = (x) => ease(Math.max(0, Math.min(1, (x - r[0]) / (r[1] - r[0]))));
  return ((p(f + 3) - p(f - 3)) / 6 * dist) / k;
};
