import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Columns2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = '변경 전 (Before)',
  afterLabel = '변경 후 (After)',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl bg-neutral-900 border border-neutral-700/60 shadow-2xl ${className}`}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* After Image (Background) */}
      <img
        src={afterImage}
        alt="After result"
        className="block w-full h-auto max-h-[68vh] object-contain pointer-events-none mx-auto"
      />

      {/* Before Image (Clipped overlay) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Before original"
          className="block w-full h-auto max-h-[68vh] object-contain mx-auto"
        />
      </div>

      {/* Draggable Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 cursor-ew-resize z-20 shadow-[0_0_12px_rgba(250,204,21,0.8)]"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle Button */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-yellow-400 text-neutral-900 flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-black/40 hover:scale-110 active:scale-95 transition-transform">
          <Columns2 className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Floating Badges */}
      <div className="absolute top-3 left-3 pointer-events-none z-10">
        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-black/70 backdrop-blur-md text-neutral-200 border border-white/10 shadow">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-3 right-3 pointer-events-none z-10">
        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-yellow-500/90 backdrop-blur-md text-neutral-950 border border-yellow-300 shadow font-mono">
          {afterLabel}
        </span>
      </div>
    </div>
  );
};
