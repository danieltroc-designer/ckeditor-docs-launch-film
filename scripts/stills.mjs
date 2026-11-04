// Quick stills for checking layout without a full render.
// usage: node scripts/stills.mjs <outDir> <frames: "a-b:step" | "f1,f2"> [scale]
// COMP=FilmSub renders sub-frames (180 fps) instead of film frames.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, openBrowser } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [outDir, spec, scaleS = '0.5', samplesS = '1'] = process.argv.slice(2);
const scale = Number(scaleS), samples = Number(samplesS);
let frames = [];
if (spec.includes('-')) { const [r, st] = spec.split(':'); const [a, b] = r.split('-').map(Number); for (let f = a; f <= b; f += Number(st || 30)) frames.push(f); }
else frames = spec.split(',').map(Number);
fs.mkdirSync(outDir, { recursive: true });
const exe = process.env.REMOTION_BROWSER; // optional
const serveUrl = process.env.BUNDLE || await bundle({ entryPoint: path.resolve('src/index.jsx') });
const browser = await openBrowser('chrome', { ...(exe ? { browserExecutable: exe } : {}), chromiumOptions: { gl: 'swangle' } });
const inputProps = { samples, audio: false };
const composition = await selectComposition({ serveUrl, id: process.env.COMP || 'Film', inputProps, puppeteerInstance: browser });
const t0 = Date.now();
for (const frame of frames) {
  await renderStill({ composition, serveUrl, frame, output: path.join(outDir, `f${String(frame).padStart(4, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 85, scale, inputProps, puppeteerInstance: browser, chromiumOptions: { gl: 'swangle' } });
}
console.log(`rendered ${frames.length} stills in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
await browser.close({ silent: true });
