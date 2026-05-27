'use client';

import { useEffect, useRef, useState } from 'react';

const BAR_COUNT = 18;
const IDLE_HEIGHT = 15;

interface Props {
  isRecording: boolean;
}

export default function WaveformBars({ isRecording }: Props) {
  const [heights, setHeights] = useState<number[]>(
    Array(BAR_COUNT).fill(IDLE_HEIGHT)
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setHeights(
          Array.from({ length: BAR_COUNT }, () => Math.random() * 75 + 15)
        );
      }, 90);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setHeights(Array(BAR_COUNT).fill(IDLE_HEIGHT));
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  return (
    <div
      className="flex items-end justify-center gap-[3px]"
      style={{
        height: '48px',
        opacity: isRecording ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: `${h}%`,
            borderRadius: '2px',
            background: 'var(--accent)',
            transition: 'height 0.1s ease',
          }}
        />
      ))}
    </div>
  );
}
