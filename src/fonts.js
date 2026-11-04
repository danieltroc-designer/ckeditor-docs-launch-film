import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
const L = (family, file, weight) => loadFont({ family, url: staticFile(`fonts/${file}`), weight: String(weight), format: 'woff2' });
[500, 600, 700, 800, 900].forEach((w) => L('Mulish', `mulish-latin-${w}-normal.woff2`, w));
[400, 500, 600, 700].forEach((w) => L('Public Sans', `public-sans-latin-${w}-normal.woff2`, w));
L('Saira Semi Condensed', 'saira-semi-condensed-latin-600-normal.woff2', 600);
[400, 500].forEach((w) => L('Source Code Pro', `source-code-pro-latin-${w}-normal.woff2`, w));
[400, 700].forEach((w) => L('Tinos', `tinos-latin-${w}-normal.woff2`, w));
