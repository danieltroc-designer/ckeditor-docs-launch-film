import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile, getStaticFiles, useVideoConfig } from 'remotion';
import { useF } from './time';
import './fonts';
import { C, E, tw } from './theme';
import { START, DUR, STARTN, CUT, K as KS } from './timeline';
import { ScaleCtx } from './time';
import { Inside } from './scenes/Inside';
import { Problem } from './scenes/Problem';
import { Editor as EditorScene } from './scenes/EditorScene';
import { Suggest } from './scenes/Suggest';
import { Team } from './scenes/Team';
import { Export } from './scenes/Export';
import { LogoScene } from './scenes/LogoScene';

const MAP = { inside: Inside, problem: Problem, editor: EditorScene, suggest: Suggest, team: Team, export: Export, logo: LogoScene };

// soft focus pull between scenes: last 14f out, first 16f in
const Wrap = ({ id, children }) => {
  const f = useF();
  const dur = DUR[id];
  const inP = id === 'inside' ? 1 : tw(f, 0, 18, 0, 1, E.soft);
  const outP = id === 'logo' ? 0 : tw(f, dur - 14, dur, 0, 1, E.in);
  const o = Math.min(inP, 1 - outP);
  const blur = (1 - inP) * 10 + outP * 12;
  const s = 1 + (1 - inP) * 0.012 - outP * 0.01;
  return (
    <AbsoluteFill style={{ opacity: o, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, transform: `scale(${s})` }}>{children}</AbsoluteFill>
  );
};

const Scenes = () => {
  const { fps } = useVideoConfig();
  const K = fps / 60;
  return (
  <AbsoluteFill style={{ background: C.bg }}>
    {Object.keys(MAP).map((id) => {
      const S = MAP[id];
      return (
        <Sequence key={id} from={STARTN[id] * K} durationInFrames={CUT[id] * K} name={id}>
          <ScaleCtx.Provider value={KS[id]}>
            <Wrap id={id}>
              <S />
            </Wrap>
          </ScaleCtx.Provider>
        </Sequence>
      );
    })}
  </AbsoluteFill>
  );
};

export const Film = ({ samples = 1, audio = true, only }) => {
  const hasAudio = audio && getStaticFiles().some((s) => s.name === 'soundtrack.wav');
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Scenes />
      {hasAudio ? <Audio src={staticFile('soundtrack.wav')} /> : null}
    </AbsoluteFill>
  );
};
