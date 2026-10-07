export type EditMode =
  | 'synthesis'   // 이미지 생성 / 합성
  | 'restore'     // 사진 복원 / 업스케일 / 컬러화
  | 'bg_remove'   // 배경 제거 / 부분 삭제
  | 'poster'      // 텍스트 렌더링 포스터
  | 'passport'    // 여권사진 제작
  | 'studio'      // 스튜디오 사진 제작
  | 'retouch'     // 피부 보정
  | 'life_album'; // 인생 앨범 제작

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string;
  role: 'primary' | 'secondary' | 'style';
  width?: number;
  height?: number;
}

export interface SynthesisSettings {
  consistencyStrength: number; // 0 - 100
  blendMode: 'natural' | 'overlay' | 'subject_swap' | 'object_insert';
  lightingMatch: boolean;
  position: 'center' | 'left' | 'right' | 'auto';
}

export interface RestoreSettings {
  restoreNoise: boolean;
  colorize: boolean;
  scaleUpFactor: '1x' | '2x' | '4x';
  damageLevel: 'low' | 'medium' | 'high';
  sharpenFace: boolean;
}

export interface BgRemoveSettings {
  backgroundType: 'transparent' | 'pure_white' | 'studio_grey' | 'gradient' | 'custom_color';
  customColor: string;
  edgeFeather: number; // 0 - 10
}

export interface PosterSettings {
  titleText: string;
  subtitleText: string;
  fontStyle: 'modern_sans' | 'classic_serif' | 'cyber_neon' | 'vintage_stamp';
  textPosition: 'top' | 'center' | 'bottom';
  textColor: string;
  hasShadow: boolean;
}

export interface PassportSettings {
  country: 'korea' | 'international';
  bgColor: 'pure_white' | 'light_grey' | 'light_blue';
  clothingStyle: 'original' | 'suit_dark' | 'business_casual';
  showGuideOverlay: boolean;
  printGridFormat: 'single' | '4cut' | '8cut';
}

export interface StudioSettings {
  lightingStyle: 'rembrandt' | 'softbox' | 'cinematic_dark' | 'bright_beauty' | 'bw_fineart';
  backdropColor: 'warm_beige' | 'cool_grey' | 'midnight_navy' | 'charcoal';
  depthOfField: 'soft' | 'medium' | 'strong';
}

export interface RetouchSettings {
  blemishRemovalStrength: number; // 0 - 100
  skinSmoothing: number; // 0 - 100
  skinToneBrighter: boolean;
  eyeClarity: number; // 0 - 100
}

export interface LifeAlbumSettings {
  targetAge: number; // 3 to 85
  presetAgeGroup: 'toddler' | 'child' | 'teen' | 'young_adult' | 'middle_aged' | 'senior';
  identityRetention: number; // 0 - 100
  eraStyle: 'modern' | 'vintage_80s' | 'y2k' | 'classic_film';
}

export interface CommonOptions {
  aspectRatio: AspectRatio;
  numberOfImages: number;
}

export interface GenerationHistoryItem {
  id: string;
  title: string;
  mode: EditMode;
  prompt: string;
  originalImage: string;
  resultImage: string;
  secondaryImage?: string;
  createdAt: number;
  aspectRatio: AspectRatio;
  metadata?: {
    modelUsed?: string;
    processingTimeMs?: number;
    tags?: string[];
    settingsSummary?: string;
  };
  isFavorite?: boolean;
}
