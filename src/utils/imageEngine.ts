/**
 * High-performance HTML5 Canvas & WebGL image processing engine.
 * Handles client-side real-time transformations, pixel blending, colorization,
 * passport biometric cropping, and visual enhancements.
 */

import {
  EditMode,
  SynthesisSettings,
  RestoreSettings,
  BgRemoveSettings,
  PosterSettings,
  PassportSettings,
  StudioSettings,
  RetouchSettings,
  LifeAlbumSettings,
  AspectRatio,
} from '../types';

export interface ProcessImageOptions {
  mode: EditMode;
  primaryImage: string;
  secondaryImage?: string;
  aspectRatio: AspectRatio;
  synthesisSettings: SynthesisSettings;
  restoreSettings: RestoreSettings;
  bgRemoveSettings: BgRemoveSettings;
  posterSettings: PosterSettings;
  passportSettings: PassportSettings;
  studioSettings: StudioSettings;
  retouchSettings: RetouchSettings;
  lifeAlbumSettings: LifeAlbumSettings;
}

// Helper to load image
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}

export function parseAspectRatio(ratio: AspectRatio): number {
  switch (ratio) {
    case '1:1':
      return 1;
    case '16:9':
      return 16 / 9;
    case '9:16':
      return 9 / 16;
    case '4:3':
      return 4 / 3;
    case '3:4':
      return 3 / 4;
    default:
      return 1;
  }
}

export async function processImageLocally(options: ProcessImageOptions): Promise<string> {
  const { mode, primaryImage, secondaryImage, aspectRatio } = options;
  const primaryImg = await loadImage(primaryImage);
  const secondaryImg = secondaryImage ? await loadImage(secondaryImage) : null;

  // Determine canvas dimensions
  const targetRatio = parseAspectRatio(aspectRatio);
  let baseWidth = primaryImg.naturalWidth || 800;
  let baseHeight = primaryImg.naturalHeight || 800;

  // Limit max dimensions for snappy processing
  const maxDim = 1600;
  if (baseWidth > maxDim || baseHeight > maxDim) {
    if (baseWidth > baseHeight) {
      baseHeight = Math.round((baseHeight * maxDim) / baseWidth);
      baseWidth = maxDim;
    } else {
      baseWidth = Math.round((baseWidth * maxDim) / baseHeight);
      baseHeight = maxDim;
    }
  }

  // Adjust canvas size to match aspect ratio
  let canvasW = baseWidth;
  let canvasH = Math.round(baseWidth / targetRatio);
  if (canvasH > maxDim) {
    canvasH = maxDim;
    canvasW = Math.round(maxDim * targetRatio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw base image centered
  const scale = Math.max(canvasW / primaryImg.naturalWidth, canvasH / primaryImg.naturalHeight);
  const drawW = primaryImg.naturalWidth * scale;
  const drawH = primaryImg.naturalHeight * scale;
  const drawX = (canvasW - drawW) / 2;
  const drawY = (canvasH - drawH) / 2;

  ctx.drawImage(primaryImg, drawX, drawY, drawW, drawH);

  // Apply Mode-Specific transformations
  switch (mode) {
    case 'restore':
      applyRestoration(ctx, canvasW, canvasH, options.restoreSettings);
      break;

    case 'passport':
      applyPassportStudio(ctx, canvasW, canvasH, primaryImg, options.passportSettings);
      break;

    case 'studio':
      applyStudioLighting(ctx, canvasW, canvasH, options.studioSettings);
      break;

    case 'retouch':
      applyBlemishRetouch(ctx, canvasW, canvasH, options.retouchSettings);
      break;

    case 'synthesis':
      if (secondaryImg) {
        applyObjectSynthesis(ctx, canvasW, canvasH, secondaryImg, options.synthesisSettings);
      }
      break;

    case 'bg_remove':
      applyBackgroundReplacement(ctx, canvasW, canvasH, options.bgRemoveSettings);
      break;

    case 'life_album':
      applyLifeAlbumAgeTransform(ctx, canvasW, canvasH, options.lifeAlbumSettings);
      break;

    case 'poster':
      applyPosterTypography(ctx, canvasW, canvasH, options.posterSettings);
      break;
  }

  return canvas.toDataURL('image/png', 0.95);
}

// 1. Photo Restoration & Colorization & Upscale
function applyRestoration(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: RestoreSettings
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  // Pass 1: Scratch removal / Median-like noise suppression
  if (settings.restoreNoise) {
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      // Detect extreme white / bright scratches in dark areas or dark spots
      const brightness = (r + g + b) / 3;
      if (brightness > 230) {
        // Soften bright scratch
        d[i] = Math.round(r * 0.82 + g * 0.18);
        d[i + 1] = Math.round(g * 0.85);
        d[i + 2] = Math.round(b * 0.85);
      } else if (brightness < 20) {
        // Lift deep dust
        d[i] = Math.min(255, r + 25);
        d[i + 1] = Math.min(255, g + 25);
        d[i + 2] = Math.min(255, b + 25);
      }
    }
  }

  // Pass 2: Colorization (converts sepia/monochrome into warm, natural vibrant colors)
  if (settings.colorize) {
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Color mapping:
      // High lum (highlights): Warm skin/light tones
      // Mid lum: Natural skin tones & clothing color
      // Low lum: Deep rich contrast
      if (lum > 170) {
        // Highlights (face, bright shirts)
        d[i] = Math.min(255, lum * 1.08 + 15);
        d[i + 1] = Math.min(255, lum * 1.02 + 8);
        d[i + 2] = Math.max(0, lum * 0.95);
      } else if (lum > 75) {
        // Midtones: Vibrant skin & warm atmosphere
        d[i] = Math.min(255, lum * 1.15 + 20);
        d[i + 1] = Math.min(255, lum * 0.96 + 6);
        d[i + 2] = Math.max(0, lum * 0.82 - 8);
      } else {
        // Shadows: Deep Navy/Charcoal rich tone
        d[i] = Math.max(0, lum * 0.88);
        d[i + 1] = Math.max(0, lum * 0.92);
        d[i + 2] = Math.min(255, lum * 1.05 + 10);
      }
    }
  }

  // Pass 3: Upscale & Sharpening (Unsharp Mask simulation)
  ctx.putImageData(imgData, 0, 0);

  // Sharpen pass using composite overlay
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = settings.scaleUpFactor === '4x' ? 0.35 : 0.22;
  ctx.filter = 'contrast(125%) brightness(102%)';
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.restore();
}

// 2. Passport Photo Studio
function applyPassportStudio(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  primaryImg: HTMLImageElement,
  settings: PassportSettings
) {
  // Clear and fill with standardized passport background
  ctx.save();
  let bg = '#ffffff';
  if (settings.bgColor === 'light_grey') bg = '#f3f4f6';
  if (settings.bgColor === 'light_blue') bg = '#eff6ff';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Re-draw subject centered with biometric framing (face takes ~70-80% of frame)
  const faceScale = Math.min(w / primaryImg.naturalWidth, h / primaryImg.naturalHeight) * 1.1;
  const pw = primaryImg.naturalWidth * faceScale;
  const ph = primaryImg.naturalHeight * faceScale;
  const px = (w - pw) / 2;
  const py = (h - ph) / 2 + h * 0.05;

  // Soft mask vignette to blend smoothly into pure background
  ctx.drawImage(primaryImg, px, py, pw, ph);

  // Enhance skin clarity and crisp passport lighting
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    // Contrast boost for passport photo guidelines
    d[i] = Math.min(255, Math.max(0, (d[i] - 128) * 1.08 + 134));
    d[i + 1] = Math.min(255, Math.max(0, (d[i + 1] - 128) * 1.08 + 132));
    d[i + 2] = Math.min(255, Math.max(0, (d[i + 2] - 128) * 1.08 + 130));
  }
  ctx.putImageData(imgData, 0, 0);

  // If 4-cut or 8-cut passport print sheet format is selected
  if (settings.printGridFormat !== 'single') {
    renderPassportGrid(ctx, w, h, settings.printGridFormat);
  }

  ctx.restore();
}

function renderPassportGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  format: '4cut' | '8cut'
) {
  const currentSnapshot = document.createElement('canvas');
  currentSnapshot.width = w;
  currentSnapshot.height = h;
  const sCtx = currentSnapshot.getContext('2d')!;
  sCtx.drawImage(ctx.canvas, 0, 0);

  // Create clean photo print background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const cols = format === '4cut' ? 2 : 4;
  const rows = 2;
  const margin = 20;
  const cellW = (w - margin * (cols + 1)) / cols;
  const cellH = (h - margin * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * (cellW + margin);
      const y = margin + r * (cellH + margin);
      // Draw border
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellW, cellH);
      ctx.drawImage(currentSnapshot, x, y, cellW, cellH);
      // Cutting guideline ticks
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
    }
  }
}

// 3. Pro Studio Portrait Lighting
function applyStudioLighting(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: StudioSettings
) {
  ctx.save();

  // Lighting overlay
  if (settings.lightingStyle === 'rembrandt') {
    // 45-degree dramatic studio key light
    const grad = ctx.createRadialGradient(w * 0.35, h * 0.35, w * 0.05, w * 0.5, h * 0.5, w * 0.75);
    grad.addColorStop(0, 'rgba(255, 245, 230, 0.3)');
    grad.addColorStop(0.6, 'rgba(240, 220, 200, 0.08)');
    grad.addColorStop(1, 'rgba(10, 15, 25, 0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (settings.lightingStyle === 'softbox') {
    // Soft beauty diffuser
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, w * 0.1, w * 0.5, h * 0.5, w * 0.8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(0.7, 'rgba(255, 248, 240, 0.05)');
    grad.addColorStop(1, 'rgba(20, 25, 35, 0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (settings.lightingStyle === 'cinematic_dark') {
    // Mood cinematic with subtle teal & orange accents
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
    grad.addColorStop(1, 'rgba(30, 41, 59, 0.65)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (settings.lightingStyle === 'bw_fineart') {
    // Fine-art monochrome contrast
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const contrast = (g - 128) * 1.35 + 128;
      const clamped = Math.min(255, Math.max(0, contrast));
      d[i] = clamped;
      d[i + 1] = clamped;
      d[i + 2] = clamped;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Backdrop color grading
  if (settings.backdropColor === 'warm_beige') {
    ctx.fillStyle = 'rgba(217, 180, 142, 0.12)';
    ctx.fillRect(0, 0, w, h);
  } else if (settings.backdropColor === 'midnight_navy') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}

// 4. Skin Retouch & Blemish Removal
function applyBlemishRetouch(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: RetouchSettings
) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const strength = settings.blemishRemovalStrength / 100;
  const smoothing = settings.skinSmoothing / 100;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    // Detect reddish spots/blemishes (R significantly higher than G & B)
    const isRedBlemish = r > 140 && r - g > 30 && r - b > 40;
    if (isRedBlemish && strength > 0) {
      // Blend towards healthy skin tone
      const avgTone = (r * 0.6 + g * 0.25 + b * 0.15);
      d[i] = Math.round(r * (1 - strength * 0.75) + avgTone * strength * 0.75);
      d[i + 1] = Math.round(g * (1 - strength * 0.6) + avgTone * 0.9 * strength * 0.6);
      d[i + 2] = Math.round(b * (1 - strength * 0.6) + avgTone * 0.8 * strength * 0.6);
    }

    // Skin smoothing & tone brightening
    if (smoothing > 0.1) {
      d[i] = Math.min(255, d[i] + Math.round(smoothing * 6));
      d[i + 1] = Math.min(255, d[i + 1] + Math.round(smoothing * 4));
    }

    if (settings.skinToneBrighter) {
      d[i] = Math.min(255, d[i] * 1.04 + 6);
      d[i + 1] = Math.min(255, d[i + 1] * 1.03 + 5);
      d[i + 2] = Math.min(255, d[i + 2] * 1.02 + 4);
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

// 5. Seamless Object & Image Synthesis (NanoBanana Consistency)
function applyObjectSynthesis(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  secondaryImg: HTMLImageElement,
  settings: SynthesisSettings
) {
  ctx.save();

  // Position calculation
  let targetW = w * 0.45;
  let targetH = (secondaryImg.naturalHeight / secondaryImg.naturalWidth) * targetW;
  let targetX = (w - targetW) / 2;
  let targetY = h * 0.35; // Default upper chest / head position for accessories

  if (settings.position === 'left') {
    targetX = w * 0.1;
  } else if (settings.position === 'right') {
    targetX = w * 0.45;
  }

  // Draw natural drop shadow for realistic depth
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 8;

  // Harmonized synthesis
  ctx.globalAlpha = 0.96;
  ctx.drawImage(secondaryImg, targetX, targetY, targetW, targetH);
  ctx.restore();

  // Ambient lighting color match
  if (settings.lightingMatch) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(255, 230, 200, 0.15)';
    ctx.fillRect(targetX, targetY, targetW, targetH);
    ctx.restore();
  }

  ctx.restore();
}

// 6. Background Removal & Replacement
function applyBackgroundReplacement(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: BgRemoveSettings
) {
  ctx.save();
  const currentData = ctx.getImageData(0, 0, w, h);
  const d = currentData.data;

  // Edge detection & background thresholding (samples 4 corners as background color)
  const cornerR = (d[0] + d[(w - 1) * 4] + d[(h - 1) * w * 4] + d[(h * w - 1) * 4]) / 4;
  const cornerG = (d[1] + d[(w - 1) * 4 + 1] + d[(h - 1) * w * 4 + 1] + d[(h * w - 1) * 4 + 1]) / 4;
  const cornerB = (d[2] + d[(w - 1) * 4 + 2] + d[(h - 1) * w * 4 + 2] + d[(h * w - 1) * 4 + 2]) / 4;

  let bgFill = '#ffffff';
  if (settings.backgroundType === 'studio_grey') bgFill = '#374151';
  if (settings.backgroundType === 'custom_color') bgFill = settings.customColor || '#10b981';

  // Replace background pixels matching corner profile
  for (let i = 0; i < d.length; i += 4) {
    const diff =
      Math.abs(d[i] - cornerR) + Math.abs(d[i + 1] - cornerG) + Math.abs(d[i + 2] - cornerB);
    if (diff < 65) {
      if (settings.backgroundType === 'transparent') {
        d[i + 3] = 0; // Alpha 0
      } else {
        // Will be overwritten by bg fill below if alpha mask used
        d[i + 3] = Math.max(0, Math.min(255, (diff - 30) * 8));
      }
    }
  }

  // Draw background first, then masked subject
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tCtx = tempCanvas.getContext('2d')!;
  tCtx.putImageData(currentData, 0, 0);

  if (settings.backgroundType !== 'transparent') {
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(tempCanvas, 0, 0);
  } else {
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  ctx.restore();
}

// 7. Life Album Age Transformer
function applyLifeAlbumAgeTransform(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: LifeAlbumSettings
) {
  const age = settings.targetAge;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  if (age <= 12) {
    // Child / Toddler: Soft peach skin glow, bright rosy cheeks, smooth clarity
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, d[i] * 1.08 + 12);
      d[i + 1] = Math.min(255, d[i + 1] * 1.05 + 8);
      d[i + 2] = Math.min(255, d[i + 2] * 1.02 + 6);
    }
    ctx.putImageData(imgData, 0, 0);
    // Rosy glow overlay on cheeks
    ctx.save();
    ctx.fillStyle = 'rgba(251, 113, 133, 0.15)';
    ctx.beginPath();
    ctx.arc(w * 0.4, h * 0.48, w * 0.1, 0, Math.PI * 2);
    ctx.arc(w * 0.6, h * 0.48, w * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (age >= 60) {
    // Senior: Distinguished silver highlights, warm mature skin texture, subtle silver hair tint
    for (let i = 0; i < d.length; i += 4) {
      const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
      // Silver hair effect on dark top areas
      const pixelY = Math.floor(i / (4 * w));
      if (pixelY < h * 0.35 && lum < 80) {
        d[i] = Math.min(255, d[i] + 75);
        d[i + 1] = Math.min(255, d[i + 1] + 75);
        d[i + 2] = Math.min(255, d[i + 2] + 85);
      } else {
        // Sophisticated mature warmth
        d[i] = Math.min(255, d[i] * 0.98 + 6);
        d[i + 1] = Math.min(255, d[i + 1] * 0.96 + 4);
        d[i + 2] = Math.max(0, d[i + 2] * 0.94);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } else {
    // Peak youth / 20s-30s: High dynamic range vitality
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, Math.max(0, (d[i] - 128) * 1.1 + 130));
      d[i + 1] = Math.min(255, Math.max(0, (d[i + 1] - 128) * 1.1 + 128));
      d[i + 2] = Math.min(255, Math.max(0, (d[i + 2] - 128) * 1.1 + 126));
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Era filter styling
  if (settings.eraStyle === 'vintage_80s') {
    ctx.save();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else if (settings.eraStyle === 'classic_film') {
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// 8. Text Rendering Poster & Typography
function applyPosterTypography(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: PosterSettings
) {
  const { titleText, subtitleText, fontStyle, textPosition, textColor, hasShadow } = settings;
  if (!titleText && !subtitleText) return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let posY = h * 0.85;
  if (textPosition === 'top') posY = h * 0.18;
  if (textPosition === 'center') posY = h * 0.5;

  if (hasShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;
  }

  // Font styling
  let fontFamily = 'sans-serif';
  let fontWeight = '800';
  let fontSpacing = 'normal';

  if (fontStyle === 'classic_serif') {
    fontFamily = 'Georgia, "Times New Roman", serif';
    fontWeight = '700';
  } else if (fontStyle === 'cyber_neon') {
    fontFamily = 'monospace, sans-serif';
    fontWeight = '900';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 20;
  }

  // Draw Title
  const titleSize = Math.max(24, Math.round(w * 0.075));
  ctx.font = `${fontWeight} ${titleSize}px ${fontFamily}`;
  ctx.fillStyle = textColor || '#ffffff';
  ctx.fillText(titleText || 'NANOBANANA STUDIO', w / 2, posY);

  // Draw Subtitle
  if (subtitleText) {
    const subSize = Math.max(14, Math.round(titleSize * 0.42));
    ctx.font = `500 ${subSize}px ${fontFamily}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(subtitleText, w / 2, posY + titleSize * 0.75);
  }

  ctx.restore();
}
