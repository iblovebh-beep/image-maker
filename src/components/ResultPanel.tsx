import React, { useState } from 'react';
import {
  RefreshCw,
  Download,
  Copy,
  ArrowUpLeft,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Columns,
  Eye,
  Sliders,
  Check,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { PassportGuideOverlay } from './PassportGuideOverlay';
import { HistorySidebar } from './HistorySidebar';
import { GenerationHistoryItem, EditMode } from '../types';

interface ResultPanelProps {
  currentResult: string | null;
  originalImage: string | null;
  secondaryImage: string | null;
  history: GenerationHistoryItem[];
  activeHistoryId: string | null;
  onSelectHistory: (item: GenerationHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onToggleFavorite: (id: string) => void;
  onUseAsInput: (imageUrl: string) => void;
  onRefresh: () => void;
  isProcessing: boolean;
  activeMode: EditMode;
  showPassportGuide: boolean;
  activePrompt: string;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  currentResult,
  originalImage,
  secondaryImage,
  history,
  activeHistoryId,
  onSelectHistory,
  onDeleteHistory,
  onClearHistory,
  onToggleFavorite,
  onUseAsInput,
  onRefresh,
  isProcessing,
  activeMode,
  showPassportGuide,
  activePrompt,
}) => {
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide' | 'afterOnly'>('slider');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active history item metadata
  const currentItem = history.find((h) => h.id === activeHistoryId);

  // Handle Download
  const handleDownload = () => {
    if (!currentResult) return;
    const a = document.createElement('a');
    a.href = currentResult;
    a.download = `nanobanana_${activeMode}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    if (!currentResult) return;
    try {
      const response = await fetch(currentResult);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback copy link/data
      navigator.clipboard.writeText(currentResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className={`flex flex-row h-full bg-neutral-950 overflow-hidden relative select-none ${
        isFullscreen ? 'fixed inset-0 z-50' : 'flex-1'
      }`}
    >
      {/* Main Center Result View */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar with Refresh Button placed at the top-right */}
        <div className="p-3.5 px-4 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wide">
              생성물 결과 파트 (Output & Comparison)
            </h2>
          </div>

          {/* Right Controls: View modes & Top-Right Refresh Button */}
          <div className="flex items-center gap-2">
            {currentResult && originalImage && (
              <div className="hidden sm:flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
                <button
                  onClick={() => setViewMode('slider')}
                  className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                    viewMode === 'slider'
                      ? 'bg-neutral-800 text-yellow-400 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="슬라이더 비교 뷰"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  비교 슬라이더
                </button>
                <button
                  onClick={() => setViewMode('sideBySide')}
                  className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                    viewMode === 'sideBySide'
                      ? 'bg-neutral-800 text-yellow-400 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="나란히 보기"
                >
                  <Columns className="w-3.5 h-3.5" />
                  나란히 보기
                </button>
                <button
                  onClick={() => setViewMode('afterOnly')}
                  className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                    viewMode === 'afterOnly'
                      ? 'bg-neutral-800 text-yellow-400 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="결과물만 보기"
                >
                  <Eye className="w-3.5 h-3.5" />
                  결과물만
                </button>
              </div>
            )}

            {/* Crucial Requirement: 새로고침 화면: 맨우측 상단에 배치 */}
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700/80 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm cursor-pointer"
              title="결과 화면 새로고침 및 뷰 재정렬"
            >
              <RefreshCw className="w-3.5 h-3.5 text-yellow-400" />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* Canvas Display Area */}
        <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center bg-radial from-neutral-900 via-neutral-950 to-black">
          {/* Zoom / Fullscreen overlay controls */}
          {currentResult && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-neutral-900/85 backdrop-blur-md p-1 rounded-lg border border-neutral-700/60 shadow-lg text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                title="축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-mono text-neutral-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                title="확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-3.5 bg-neutral-700 mx-0.5" />
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                title={isFullscreen ? '전체화면 종료' : '전체화면'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Processing / Generating State */}
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-sm">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20 animate-ping" />
                <div className="w-16 h-16 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-100">
                  나노바나나 고정밀 변환 중...
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  원본 인물의 이목구비 골격과 조명 일관성을 유지하며 픽셀을 정밀 렌더링하고 있습니다.
                </p>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ) : !currentResult ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center p-8 text-neutral-500 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8 text-neutral-600" />
              </div>
              <h3 className="text-sm font-bold text-neutral-300">생성물 결과 미리보기</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                좌측에서 원본 사진과 아이디어를 입력하고, 중앙 제어 파트에서 [나노바나나 AI 처리 시작]을
                누르면 변경 전후 비교 결과가 이곳에 표시됩니다.
              </p>
            </div>
          ) : (
            /* Render Generated Result */
            <div
              className="relative transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {viewMode === 'slider' && originalImage ? (
                <div className="relative">
                  <BeforeAfterSlider
                    beforeImage={originalImage}
                    afterImage={currentResult}
                    beforeLabel="원본 (Before)"
                    afterLabel="나노바나나 변환 (After)"
                  />
                  {/* Passport Guideline Overlay */}
                  {activeMode === 'passport' && (
                    <PassportGuideOverlay visible={showPassportGuide} />
                  )}
                </div>
              ) : viewMode === 'sideBySide' && originalImage ? (
                <div className="grid grid-cols-2 gap-4 max-w-4xl w-full">
                  <div className="space-y-1.5 text-center">
                    <span className="text-xs font-semibold text-neutral-400">
                      변경 전 (원본)
                    </span>
                    <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                      <img
                        src={originalImage}
                        alt="Original before"
                        className="w-full h-auto max-h-[60vh] object-contain"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-center">
                    <span className="text-xs font-semibold text-yellow-400">
                      변경 후 (나노바나나)
                    </span>
                    <div className="rounded-xl overflow-hidden bg-neutral-900 border border-yellow-400/50 shadow-lg shadow-yellow-500/10 relative">
                      <img
                        src={currentResult}
                        alt="NanoBanana after"
                        className="w-full h-auto max-h-[60vh] object-contain"
                      />
                      {activeMode === 'passport' && (
                        <PassportGuideOverlay visible={showPassportGuide} />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Result Only */
                <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
                  <img
                    src={currentResult}
                    alt="Final result"
                    className="max-h-[68vh] w-auto object-contain mx-auto"
                  />
                  {activeMode === 'passport' && (
                    <PassportGuideOverlay visible={showPassportGuide} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        {currentResult && (
          <div className="p-3 px-4 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-yellow-400/10 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                고화질 다운로드
              </button>

              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>클립보드 복사</span>
                  </>
                )}
              </button>

              {/* Set as Input for chaining edits */}
              <button
                onClick={() => onUseAsInput(currentResult)}
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-yellow-300 text-xs font-semibold flex items-center gap-1.5 border border-yellow-400/30 transition-all cursor-pointer"
                title="현재 결과물을 입력 원본으로 보내 추가 편집 진행"
              >
                <ArrowUpLeft className="w-3.5 h-3.5" />
                <span>입력 원본으로 보내기 (재편집)</span>
              </button>
            </div>

            {/* Info badge */}
            <div className="text-[11px] text-neutral-400 flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
                Mode: {activeMode.toUpperCase()}
              </span>
              <span>일관성 유지: 95%</span>
            </div>
          </div>
        )}
      </div>

      {/* Crucial Requirement: Vertical 'History' sidebar within the result pane */}
      <HistorySidebar
        history={history}
        activeId={activeHistoryId}
        onSelect={onSelectHistory}
        onDelete={onDeleteHistory}
        onClearAll={onClearHistory}
        onToggleFavorite={onToggleFavorite}
        onUseAsInput={onUseAsInput}
      />
    </div>
  );
};
