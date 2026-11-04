import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { Film } from './Film';
import { TOTAL } from './timeline';
const Root = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={TOTAL} fps={60} width={1920} height={1080} defaultProps={{ samples: 1, audio: true }} />
    <Composition id="FilmSub" component={Film} durationInFrames={TOTAL * 3} fps={180} width={1920} height={1080} defaultProps={{ samples: 1, audio: false }} />
    <Composition id="FilmSub9" component={Film} durationInFrames={TOTAL * 9} fps={540} width={1920} height={1080} defaultProps={{ samples: 1, audio: false }} />
  </>
);
registerRoot(Root);
