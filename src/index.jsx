import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { Film } from './Film';
import { TOTAL } from './timeline';
import { FORMATS } from './format';

// Film / FilmSub / FilmSub9 are the approved 16:9 master. The same three exist per extra
// format with a suffix, e.g. Film-9x16, FilmSub-9x16, FilmSub9-9x16 (1080x1920) and Film-4x5 (1080x1350).
const SETS = [['', FORMATS.land], ['-4x5', FORMATS.post], ['-9x16', FORMATS.tall]];
const Root = () => (
  <>
    {SETS.map(([sfx, fm]) => (
      <React.Fragment key={fm.id}>
        <Composition id={`Film${sfx}`} component={Film} durationInFrames={TOTAL} fps={60} width={fm.W} height={fm.H} defaultProps={{ samples: 1, audio: true }} />
        <Composition id={`FilmSub${sfx}`} component={Film} durationInFrames={TOTAL * 3} fps={180} width={fm.W} height={fm.H} defaultProps={{ samples: 1, audio: false }} />
        <Composition id={`FilmSub9${sfx}`} component={Film} durationInFrames={TOTAL * 9} fps={540} width={fm.W} height={fm.H} defaultProps={{ samples: 1, audio: false }} />
      </React.Fragment>
    ))}
  </>
);
registerRoot(Root);
