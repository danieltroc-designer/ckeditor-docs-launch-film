// Shared timing for picture and sound. All scene-local frames at 60 fps.
export const FPS = 60;
export const BPM = 100;
export const BEAT = 36; // frames per beat at 100 BPM / 60 fps

export const SCENES = [
  ['inside', 10],
  ['problem', 13.5],
  ['editor', 18],
  ['suggest', 16],
  ['team', 26],
  ['export', 12.5],
  ['logo', 8],
];
export const START = {};
export const DUR = {};
let acc = 0;
for (const [id, beats] of SCENES) {
  START[id] = acc * BEAT;
  DUR[id] = beats * BEAT;
  acc += beats;
}
export const TOTAL = acc * BEAT; // 3600

// Cut lengths on screen (frames at 60 fps). Each is a whole number of beats at 120 BPM (30 frames),
// so every cut lands on the music's beat. Scenes are authored in DUR units and stretched by K.
export const MUSIC_BPM = 120;
export const CUT = { inside: 420, problem: 630, editor: 540, suggest: 510, team: 810, export: 390, logo: 300 };
export const STARTN = {};
export const K = {};
{
  let a = 0;
  for (const [id] of SCENES) { STARTN[id] = a; K[id] = CUT[id] / DUR[id]; a += CUT[id]; }
}
// a scene-local frame (authored units) -> seconds in the film
export const secOf = (id, fr) => (STARTN[id] + fr * K[id]) / FPS;

export function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Keystroke frames (scene-local, fractional) for a typed string.
export function typeTimes(text, start, cps = 20, seed = 3) {
  const r = rng(seed);
  const out = [];
  let t = start;
  for (let i = 0; i < text.length; i++) {
    out.push(t);
    const ch = text[i];
    let dt = (FPS / cps) * (0.7 + r() * 0.6);
    if (ch === ' ') dt *= 1.3;
    if (ch === ',' || ch === '.') dt *= 2.2;
    t += dt;
  }
  return out;
}
export const typed = (text, times, f) => {
  let n = 0;
  while (n < times.length && times[n] <= f) n++;
  return text.slice(0, n);
};
export const lastKey = (times) => times[times.length - 1];

// ---------- scene timings (local frames) ----------
export const P = {
  editor: '@CKEditor Docs draft a travel policy with a reimbursement table.',
  suggest: 'Tighten section 3 as suggestions.',
  tom: 'Check the reimbursement limits as suggestions.',
  priya: 'Flag risky clauses as comments.',
  reply: 'Good catch. I’ll add an exception.',
};

export const T = {
  inside: {
    words2: 24, // "Inside ChatGPT." rises
    underline: [70, 104], // lime marker draws
    sugg: [118, 126, 134, 142, 150, 158, 166, 174, 182, 190, 198, 206], // 12 suggestions land
    count: 214,
    out: 340,
  },
  problem: {
    rewind: [0, 46], // VHS rewind into "before" (scene runs at K = 1.30, so 46 units = 1 s)
    l1: 102, // Lost formatting.
    glitch: [112, 300],
    l2: 318, // Lost track.
    versions: [333, 345, 357, 369, 381, 393, 405, 417],
    comments: [375, 432],
    l3: 414, // Lost time.
    fall: [440, 486],
    out: 486,
  },
  editor: {
    type: typeTimes(P.editor, 20, 25, 5),
    send: 0, // set below
    bubble: 0,
    pull: [0, 0],
    card: 0,
    blocks: [],
    toolbar: [0, 0],
    hovers: [],
    table: [0, 0],
    recede: [0, 0],
    caption: 0,
    out: 632,
  },
  suggest: {
    type: typeTimes(P.suggest, 20, 20, 9),
    send: 0,
    bubble: 0,
    sugg: [],
    cards: [],
    accept1: 0,
    reject2: 0,
    acceptAll: 0,
    recede: [0, 0],
    caption: [],
    out: 560,
  },
  team: {
    tom: typeTimes(P.tom, 34, 23, 11),
    priya: typeTimes(P.priya, 190, 21, 13),
    sendT: 0,
    sendP: 0,
    regroup: [0, 0],
    fly: [],
    reply: [],
    sendR: 0,
    recede: [0, 0],
    caption: 0,
    out: 918,
  },
  export: {
    acceptAll: 36,
    hist: 76,
    scrub: [92, 126],
    expand: 146,
    grow: [150, 192],
    exportBtn: 208,
    word: 232,
    toast: 240,
    recede: [252, 340],
    words: [270, 290, 310],
    flip: [330, 354],
    out: 432,
  },
  logo: {
    icon: 6,
    word: 18,
    docs: 30,
    rule: [44, 84],
    tag: 70,
    pill: 92,
    outStart: 228,
    outEnd: 282,
  },
};

// derived timings
{
  const e = T.editor;
  e.send = Math.ceil(lastKey(e.type)) + 14;
  e.bubble = e.send + 4;
  e.pull = [e.send + 6, e.send + 60];
  e.card = e.send + 30;
  e.blocks = Array.from({ length: 8 }, (_, i) => e.card + 8 + i * 9);
  e.toolbar = [e.blocks[7] + 18, e.blocks[7] + 62];
  e.hovers = [e.toolbar[1] + 4, e.toolbar[1] + 16, e.toolbar[1] + 28, e.toolbar[1] + 40];
  e.table = [e.hovers[3] + 18, e.hovers[3] + 64];
  e.recede = [e.table[1] + 26, e.table[1] + 116];
  e.caption = e.recede[0] + 18;
}
{
  const s = T.suggest;
  s.send = Math.ceil(lastKey(s.type)) + 12;
  s.bubble = s.send + 4;
  s.sugg = [s.send + 34, s.send + 50, s.send + 66, s.send + 82];
  s.cards = [s.send + 44, s.send + 60, s.send + 76];
  s.accept1 = s.cards[2] + 50;
  s.reject2 = s.accept1 + 50;
  s.acceptAll = s.reject2 + 66;
  s.recede = [s.acceptAll + 24, s.acceptAll + 110];
  s.caption = [s.recede[0] + 14, s.recede[0] + 40, s.recede[0] + 66];
}
{
  const m = T.team;
  m.sendT = Math.ceil(lastKey(m.tom)) + 12;
  m.sendP = Math.ceil(lastKey(m.priya)) + 12;
  m.look = [m.sendT + 2, m.sendT + 62]; // camera Tom -> Priya (slower, with a slight pull-back)
  m.wide = [m.sendP + 6, m.sendP + 40];
  m.regroup = [m.sendP + 40, m.sendP + 100];
  const f0 = m.regroup[1] + 14;
  m.fly = [f0, f0 + 26, f0 + 52, f0 + 78]; // tom1, priya1, tom2, priya2 launch
  m.land = m.fly.map((x) => x + 46);
  const r0 = m.land[3] + 70;
  m.push = [m.land[3] + 24, m.land[3] + 70];
  m.reply = typeTimes(P.reply, r0, 20, 17);
  m.sendR = Math.ceil(lastKey(m.reply)) + 12;
  m.recede = [m.sendR + 30, m.sendR + 120];
  m.caption = m.recede[0] + 16;
}
