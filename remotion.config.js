import { Config } from '@remotion/cli/config';
// Use a local Chrome / headless shell if you have one; otherwise Remotion downloads its own.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
Config.setEntryPoint('./src/index.jsx');
