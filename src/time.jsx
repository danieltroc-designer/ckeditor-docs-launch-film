import React, { createContext, useContext } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
export const ScaleCtx = createContext(1);
// Scene time in authored 60 fps units: undoes sub-frame rendering (motion blur) and the scene's stretch to its cut length.
export const useF = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = useContext(ScaleCtx);
  return (f * 60) / fps / k;
};
