import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  HelpCircle,
  FolderOpen,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { ControlPanel } from './components/ControlPanel';
import { ResultPanel } from './components/ResultPanel';
import {
  EditMode,
  UploadedImage,
  SynthesisSettings,
  RestoreSettings,
  BgRemoveSettings,
  PosterSettings,
  PassportSettings,
  StudioSettings,
  RetouchSettings,
  LifeAlbumSettings,
  CommonOptions,
  GenerationHistoryItem,
} from './types';
import { processImageLocally } from './utils/imageEngine';
import { PRESET_SAMPLES } from './utils/sampleData';

const LOCAL_STORAGE_KEY = 'nanobanana_history_v1';

export default function App() {
  // 1. Input Panel State
  const [idea, setIdea] = useState<string>('');
  const [expandedPrompt, setExpandedPrompt] = useState<string>('');
  const [promptTags, setPromptTags] = useState<string[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);

  // 2. Control Panel State
  const [activeMode, setActiveMode] = useState<EditMode>('restore');

  const [synthesisSettings, setSynthesisSettings] = useState<SynthesisSettings>({
    consistencyStrength: 85,
    blendMode: 'natural',
    lightingMatch: true,
    position: 'auto',
  });

  const [restoreSettings, setRestoreSettings] = useState<RestoreSettings>({
    restoreNoise: true,
    colorize: true,
    scaleUpFactor: '2x',
    damageLevel: 'medium',
    sharpenFace: true,
  });

  const [bgRemoveSettings, setBgRemoveSettings] = useState<BgRemoveSettings>({
    backgroundType: 'pure_white',
    customColor: '#ffffff',
    edgeFeather: 2,
  });

  const [posterSettings, setPosterSettings] = useState<PosterSettings>({
    titleText: 'NANOBANANA STUDIO',
    subtitleText: 'AI CONSISTENCY ENGINE',
    fontStyle: 'modern_sans',
    textPosition: 'bottom',
    textColor: '#ffffff',
    hasShadow: true,
  });

  const [passportSettings, setPassportSettings] = useState<PassportSettings>({
    country: 'korea',
    bgColor: 'pure_white',
    clothingStyle: 'original',
    showGuideOverlay: true,
    printGridFormat: 'single',
  });

  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    lightingStyle: 'rembrandt',
    backdropColor: 'warm_beige',
    depthOfField: 'medium',
  });

  const [retouchSettings, setRetouchSettings] = useState<RetouchSettings>({
    blemishRemovalStrength: 80,
    skinSmoothing: 60,
    skinToneBrighter: true,
    eyeClarity: 75,
  });

  const [lifeAlbumSettings, setLifeAlbumSettings] = useState<LifeAlbumSettings>({
    targetAge: 25,
    presetAgeGroup: 'young_adult',
    identityRetention: 95,
    eraStyle: 'modern',
  });

  const [commonOptions, setCommonOptions] = useState<CommonOptions>({
    aspectRatio: '1:1',
    numberOfImages: 1,
  });

  // 3. Result Panel & History State
  const [history, setHistory] = useState<GenerationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentResult, setCurrentResult] = useState<string | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Load default sample if images empty on initial load
  useEffect(() => {
    if (images.length === 0 && PRESET_SAMPLES.length > 0) {
      const sample = PRESET_SAMPLES[0];
      setImages([
        {
          id: 'initial_sample',
          name: sample.name,
          dataUrl: sample.dataUrl,
          role: 'primary',
          width: 600,
          height: 750,
        },
      ]);
      setIdea('오래된 흑백 인물 사진의 스크래치를 복원하고 자연스러운 피부색으로 컬러화해줘');
    }
  }, []);

  const primaryImage = images.find((img) => img.role === 'primary')?.dataUrl || images[0]?.dataUrl || null;
  const secondaryImage = images.find((img) => img.role === 'secondary')?.dataUrl || null;

  // Handle Generate
  const handleGenerate = async () => {
    if (!primaryImage) {
      alert('입력 파트에 최소 1장의 원본 사진을 등록해주세요.');
      return;
    }

    setIsProcessing(true);
    setStatusNotice('나노바나나 엔진으로 일관성 유지 렌더링을 진행합니다...');

    try {
      // Step 1: Attempt Cloud NanoBanana Gemini API
      let finalResultUrl: string | null = null;
      let modelUsed = 'NanoBanana Local Precision Engine';

      try {
        const cloudRes = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: expandedPrompt || idea || `${activeMode} enhancement`,
            aspectRatio: commonOptions.aspectRatio,
            primaryImage,
            secondaryImage,
            mode: activeMode,
          }),
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.success && cloudData.imageUrl) {
            finalResultUrl = cloudData.imageUrl;
            modelUsed = cloudData.modelUsed || 'gemini-3.1-flash-lite-image';
          }
        }
      } catch {
        // Fallback to local precision engine
      }

      // Step 2: If cloud model not returning image (e.g. quota or offline), execute high-grade local engine
      if (!finalResultUrl) {
        finalResultUrl = await processImageLocally({
          mode: activeMode,
          primaryImage,
          secondaryImage: secondaryImage || undefined,
          aspectRatio: commonOptions.aspectRatio,
          synthesisSettings,
          restoreSettings,
          bgRemoveSettings,
          posterSettings,
          passportSettings,
          studioSettings,
          retouchSettings,
          lifeAlbumSettings,
        });
      }

      // Step 3: Create History Item
      const newHistoryItem: GenerationHistoryItem = {
        id: `gen_${Date.now()}`,
        title: getModeTitle(activeMode, lifeAlbumSettings.targetAge),
        mode: activeMode,
        prompt: expandedPrompt || idea || `${activeMode} 변환`,
        originalImage: primaryImage,
        secondaryImage: secondaryImage || undefined,
        resultImage: finalResultUrl,
        createdAt: Date.now(),
        aspectRatio: commonOptions.aspectRatio,
        metadata: {
          modelUsed,
          processingTimeMs: 1200,
          settingsSummary: `${activeMode} - ${commonOptions.aspectRatio}`,
        },
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      setCurrentResult(finalResultUrl);
      setActiveHistoryId(newHistoryItem.id);
      setStatusNotice(null);
    } catch (err: any) {
      console.error('Generation failure:', err);
      alert('생성 처리 중 오류가 발생했습니다: ' + (err.message || '다시 시도해주세요.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const getModeTitle = (mode: EditMode, age: number) => {
    switch (mode) {
      case 'synthesis':
        return '개체 합성 & 일관성 유지';
      case 'restore':
        return '오래된 사진 복원 및 컬러화';
      case 'bg_remove':
        return '배경 제거 및 스튜디오 클린업';
      case 'poster':
        return '타이포그래피 포스터 렌더링';
      case 'passport':
        return '규격 여권사진 (3.5x4.5cm)';
      case 'studio':
        return '프로필 스튜디오 사진';
      case 'retouch':
        return '피부 트러블 정밀 보정';
      case 'life_album':
        return `인생 앨범 (${age}세 변환)`;
      default:
        return '나노바나나 변환';
    }
  };

  // Top-Right Refresh handler
  const handleRefresh = () => {
    if (activeHistoryId) {
      const active = history.find((h) => h.id === activeHistoryId);
      if (active) {
        setCurrentResult(active.resultImage);
      }
    } else if (history.length > 0) {
      setCurrentResult(history[0].resultImage);
      setActiveHistoryId(history[0].id);
    } else if (primaryImage) {
      // Re-run current settings
      handleGenerate();
    }
  };

  // Use Result as Input (Chain editing)
  const handleUseAsInput = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      setImages((prev) => [
        {
          id: `chained_${Date.now()}`,
          name: `이전 결과물 (#${images.length + 1})`,
          dataUrl: imageUrl,
          role: 'primary',
          width: img.naturalWidth,
          height: img.naturalHeight,
        },
        ...prev.filter((i) => i.role !== 'primary'),
      ]);
      alert('선택한 결과물이 입력 파트의 [원본 사진]으로 지정되었습니다! 추가 편집을 진행하세요.');
    };
    img.src = imageUrl;
  };

  // Reset All
  const handleResetAll = () => {
    if (confirm('모든 제어 옵션을 기본값으로 초기화하시겠습니까?')) {
      setSynthesisSettings({
        consistencyStrength: 85,
        blendMode: 'natural',
        lightingMatch: true,
        position: 'auto',
      });
      setRestoreSettings({
        restoreNoise: true,
        colorize: true,
        scaleUpFactor: '2x',
        damageLevel: 'medium',
        sharpenFace: true,
      });
      setPassportSettings({
        country: 'korea',
        bgColor: 'pure_white',
        clothingStyle: 'original',
        showGuideOverlay: true,
        printGridFormat: 'single',
      });
      setStudioSettings({
        lightingStyle: 'rembrandt',
        backdropColor: 'warm_beige',
        depthOfField: 'medium',
      });
      setRetouchSettings({
        blemishRemovalStrength: 80,
        skinSmoothing: 60,
        skinToneBrighter: true,
        eyeClarity: 75,
      });
      setLifeAlbumSettings({
        targetAge: 25,
        presetAgeGroup: 'young_adult',
        identityRetention: 95,
        eraStyle: 'modern',
      });
      setCommonOptions({
        aspectRatio: '1:1',
        numberOfImages: 1,
      });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Studio Global App Bar */}
      <header className="h-13 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 text-neutral-950 font-black flex items-center justify-center text-sm shadow-md shadow-yellow-500/20">
            🍌
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white flex items-center gap-2">
              <span>나노바나나 AI 스튜디오</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                NanoBanana 2 Pro
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 hidden sm:block">
              일관성 유지 합성 · 오래된 사진 복원 & 컬러화 · 여권사진 · 인생 앨범
            </p>
          </div>
        </div>

        {/* Engine status & quick badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs bg-neutral-950/80 px-2.5 py-1 rounded-full border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-neutral-300 font-mono">
              Identity Consistency Engine Active
            </span>
          </div>

          <button
            onClick={() => {
              if (PRESET_SAMPLES.length > 1) {
                // Toggle between vintage and passport sample
                const nextSample = images[0]?.name.includes('빈티지')
                  ? PRESET_SAMPLES[1]
                  : PRESET_SAMPLES[0];
                setImages([
                  {
                    id: nextSample.id,
                    name: nextSample.name,
                    dataUrl: nextSample.dataUrl,
                    role: 'primary',
                  },
                ]);
                setActiveMode(nextSample.recommendedMode as EditMode);
              }
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700/60 flex items-center gap-1.5"
            title="다른 샘플 사진으로 빠른 교체"
          >
            <FolderOpen className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">샘플 전환</span>
          </button>
        </div>
      </header>

      {/* Main 3-Part Workbench Layout */}
      <main className="flex-1 flex flex-row min-h-0 w-full overflow-hidden">
        {/* Part 1: Left Input Panel (Width: 340px) */}
        <div className="w-80 md:w-88 shrink-0 h-full">
          <InputPanel
            idea={idea}
            setIdea={setIdea}
            expandedPrompt={expandedPrompt}
            setExpandedPrompt={setExpandedPrompt}
            promptTags={promptTags}
            setPromptTags={setPromptTags}
            images={images}
            setImages={setImages}
            activeMode={activeMode}
            onSelectMode={setActiveMode}
          />
        </div>

        {/* Part 2: Middle Control Panel (Width: 390px) */}
        <div className="w-88 md:w-98 shrink-0 h-full">
          <ControlPanel
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            synthesisSettings={synthesisSettings}
            setSynthesisSettings={setSynthesisSettings}
            restoreSettings={restoreSettings}
            setRestoreSettings={setRestoreSettings}
            bgRemoveSettings={bgRemoveSettings}
            setBgRemoveSettings={setBgRemoveSettings}
            posterSettings={posterSettings}
            setPosterSettings={setPosterSettings}
            passportSettings={passportSettings}
            setPassportSettings={setPassportSettings}
            studioSettings={studioSettings}
            setStudioSettings={setStudioSettings}
            retouchSettings={retouchSettings}
            setRetouchSettings={setRetouchSettings}
            lifeAlbumSettings={lifeAlbumSettings}
            setLifeAlbumSettings={setLifeAlbumSettings}
            commonOptions={commonOptions}
            setCommonOptions={setCommonOptions}
            onResetAll={handleResetAll}
            onGenerate={handleGenerate}
            isProcessing={isProcessing}
            hasInputImage={!!primaryImage}
          />
        </div>

        {/* Part 3: Right Result Panel with Embedded Vertical History Sidebar (Flex-1) */}
        <div className="flex-1 min-w-0 h-full">
          <ResultPanel
            currentResult={currentResult}
            originalImage={primaryImage}
            secondaryImage={secondaryImage}
            history={history}
            activeHistoryId={activeHistoryId}
            onSelectHistory={(item) => {
              setCurrentResult(item.resultImage);
              setActiveHistoryId(item.id);
            }}
            onDeleteHistory={(id) => {
              setHistory((prev) => prev.filter((item) => item.id !== id));
              if (activeHistoryId === id) {
                const remaining = history.filter((item) => item.id !== id);
                if (remaining.length > 0) {
                  setCurrentResult(remaining[0].resultImage);
                  setActiveHistoryId(remaining[0].id);
                } else {
                  setCurrentResult(null);
                  setActiveHistoryId(null);
                }
              }
            }}
            onClearHistory={() => {
              if (confirm('모든 생성물 히스토리를 삭제하시겠습니까?')) {
                setHistory([]);
                setCurrentResult(null);
                setActiveHistoryId(null);
              }
            }}
            onToggleFavorite={(id) => {
              setHistory((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
                )
              );
            }}
            onUseAsInput={handleUseAsInput}
            onRefresh={handleRefresh}
            isProcessing={isProcessing}
            activeMode={activeMode}
            showPassportGuide={passportSettings.showGuideOverlay}
            activePrompt={expandedPrompt || idea}
          />
        </div>
      </main>
    </div>
  );
}
