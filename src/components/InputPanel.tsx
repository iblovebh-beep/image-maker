import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  X,
  FileImage,
  RefreshCw,
  FolderOpen,
  ArrowRightLeft,
  Check,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { UploadedImage, EditMode } from '../types';
import { PRESET_SAMPLES, PresetSample } from '../utils/sampleData';

interface InputPanelProps {
  idea: string;
  setIdea: (val: string) => void;
  expandedPrompt: string;
  setExpandedPrompt: (val: string) => void;
  promptTags: string[];
  setPromptTags: (tags: string[]) => void;
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  activeMode: EditMode;
  onSelectMode: (mode: EditMode) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  idea,
  setIdea,
  expandedPrompt,
  setExpandedPrompt,
  promptTags,
  setPromptTags,
  images,
  setImages,
  activeMode,
  onSelectMode,
}) => {
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSamplesModal, setShowSamplesModal] = useState(false);
  const [promptNotice, setPromptNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle AI Prompt Expansion
  const handleExpandPrompt = async () => {
    if (!idea.trim()) {
      setPromptNotice('먼저 아이디어나 만들고자 하는 내용을 간단히 입력해주세요.');
      setTimeout(() => setPromptNotice(null), 3000);
      return;
    }

    setIsGeneratingPrompt(true);
    setPromptNotice(null);

    try {
      const res = await fetch('/api/expand-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, mode: activeMode }),
      });

      if (!res.ok) throw new Error('프롬프트 생성 서버 응답 오류');
      const data = await res.json();
      if (data.prompt) {
        setExpandedPrompt(data.prompt);
      }
      if (Array.isArray(data.tags)) {
        setPromptTags(data.tags);
      }
    } catch {
      // Fallback enhancement
      const fallbackPrompt = `${idea} - 나노바나나 엔진으로 원본 인물의 이목구비와 조명 일관성을 유지하며, 고해상도 질감과 자연스러운 블렌딩을 적용한 결과물.`;
      setExpandedPrompt(fallbackPrompt);
      setPromptTags(['#NanoBanana', '#일관성유지', '#정밀보정', '#스튜디오품질']);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Handle File Uploads
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - images.length;
    if (remainingSlots <= 0) {
      alert('이미지는 최대 3장까지 등록 가능합니다.');
      return;
    }

    const filesToLoad = Array.from(files).slice(0, remainingSlots);

    filesToLoad.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImages((prev) => {
            if (prev.length >= 3) return prev;
            // Determine default role
            const hasPrimary = prev.some((im) => im.role === 'primary');
            const role: 'primary' | 'secondary' | 'style' = !hasPrimary
              ? 'primary'
              : prev.length === 1
              ? 'secondary'
              : 'style';

            return [
              ...prev,
              {
                id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                name: file.name,
                dataUrl,
                role,
                width: img.naturalWidth,
                height: img.naturalHeight,
              },
            ];
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Remove image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      // Ensure one primary image remains if exists
      if (next.length > 0 && !next.some((img) => img.role === 'primary')) {
        next[0].role = 'primary';
      }
      return next;
    });
  };

  // Change image role
  const handleSetRole = (id: string, role: 'primary' | 'secondary' | 'style') => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) return { ...img, role };
        // If assigning primary, change previous primary to secondary
        if (role === 'primary' && img.role === 'primary') {
          return { ...img, role: 'secondary' };
        }
        return img;
      })
    );
  };

  // Load sample image
  const handleLoadSample = (sample: PresetSample) => {
    const img = new Image();
    img.onload = () => {
      setImages((prev) => {
        if (prev.length >= 3) {
          // Replace or append
          return [
            {
              id: `sample_${sample.id}_${Date.now()}`,
              name: sample.name,
              dataUrl: sample.dataUrl,
              role: 'primary',
              width: img.naturalWidth,
              height: img.naturalHeight,
            },
          ];
        }
        const hasPrimary = prev.some((im) => im.role === 'primary');
        return [
          ...prev,
          {
            id: `sample_${sample.id}_${Date.now()}`,
            name: sample.name,
            dataUrl: sample.dataUrl,
            role: !hasPrimary ? 'primary' : 'secondary',
            width: img.naturalWidth,
            height: img.naturalHeight,
          },
        ];
      });

      if (sample.recommendedMode) {
        onSelectMode(sample.recommendedMode as EditMode);
      }
      setShowSamplesModal(false);
    };
    img.src = sample.dataUrl;
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 select-none overflow-y-auto">
      {/* Panel Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wide">
              입력 파트 (Input & Prompt)
            </h2>
          </div>
          <button
            onClick={() => setShowSamplesModal(true)}
            className="text-[11px] font-medium text-yellow-400 hover:text-yellow-300 bg-yellow-400/10 hover:bg-yellow-400/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1 border border-yellow-400/20"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            샘플 불러오기
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* 1. Idea & Prompt Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <span>아이디어 & 작업 내용</span>
              <span className="text-[10px] text-neutral-400">(자연어 입력)</span>
            </label>
            {idea && (
              <button
                onClick={() => setIdea('')}
                className="text-[11px] text-neutral-400 hover:text-neutral-200"
              >
                지우기
              </button>
            )}
          </div>

          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="어떤 이미지를 원하시나요? 예: '오래된 흑백 사진을 선명하게 복원하고 자연스러운 피부색으로 컬러화해줘', '단정한 여권사진용으로 배경과 규격 맞춰줘', '바닷가 사진에 선글라스 낀 인물을 자연스럽게 합성해줘'"
            rows={3}
            className="w-full text-xs bg-neutral-950/80 border border-neutral-800 rounded-lg p-3 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/40 transition-all resize-none leading-relaxed"
          />

          {/* AI Automated Prompt Generator Button */}
          <button
            onClick={handleExpandPrompt}
            disabled={isGeneratingPrompt}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-bold text-neutral-900 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:brightness-105 active:scale-[0.99] disabled:opacity-50 transition-all shadow-md shadow-yellow-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGeneratingPrompt ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI가 나노바나나 정밀 프롬프트를 구성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                <span>AI 프롬프트 자동 생성 (나노바나나 최적화)</span>
              </>
            )}
          </button>

          {promptNotice && (
            <p className="text-[11px] text-amber-400/90 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {promptNotice}
            </p>
          )}

          {/* Expanded Prompt View */}
          {expandedPrompt && (
            <div className="p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800/80 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span className="text-yellow-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  생성된 나노바나나 프롬프트
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(expandedPrompt);
                    setPromptNotice('프롬프트가 클립보드에 복사되었습니다.');
                    setTimeout(() => setPromptNotice(null), 2000);
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  복사
                </button>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                {expandedPrompt}
              </p>

              {/* Tags */}
              {promptTags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {promptTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-yellow-300/80 border border-neutral-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Image Upload Section (Max 3) */}
        <div className="space-y-3 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
              <span>이미지 업로드</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                ({images.length}/3장)
              </span>
            </label>

            {images.length > 0 && (
              <button
                onClick={() => setImages([])}
                className="text-[10px] text-neutral-400 hover:text-rose-400 transition-colors"
              >
                전체 삭제
              </button>
            )}
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-yellow-400 bg-yellow-400/10'
                : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/60 hover:bg-neutral-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-10 h-10 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-400 group-hover:text-yellow-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-200">
                사진을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                PNG, JPG, WEBP 지원 (최대 3장 등록 가능)
              </p>
            </div>
          </div>

          {/* Uploaded Images List with Role Badges */}
          {images.length > 0 && (
            <div className="space-y-2 pt-1">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 flex items-center gap-3 relative group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 shrink-0 rounded-md overflow-hidden bg-neutral-900 border border-neutral-700/60">
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 text-[8px] font-mono px-1 bg-black/80 text-neutral-300">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Details & Role Selector */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-200 truncate">
                      {img.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {img.width ? `${img.width}×${img.height}px` : '업로드 완료'}
                    </p>

                    {/* Role Tag Selector */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <button
                        onClick={() => handleSetRole(img.id, 'primary')}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded transition-all ${
                          img.role === 'primary'
                            ? 'bg-yellow-400 text-neutral-950 font-bold shadow-sm'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        원본 사진
                      </button>
                      <button
                        onClick={() => handleSetRole(img.id, 'secondary')}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded transition-all ${
                          img.role === 'secondary'
                            ? 'bg-indigo-500 text-white font-bold shadow-sm'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        합성할 개체
                      </button>
                      <button
                        onClick={() => handleSetRole(img.id, 'style')}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded transition-all ${
                          img.role === 'style'
                            ? 'bg-purple-500 text-white font-bold shadow-sm'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        스타일/배경
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveImage(img.id)}
                    className="p-1 rounded-md text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                    title="이미지 삭제"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Slot Guide Helper */}
          <div className="p-2.5 rounded-lg bg-neutral-950/40 border border-neutral-800/60 text-[11px] text-neutral-400 space-y-1">
            <p className="font-semibold text-neutral-300">💡 나노바나나 다중 이미지 활용 팁:</p>
            <p>• <strong className="text-yellow-400">원본 사진</strong>: 복원, 컬러화, 여권사진, 인물 보정의 기준이 되는 사진입니다.</p>
            <p>• <strong className="text-indigo-400">합성할 개체</strong>: 원본 사진 속에 조명과 원근감을 일관되게 맞춰 합성할 추가 개체/인물입니다.</p>
          </div>
        </div>
      </div>

      {/* Preset Samples Modal */}
      {showSamplesModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  나노바나나 테스트용 샘플 이미지
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  클릭 한 번으로 원본 이미지를 로드하여 즉시 기능을 테스트할 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => setShowSamplesModal(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {PRESET_SAMPLES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  className="group p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-yellow-400/80 cursor-pointer transition-all hover:bg-neutral-800/50 flex flex-col justify-between"
                >
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-neutral-900 mb-2 border border-neutral-700/60 flex items-center justify-center">
                    <img
                      src={sample.dataUrl}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                      {sample.category}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-200 mt-1 truncate">
                      {sample.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">
                      {sample.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setShowSamplesModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
