'use client';

import { useRef, useState } from 'react';
import BottomNav from './BottomNav';

const SWIPE_THRESHOLD = 60;

interface Props {
  views: React.ReactNode[];
  defaultIndex?: number;
}

export default function SwipeContainer({ views, defaultIndex = 0 }: Props) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const dirRef = useRef<'h' | 'v' | null>(null);
  const count = views.length;

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    dirRef.current = null;
    setDragging(false);
    setDragX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;

    if (dirRef.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      dirRef.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
    }
    if (dirRef.current !== 'h') return;

    // Clamp at edges
    if (activeIndex === 0 && dx > 0) return;
    if (activeIndex === count - 1 && dx < 0) return;

    setDragging(true);
    setDragX(dx);
  };

  const onTouchEnd = () => {
    if (dirRef.current === 'h') {
      if (dragX < -SWIPE_THRESHOLD && activeIndex < count - 1) {
        setActiveIndex((i) => i + 1);
      } else if (dragX > SWIPE_THRESHOLD && activeIndex > 0) {
        setActiveIndex((i) => i - 1);
      }
    }
    setDragX(0);
    setDragging(false);
  };

  // translateX: -(activeIndex * panelWidth) + drag
  // Container = count * 100% wide; each panel = 100/count % of container = 100vw
  const pct = -activeIndex * (100 / count);
  const translateX = `calc(${pct}% + ${dragX}px)`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div
        className="flex-1 overflow-hidden min-h-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div
          className="flex h-full"
          style={{
            width: `${count * 100}%`,
            transform: `translateX(${translateX})`,
            transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
            willChange: 'transform',
          }}
        >
          {views.map((view, i) => (
            <div
              key={i}
              style={{ width: `${100 / count}%` }}
              className="h-full overflow-y-auto"
            >
              {view}
            </div>
          ))}
        </div>
      </div>
      <BottomNav activeIndex={activeIndex} onTabChange={setActiveIndex} />
    </div>
  );
}
