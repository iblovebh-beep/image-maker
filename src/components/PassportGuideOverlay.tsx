import React from 'react';

interface PassportGuideOverlayProps {
  visible: boolean;
}

export const PassportGuideOverlay: React.FC<PassportGuideOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 border-2 border-dashed border-sky-400/70 bg-sky-500/5">
      {/* Top crown line */}
      <div className="relative w-full border-b border-sky-400/80" style={{ top: '18%' }}>
        <span className="absolute -top-5 left-2 text-[10px] font-mono font-bold bg-sky-950/90 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/50">
          ▲ 정수리 기준선 (Top of Head: 3.2~3.6cm)
        </span>
      </div>

      {/* Eye axis line */}
      <div className="relative w-full border-b border-emerald-400/60" style={{ top: '38%' }}>
        <span className="absolute -top-5 right-2 text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/50">
          ● 양안 수평선 (Eye Level)
        </span>
      </div>

      {/* Chin line */}
      <div className="relative w-full border-b border-sky-400/80" style={{ top: '64%' }}>
        <span className="absolute -top-5 left-2 text-[10px] font-mono font-bold bg-sky-950/90 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/50">
          ▼ 턱선 기준선 (Chin Bottom)
        </span>
      </div>

      {/* Vertical center axis */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-r border-dashed border-sky-400/40" />

      {/* Biometric Guide stamp */}
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-sky-200/90 bg-neutral-950/80 px-2 py-1 rounded border border-sky-500/30">
        여권 표준 규격: 35mm × 45mm
      </div>
    </div>
  );
};
