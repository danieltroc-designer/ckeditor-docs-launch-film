// Exports the frame-exact action times (seconds) used by the real-keyboard sound pass.
import fs from 'fs';
import { T, secOf, STARTN, FPS } from '../src/timeline.js';
const keys = [];
const K = (id, arr, pan) => arr.forEach((f, i) => keys.push({ t: secOf(id, f), pan, space: false }));
K('editor', T.editor.type, 0); K('suggest', T.suggest.type, 0); K('team', T.team.tom, -0.5); K('team', T.team.priya, 0.5); K('team', T.team.reply, 0.15);
const clicks = [
  ['editor', T.editor.send, 0], ['suggest', T.suggest.send, 0],
  ['suggest', T.suggest.accept1, 0.25], ['suggest', T.suggest.reject2, 0.25], ['suggest', T.suggest.acceptAll, 0.2],
  ['team', T.team.sendT, -0.5], ['team', T.team.sendP, 0.5], ['team', T.team.sendR, 0.15],
  ['export', T.export.acceptAll, 0.3], ['export', T.export.hist, 0.3], ['export', T.export.expand, 0.35], ['export', T.export.exportBtn, 0.4], ['export', T.export.word, 0.4],
].map(([id, f, pan]) => ({ t: secOf(id, f), pan }));
const cuts = Object.fromEntries(Object.entries(STARTN).map(([k, v]) => [k, v / FPS]));
fs.writeFileSync('out/events.json', JSON.stringify({ keys, clicks, cuts }, null, 1));
console.log(keys.length, 'keys', clicks.length, 'clicks', JSON.stringify(cuts));
