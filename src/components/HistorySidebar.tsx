import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Trash2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpLeft,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { GenerationHistoryItem } from '../types';

interface HistorySidebarProps {
  history: GenerationHistoryItem[];
  activeId: string | null;
  onSelect: (item: GenerationHistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onToggleFavorite: (id: string) => void;
  onUseAsInput: (imageUrl: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  activeId,
  onSelect,
  onDelete,
  onClearAll,
  onToggleFavorite,
  onUseAsInput,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterFavorite, setFilterFavorite] = useState(false);

  const filteredHistory = filterFavorite
    ? history.filter((item) => item.isFavorite)
    : history;

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'synthesis':
        return { label: '합성', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'restore':
        return { label: '복원·컬러', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'bg_remove':
        return { label: '배경 제거', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'poster':
        return { label: '포스터', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'passport':
        return { label: '여권 규격', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'studio':
        return { label: '스튜디오', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'retouch':
        return { label: '피부 보정', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'life_album':
        return { label: '인생 앨범', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      default:
        return { label: '편집', color: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30' };
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-3 px-1.5 bg-neutral-900/90 border-l border-neutral-800 backdrop-blur-md h-full select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors mb-4 title='히스토리 펼치기'"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center gap-2 writing-mode-vertical text-xs font-semibold text-neutral-400 tracking-wider">
          <Layers className="w-4 h-4 text-yellow-400 mb-1" />
          <span>히스토리 ({history.length})</span>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-64 sm:w-72 bg-neutral-900/95 border-l border-neutral-800 flex flex-col h-full shrink-0 z-20">
      {/* Header */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <h4 className="text-xs font-bold text-neutral-200 tracking-wide uppercase">
            버전 히스토리 ({history.length})
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterFavorite(!filterFavorite)}
            className={`p-1 rounded-md text-xs transition-colors ${
              filterFavorite
                ? 'text-yellow-400 bg-yellow-400/10'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title={filterFavorite ? '전체 보기' : '즐겨찾기만 보기'}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="히스토리 접기"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-toolbar */}
      {history.length > 0 && (
        <div className="px-3 py-1.5 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span>{filterFavorite ? '즐겨찾기 목록' : '최근 생성물 순서'}</span>
          <button
            onClick={onClearAll}
            className="text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            전체 비우기
          </button>
        </div>
      )}

      {/* Thumbnail List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
        {filteredHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
            <Sparkles className="w-8 h-8 text-neutral-600 mb-2 opacity-60" />
            <p className="text-xs font-medium text-neutral-400">생성된 버전이 없습니다</p>
            <p className="text-[11px] text-neutral-600 mt-1">
              제어 파트에서 [생성 시작]을 클릭하면 이곳에 자동 기록됩니다.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isActive = item.id === activeId;
            const badge = getModeBadge(item.mode);

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`group relative flex gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-neutral-800/90 border-yellow-400/80 shadow-md ring-1 ring-yellow-400/40'
                    : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-800/50 hover:border-neutral-700'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-neutral-950 border border-neutral-700/60">
                  <img
                    src={item.resultImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isActive && (
                    <div className="absolute top-1 left-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 fill-neutral-900" />
                    </div>
                  )}
                  {/* Aspect ratio stamp */}
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono px-1 rounded bg-black/80 text-neutral-300">
                    {item.aspectRatio}
                  </span>
                </div>

                {/* Info & Metadata */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-neutral-200 truncate mt-1">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                      {item.prompt || '나노바나나 고정밀 보정'}
                    </p>
                  </div>

                  {/* Actions on hover / active */}
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-neutral-800/50 text-[10px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUseAsInput(item.resultImage);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 flex items-center gap-0.5 hover:underline"
                      title="이 결과를 새로운 원본으로 입력"
                    >
                      <ArrowUpLeft className="w-3 h-3" />
                      원본으로 사용
                    </button>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(item.id);
                        }}
                        className={`p-1 rounded hover:bg-neutral-700 transition-colors ${
                          item.isFavorite ? 'text-yellow-400' : 'text-neutral-400'
                        }`}
                        title="즐겨찾기"
                      >
                        {item.isFavorite ? (
                          <BookmarkCheck className="w-3 h-3" />
                        ) : (
                          <Bookmark className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-700 transition-colors"
                        title="버전 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
