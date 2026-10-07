/**
 * Sample images created as high-quality data URLs so users can immediately
 * experiment with NanoBanana features with 1 click.
 */

// Helper to convert SVG to data URL
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export interface PresetSample {
  id: string;
  name: string;
  category: string;
  description: string;
  dataUrl: string;
  recommendedMode: string;
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'vintage_portrait',
    name: '1970년대 빈티지 흑백 사진',
    category: '복원/컬러화용',
    description: '빛바램과 노이즈가 있는 흑백 인물 사진 (복원/업스케일/컬러화 테스트)',
    recommendedMode: 'restore',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
        <defs>
          <filter id="grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.18 0"/>
            <feComposite in2="SourceGraphic" in="gl" operator="in" />
          </filter>
          <linearGradient id="sepiaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4a4238"/>
            <stop offset="50%" stop-color="#736657"/>
            <stop offset="100%" stop-color="#2c2620"/>
          </linearGradient>
          <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#ded3c3"/>
            <stop offset="70%" stop-color="#b8a892"/>
            <stop offset="100%" stop-color="#807261"/>
          </radialGradient>
        </defs>
        <rect width="600" height="750" fill="url(#sepiaGrad)"/>
        
        <!-- Scratches & Vintage artifacts -->
        <line x1="80" y1="30" x2="140" y2="380" stroke="#f0e6d6" stroke-width="1.2" opacity="0.65"/>
        <line x1="480" y1="120" x2="440" y2="600" stroke="#f0e6d6" stroke-width="1.5" opacity="0.5"/>
        <line x1="20" y1="520" x2="580" y2="540" stroke="#e0d4c2" stroke-width="0.8" opacity="0.4"/>
        <circle cx="120" cy="180" r="14" fill="#3b3228" opacity="0.45"/>
        <circle cx="510" cy="420" r="22" fill="#3b3228" opacity="0.35"/>
        
        <!-- Head & Body Silhouette -->
        <path d="M 120 750 Q 150 560 210 520 L 390 520 Q 450 560 480 750 Z" fill="#3a342c"/>
        <!-- Collar -->
        <path d="M 230 520 L 300 580 L 370 520 Z" fill="#c4b6a3" opacity="0.9"/>
        <!-- Neck -->
        <rect x="260" y="440" width="80" height="90" rx="10" fill="#a89984"/>
        <!-- Face oval -->
        <ellipse cx="300" cy="320" rx="130" ry="165" fill="url(#faceGrad)"/>
        <!-- Hair -->
        <path d="M 160 300 C 150 160, 220 120, 300 120 C 380 120, 450 160, 440 300 C 420 200, 380 170, 300 170 C 220 170, 180 200, 160 300 Z" fill="#2d261e"/>
        <!-- Eyes -->
        <ellipse cx="250" cy="300" rx="22" ry="12" fill="#322a22"/>
        <ellipse cx="350" cy="300" rx="22" ry="12" fill="#322a22"/>
        <circle cx="253" cy="298" r="7" fill="#1b1612"/>
        <circle cx="353" cy="298" r="7" fill="#1b1612"/>
        <!-- Eyebrows -->
        <path d="M 225 280 Q 255 270 280 282" stroke="#251f19" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M 320 282 Q 345 270 375 280" stroke="#251f19" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <!-- Nose -->
        <path d="M 300 295 L 295 345 Q 300 355 315 350" stroke="#756450" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- Mouth -->
        <path d="M 270 385 Q 300 405 330 385" stroke="#5a4938" stroke-width="4" fill="none" stroke-linecap="round"/>
        
        <!-- Vignette -->
        <rect width="600" height="750" fill="none" stroke="#231b14" stroke-width="50" opacity="0.6"/>
        <text x="300" y="710" fill="#a69784" font-size="20" font-family="sans-serif" text-anchor="middle" letter-spacing="3" opacity="0.75">EST. 1974 MEMORY ARCHIVE</text>
      </svg>
    `)
  },
  {
    id: 'passport_candidate',
    name: '여권 / 스튜디오 프로필 원본',
    category: '여권/스튜디오/피부보정',
    description: '단정한 정면 포트레이트 (여권 규격 정렬, 렘브란트 스튜디오 조명, 잡티 제거)',
    recommendedMode: 'passport',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
        <defs>
          <linearGradient id="bgStudio" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e8ecf2"/>
            <stop offset="100%" stop-color="#c5ccd6"/>
          </linearGradient>
          <radialGradient id="skin" cx="45%" cy="38%" r="55%">
            <stop offset="0%" stop-color="#ffe3cf"/>
            <stop offset="70%" stop-color="#f5cbb0"/>
            <stop offset="100%" stop-color="#dfa98b"/>
          </radialGradient>
        </defs>
        <rect width="600" height="750" fill="url(#bgStudio)"/>
        
        <!-- Dark suit -->
        <path d="M 130 750 L 190 560 L 410 560 L 470 750 Z" fill="#1e2430"/>
        <!-- White shirt collar -->
        <polygon points="260,560 300,640 340,560" fill="#ffffff"/>
        <polygon points="230,560 270,610 280,560" fill="#f0f3f8"/>
        <polygon points="370,560 330,610 320,560" fill="#f0f3f8"/>
        <!-- Neck -->
        <rect x="260" y="470" width="80" height="100" rx="10" fill="#e2b496"/>
        <!-- Face oval -->
        <ellipse cx="300" cy="330" rx="135" ry="170" fill="url(#skin)"/>
        <!-- Hair style -->
        <path d="M 150 310 C 140 140, 230 110, 300 110 C 370 110, 460 140, 450 310 C 420 180, 380 150, 300 150 C 220 150, 180 180, 150 310 Z" fill="#1c1917"/>
        
        <!-- Blemishes to retouch -->
        <circle cx="240" cy="360" r="4" fill="#d97d74" opacity="0.8"/>
        <circle cx="235" cy="372" r="3" fill="#cf736a" opacity="0.75"/>
        <circle cx="365" cy="355" r="4.5" fill="#d47970" opacity="0.8"/>
        <circle cx="295" cy="420" r="3.5" fill="#c96f66" opacity="0.7"/>
        
        <!-- Eyes & Expressive eyebrows -->
        <ellipse cx="245" cy="310" rx="22" ry="13" fill="#ffffff"/>
        <ellipse cx="355" cy="310" rx="22" ry="13" fill="#ffffff"/>
        <circle cx="247" cy="310" r="10" fill="#3b2b1e"/>
        <circle cx="353" cy="310" r="10" fill="#3b2b1e"/>
        <circle cx="250" cy="308" r="3.5" fill="#ffffff"/>
        <circle cx="356" cy="308" r="3.5" fill="#ffffff"/>
        
        <path d="M 220 290 Q 250 280 275 292" stroke="#26201b" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M 325 292 Q 350 280 380 290" stroke="#26201b" stroke-width="5" fill="none" stroke-linecap="round"/>
        
        <!-- Nose -->
        <path d="M 300 305 L 296 360 Q 300 370 312 365" stroke="#b88365" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <!-- Lips -->
        <path d="M 265 410 Q 300 422 335 410" stroke="#c06e68" stroke-width="5" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },
  {
    id: 'scenic_beach',
    name: '에메랄드 해변 배경',
    category: '합성 배경용',
    description: '맑은 하늘과 모래사장이 펼쳐진 풍경 (자연스러운 개체 합성용)',
    recommendedMode: 'synthesis',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="50%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#bae6fd"/>
          </linearGradient>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="40%" stop-color="#06b6d4"/>
            <stop offset="100%" stop-color="#2dd4bf"/>
          </linearGradient>
          <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#fde047"/>
          </linearGradient>
        </defs>
        <!-- Sky -->
        <rect width="800" height="280" fill="url(#skyGrad)"/>
        <!-- Sun -->
        <circle cx="680" cy="110" r="55" fill="#fef9c3" opacity="0.9"/>
        <!-- Sea -->
        <rect y="280" width="800" height="150" fill="url(#seaGrad)"/>
        <!-- Waves -->
        <path d="M 0 420 Q 200 410 400 425 Q 600 440 800 420 L 800 440 L 0 440 Z" fill="#ffffff" opacity="0.6"/>
        <!-- Beach Sand -->
        <path d="M 0 430 Q 300 420 800 450 L 800 600 L 0 600 Z" fill="url(#sandGrad)"/>
        <!-- Palm leaf silhouette -->
        <path d="M 0 0 Q 150 80 220 180 Q 100 130 0 90 Z" fill="#14532d" opacity="0.75"/>
        <path d="M 0 40 Q 180 120 280 220 Q 140 180 0 150 Z" fill="#166534" opacity="0.7"/>
      </svg>
    `)
  },
  {
    id: 'synthesis_accessory',
    name: '골드 미러 선글라스 & 페도라',
    category: '합성 개체용',
    description: '합성용 개체 사진 (원본 인물에 자연스럽게 착용/합성할 아이템)',
    recommendedMode: 'synthesis',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
        <defs>
          <linearGradient id="goldRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="50%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
          <linearGradient id="lensReflect" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="50%" stop-color="#ec4899"/>
            <stop offset="100%" stop-color="#f97316"/>
          </linearGradient>
        </defs>
        <rect width="500" height="500" fill="#111827"/>
        <!-- Fedora Hat -->
        <path d="M 90 220 Q 250 180 410 220 L 440 240 Q 250 200 60 240 Z" fill="#374151"/>
        <path d="M 160 220 C 150 120, 200 90, 250 90 C 300 90, 350 120, 340 220 Z" fill="#1f2937"/>
        <rect x="160" y="195" width="180" height="18" fill="#e11d48"/>
        
        <!-- Aviator Sunglasses -->
        <path d="M 120 300 Q 190 280 240 295 L 260 295 Q 310 280 380 300" stroke="url(#goldRim)" stroke-width="8" fill="none"/>
        <ellipse cx="180" cy="330" rx="55" ry="40" fill="url(#lensReflect)" stroke="url(#goldRim)" stroke-width="6"/>
        <ellipse cx="320" cy="330" rx="55" ry="40" fill="url(#lensReflect)" stroke="url(#goldRim)" stroke-width="6"/>
        <!-- Lens specular reflection -->
        <path d="M 150 310 L 195 350" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
        <path d="M 290 310 L 335 350" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.6"/>
      </svg>
    `)
  }
];
