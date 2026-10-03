import type { PointerEvent } from 'react';
import { usePlayerRef } from '../canvas/PlayerContext';

type Props = { durationInFrames: number; fps: number; pixelsPerFrame: number };

/** Graduation en secondes ; cliquer ou glisser déplace la tête de lecture. */
export const TimelineRuler = ({ durationInFrames, fps, pixelsPerFrame }: Props) => {
  const playerRef = usePlayerRef();
  const seconds = Math.floor(durationInFrames / fps);
  const ticks = Array.from({ length: seconds + 1 }, (_, second) => second);

  const seekTo = (event: PointerEvent<HTMLDivElement>) => {
    const left = event.currentTarget.getBoundingClientRect().left;
    const frame = Math.round((event.clientX - left) / pixelsPerFrame);
    playerRef.current?.seekTo(Math.max(0, Math.min(durationInFrames - 1, frame)));
  };

  return (
    <div
      className="relative h-6 cursor-pointer border-b border-slate-800 select-none"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        seekTo(event);
      }}
      onPointerMove={(event) => {
        if (event.buttons === 1) seekTo(event);
      }}
    >
      {ticks.map((second) => (
        <span
          key={second}
          className="absolute top-0 h-full border-s border-slate-700 ps-1 text-[10px] text-slate-500"
          style={{ left: second * fps * pixelsPerFrame }}
        >
          {second}s
        </span>
      ))}
    </div>
  );
};
