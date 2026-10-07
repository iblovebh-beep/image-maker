import React from 'react';
import {
  Layers,
  Sparkles,
  Wand2,
  Sliders,
  RotateCcw,
  Palette,
  Scissors,
  Type,
  Camera,
  UserCheck,
  Smile,
  Calendar,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  EditMode,
  AspectRatio,
  SynthesisSettings,
  RestoreSettings,
  BgRemoveSettings,
  PosterSettings,
  PassportSettings,
  StudioSettings,
  RetouchSettings,
  LifeAlbumSettings,
  CommonOptions,
} from '../types';

interface ControlPanelProps {
  activeMode: EditMode;
  setActiveMode: (mode: EditMode) => void;
  synthesisSettings: SynthesisSettings;
  setSynthesisSettings: React.Dispatch<React.SetStateAction<SynthesisSettings>>;
  restoreSettings: RestoreSettings;
  setRestoreSettings: React.Dispatch<React.SetStateAction<RestoreSettings>>;
  bgRemoveSettings: BgRemoveSettings;
  setBgRemoveSettings: React.Dispatch<React.SetStateAction<BgRemoveSettings>>;
  posterSettings: PosterSettings;
  setPosterSettings: React.Dispatch<React.SetStateAction<PosterSettings>>;
  passportSettings: PassportSettings;
  setPassportSettings: React.Dispatch<React.SetStateAction<PassportSettings>>;
  studioSettings: StudioSettings;
  setStudioSettings: React.Dispatch<React.SetStateAction<StudioSettings>>;
  retouchSettings: RetouchSettings;
  setRetouchSettings: React.Dispatch<React.SetStateAction<RetouchSettings>>;
  lifeAlbumSettings: LifeAlbumSettings;
  setLifeAlbumSettings: React.Dispatch<React.SetStateAction<LifeAlbumSettings>>;
  commonOptions: CommonOptions;
  setCommonOptions: React.Dispatch<React.SetStateAction<CommonOptions>>;
  onResetAll: () => void;
  onGenerate: () => void;
  isProcessing: boolean;
  hasInputImage: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  activeMode,
  setActiveMode,
  synthesisSettings,
  setSynthesisSettings,
  restoreSettings,
  setRestoreSettings,
  bgRemoveSettings,
  setBgRemoveSettings,
  posterSettings,
  setPosterSettings,
  passportSettings,
  setPassportSettings,
  studioSettings,
  setStudioSettings,
  retouchSettings,
  setRetouchSettings,
  lifeAlbumSettings,
  setLifeAlbumSettings,
  commonOptions,
  setCommonOptions,
  onResetAll,
  onGenerate,
  isProcessing,
  hasInputImage,
}) => {
  const modes: { id: EditMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'synthesis', label: '이미지 합성', icon: <Layers className="w-4 h-4" />, badge: '일관성' },
    { id: 'restore', label: '사진 복원·컬러화', icon: <Sparkles className="w-4 h-4" />, badge: '4K 업스케일' },
    { id: 'bg_remove', label: '배경 제거', icon: <Scissors className="w-4 h-4" /> },
    { id: 'poster', label: '포스터 텍스트', icon: <Type className="w-4 h-4" /> },
    { id: 'passport', label: '여권사진 제작', icon: <UserCheck className="w-4 h-4" />, badge: '규격 준수' },
    { id: 'studio', label: '스튜디오 사진', icon: <Camera className="w-4 h-4" /> },
    { id: 'retouch', label: '피부 트러블 보정', icon: <Smile className="w-4 h-4" /> },
    { id: 'life_album', label: '인생 앨범 (연령)', icon: <Calendar className="w-4 h-4" />, badge: '나이 변환' },
  ];

  const aspectRatios: { id: AspectRatio; label: string }[] = [
    { id: '1:1', label: '1:1 (정사각형)' },
    { id: '4:3', label: '4:3 (표준)' },
    { id: '3:4', label: '3:4 (인물 세로)' },
    { id: '16:9', label: '16:9 (와이드)' },
    { id: '9:16', label: '9:16 (스마트폰)' },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
            2
          </span>
          <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wide">
            제어 파트 (NanoBanana Engine)
          </h2>
        </div>
        <button
          onClick={onResetAll}
          className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 hover:bg-neutral-800 px-2 py-1 rounded transition-colors"
          title="모든 옵션 기본값으로 초기화"
        >
          <RotateCcw className="w-3 h-3" />
          초기화
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Mode Selector Tabs (Grid of buttons) */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 mb-2 block">
            작업 모드 선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            {modes.map((m) => {
              const isSelected = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-400/15 border-yellow-400 text-yellow-300 shadow-sm ring-1 ring-yellow-400/50'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={isSelected ? 'text-yellow-400' : 'text-neutral-400'}>
                      {m.icon}
                    </div>
                    {m.badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-800 text-neutral-300">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold mt-2">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Mode Controls */}
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-4">
          {/* 1. Synthesis Controls */}
          {activeMode === 'synthesis' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  자연스러운 이미지 합성 & 개체 결합
                </h3>
              </div>
              <p className="text-[11px] text-neutral-400">
                원본 사진과 합성용 개체의 빛 방향, 원근감, 색온도를 정밀하게 일치시켜 일관성을 유지합니다.
              </p>

              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>일관성 유지 강도 (Consistency)</span>
                  <span className="font-mono text-yellow-400">
                    {synthesisSettings.consistencyStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={synthesisSettings.consistencyStrength}
                  onChange={(e) =>
                    setSynthesisSettings((prev) => ({
                      ...prev,
                      consistencyStrength: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">합성 위치</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['auto', 'center', 'left', 'right'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() =>
                        setSynthesisSettings((prev) => ({ ...prev, position: pos }))
                      }
                      className={`py-1 text-[11px] rounded capitalize ${
                        synthesisSettings.position === pos
                          ? 'bg-yellow-400 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      {pos === 'auto' ? '자동' : pos === 'center' ? '중앙' : pos === 'left' ? '좌측' : '우측'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-300">조명 및 그림자 일치</span>
                <input
                  type="checkbox"
                  checked={synthesisSettings.lightingMatch}
                  onChange={(e) =>
                    setSynthesisSettings((prev) => ({
                      ...prev,
                      lightingMatch: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 2. Restoration & Colorize & Upscale Controls */}
          {activeMode === 'restore' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  오래된 사진 복원 / 업스케일 / 컬러화
                </h3>
              </div>

              {/* Action Buttons requested in spec */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRestoreSettings((prev) => ({ ...prev, restoreNoise: !prev.restoreNoise }))
                  }
                  className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    restoreSettings.restoreNoise
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  흠집·노이즈 복원
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setRestoreSettings((prev) => ({ ...prev, colorize: !prev.colorize }))
                  }
                  className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    restoreSettings.colorize
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  자연스러운 컬러화
                </button>
              </div>

              {/* Scale Up Selector */}
              <div>
                <label className="text-xs text-neutral-300 block mb-1">
                  Scale Up (초고화질 업스케일 배율)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['1x', '2x', '4x'] as const).map((factor) => (
                    <button
                      key={factor}
                      onClick={() =>
                        setRestoreSettings((prev) => ({ ...prev, scaleUpFactor: factor }))
                      }
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        restoreSettings.scaleUpFactor === factor
                          ? 'bg-emerald-400 text-neutral-950 border-emerald-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {factor} {factor === '4x' ? '(Ultra HD)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-300">얼굴 윤곽·눈매 정밀 선명화</span>
                <input
                  type="checkbox"
                  checked={restoreSettings.sharpenFace}
                  onChange={(e) =>
                    setRestoreSettings((prev) => ({
                      ...prev,
                      sharpenFace: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 3. Background Removal Controls */}
          {activeMode === 'bg_remove' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4" />
                  배경 제거 & 부분 삭제 (클린업)
                </h3>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">배경 스타일 선택</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'transparent', label: '투명 배경' },
                    { id: 'pure_white', label: '순백색' },
                    { id: 'studio_grey', label: '스튜디오 차콜' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() =>
                        setBgRemoveSettings((prev) => ({
                          ...prev,
                          backgroundType: bg.id as any,
                        }))
                      }
                      className={`py-1.5 text-[11px] rounded-lg border ${
                        bgRemoveSettings.backgroundType === bg.id
                          ? 'bg-rose-400 text-neutral-950 font-bold border-rose-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>가장자리 부드러움 (Edge Feathering)</span>
                  <span className="font-mono text-rose-400">
                    {bgRemoveSettings.edgeFeather}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={bgRemoveSettings.edgeFeather}
                  onChange={(e) =>
                    setBgRemoveSettings((prev) => ({
                      ...prev,
                      edgeFeather: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 4. Text Rendering Poster Controls */}
          {activeMode === 'poster' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Type className="w-4 h-4" />
                  텍스트 렌더링 포스터 (로고 & 포스터 제작)
                </h3>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">메인 타이틀 텍스트</label>
                <input
                  type="text"
                  value={posterSettings.titleText}
                  onChange={(e) =>
                    setPosterSettings((prev) => ({ ...prev, titleText: e.target.value }))
                  }
                  placeholder="예: SUMMER VIBES, NANOBANANA"
                  className="w-full text-xs bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">서브 카피 텍스트</label>
                <input
                  type="text"
                  value={posterSettings.subtitleText}
                  onChange={(e) =>
                    setPosterSettings((prev) => ({ ...prev, subtitleText: e.target.value }))
                  }
                  placeholder="예: SPECIAL EDITION 2026"
                  className="w-full text-xs bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">폰트 무드</label>
                  <select
                    value={posterSettings.fontStyle}
                    onChange={(e) =>
                      setPosterSettings((prev) => ({
                        ...prev,
                        fontStyle: e.target.value as any,
                      }))
                    }
                    className="w-full text-xs bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="modern_sans">모던 볼드 산세리프</option>
                    <option value="classic_serif">클래식 엘레강스 세리프</option>
                    <option value="cyber_neon">사이버 네온 글로우</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">텍스트 위치</label>
                  <select
                    value={posterSettings.textPosition}
                    onChange={(e) =>
                      setPosterSettings((prev) => ({
                        ...prev,
                        textPosition: e.target.value as any,
                      }))
                    }
                    className="w-full text-xs bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-200"
                  >
                    <option value="top">상단 헤더</option>
                    <option value="center">중앙 강조</option>
                    <option value="bottom">하단 로고</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. Passport Photo Studio Controls */}
          {activeMode === 'passport' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  여권사진 제작 (규격 3.5cm x 4.5cm)
                </h3>
              </div>
              <p className="text-[11px] text-neutral-400">
                외교부 및 국제민간항공기구(ICAO) 표준 여권 규격에 맞춰 흰색 배경 정렬 및 정면 구도를 세팅합니다.
              </p>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">배경색 규격</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'pure_white', label: '순백색 (표준)' },
                    { id: 'light_grey', label: '연회색' },
                    { id: 'light_blue', label: '연하늘색' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        setPassportSettings((prev) => ({
                          ...prev,
                          bgColor: c.id as any,
                        }))
                      }
                      className={`py-1.5 text-[11px] rounded-lg border ${
                        passportSettings.bgColor === c.id
                          ? 'bg-sky-400 text-neutral-950 font-bold border-sky-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">출력 시트 형식</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'single', label: '단일 여권사진' },
                    { id: '4cut', label: '4구 인화시트' },
                    { id: '8cut', label: '8구 인화시트' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() =>
                        setPassportSettings((prev) => ({
                          ...prev,
                          printGridFormat: fmt.id as any,
                        }))
                      }
                      className={`py-1.5 text-[11px] rounded-lg border ${
                        passportSettings.printGridFormat === fmt.id
                          ? 'bg-sky-400 text-neutral-950 font-bold border-sky-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-300">정수리-턱선 규격 가이드라인 표시</span>
                <input
                  type="checkbox"
                  checked={passportSettings.showGuideOverlay}
                  onChange={(e) =>
                    setPassportSettings((prev) => ({
                      ...prev,
                      showGuideOverlay: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 6. Studio Photo Controls */}
          {activeMode === 'studio' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  스튜디오 사진 제작 (프로필 스튜디오)
                </h3>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">스튜디오 조명 스타일</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'rembrandt', label: '렘브란트 클래식' },
                    { id: 'softbox', label: '소프트박스 뷰티' },
                    { id: 'cinematic_dark', label: '시네마틱 무드' },
                    { id: 'bw_fineart', label: '파인아트 흑백' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() =>
                        setStudioSettings((prev) => ({
                          ...prev,
                          lightingStyle: st.id as any,
                        }))
                      }
                      className={`py-1.5 text-[11px] rounded-lg border ${
                        studioSettings.lightingStyle === st.id
                          ? 'bg-purple-400 text-neutral-950 font-bold border-purple-400'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1">배경 톤</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'warm_beige', label: '웜 베이지' },
                    { id: 'cool_grey', label: '쿨 그레이' },
                    { id: 'midnight_navy', label: '다크 네이비' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() =>
                        setStudioSettings((prev) => ({
                          ...prev,
                          backdropColor: bg.id as any,
                        }))
                      }
                      className={`py-1 text-[11px] rounded ${
                        studioSettings.backdropColor === bg.id
                          ? 'bg-purple-400 text-neutral-950 font-bold'
                          : 'bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. Skin Retouch Controls */}
          {activeMode === 'retouch' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                  <Smile className="w-4 h-4" />
                  피부 보정 (여드름 및 피부트러블 삭제)
                </h3>
              </div>

              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>여드름·트러블 제거 강도</span>
                  <span className="font-mono text-pink-400">
                    {retouchSettings.blemishRemovalStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={retouchSettings.blemishRemovalStrength}
                  onChange={(e) =>
                    setRetouchSettings((prev) => ({
                      ...prev,
                      blemishRemovalStrength: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-pink-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span>피부결 매끄러움 (Texture Smooth)</span>
                  <span className="font-mono text-pink-400">
                    {retouchSettings.skinSmoothing}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={retouchSettings.skinSmoothing}
                  onChange={(e) =>
                    setRetouchSettings((prev) => ({
                      ...prev,
                      skinSmoothing: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-pink-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-neutral-300">화사하고 맑은 피부 톤업</span>
                <input
                  type="checkbox"
                  checked={retouchSettings.skinToneBrighter}
                  onChange={(e) =>
                    setRetouchSettings((prev) => ({
                      ...prev,
                      skinToneBrighter: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 accent-pink-400 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 8. Life Album Age Controls */}
          {activeMode === 'life_album' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2">
                <h3 className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  인생 앨범 제작 (나이대 변형 & 일관성 유지)
                </h3>
              </div>
              <p className="text-[11px] text-neutral-400">
                사진 속 인물의 본래 이목구비 골격을 보존하며, 입력한 나이에 맞춰 성장하거나 원숙해지는 인생 앨범을 생성합니다.
              </p>

              <div>
                <div className="flex justify-between text-xs text-neutral-300 mb-1">
                  <span className="font-semibold">원하는 나이 설정</span>
                  <span className="font-mono text-sm font-bold text-orange-400">
                    {lifeAlbumSettings.targetAge}세
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={lifeAlbumSettings.targetAge}
                  onChange={(e) =>
                    setLifeAlbumSettings((prev) => ({
                      ...prev,
                      targetAge: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-orange-400 cursor-pointer"
                />
              </div>

              {/* Age Presets */}
              <div className="grid grid-cols-4 gap-1">
                {[
                  { age: 7, label: '7세 유년기' },
                  { age: 18, label: '18세 고교' },
                  { age: 25, label: '25세 리즈' },
                  { age: 70, label: '70세 황혼' },
                ].map((p) => (
                  <button
                    key={p.age}
                    onClick={() =>
                      setLifeAlbumSettings((prev) => ({
                        ...prev,
                        targetAge: p.age,
                      }))
                    }
                    className={`py-1 text-[11px] rounded ${
                      lifeAlbumSettings.targetAge === p.age
                        ? 'bg-orange-400 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Common Generation Options */}
        <div className="space-y-3 pt-2 border-t border-neutral-800">
          <label className="text-xs font-semibold text-neutral-300 block">
            공통 생성 옵션
          </label>

          {/* Aspect Ratio */}
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">화면 비율</label>
            <div className="grid grid-cols-3 gap-1.5">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() =>
                    setCommonOptions((prev) => ({ ...prev, aspectRatio: ar.id }))
                  }
                  className={`py-1.5 text-[11px] rounded-lg border font-mono transition-all ${
                    commonOptions.aspectRatio === ar.id
                      ? 'bg-neutral-800 border-yellow-400 text-yellow-300 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  {ar.id}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Images */}
          <div>
            <label className="text-[11px] text-neutral-400 block mb-1">생성 장수</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 4].map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    setCommonOptions((prev) => ({ ...prev, numberOfImages: n }))
                  }
                  className={`py-1 text-xs rounded-lg border font-medium ${
                    commonOptions.numberOfImages === n
                      ? 'bg-neutral-800 border-yellow-400 text-yellow-300 font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  {n}장 생성
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate CTA Button */}
        <div className="pt-2">
          <button
            onClick={onGenerate}
            disabled={isProcessing || !hasInputImage}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              !hasInputImage
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700/50'
                : isProcessing
                ? 'bg-yellow-500/80 text-neutral-900 cursor-wait'
                : 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-neutral-950 hover:brightness-110 active:scale-[0.99] shadow-yellow-500/20'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>나노바나나 엔진 변환 처리 중...</span>
              </>
            ) : !hasInputImage ? (
              <span>입력 파트에 사진을 먼저 등록해주세요</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-neutral-950" />
                <span>나노바나나 AI 처리 시작</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
