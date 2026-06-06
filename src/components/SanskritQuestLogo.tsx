import React, { useId, useState } from 'react';

interface SanskritQuestLogoProps {
  className?: string;
  isDark?: boolean;
}

export default function SanskritQuestLogo({ className = "w-12 h-12", isDark = false }: SanskritQuestLogoProps) {
  const [loadError, setLoadError] = useState<boolean>(false);
  
  const rawId = useId();
  // Safe alphanumeric ID starting with an alphabetical letter and removing colons
  const baseId = 'sq-' + rawId.replace(/:/g, '');
  
  const goldMetalId = `gold-metal-${baseId}`;
  const archGlowId = `arch-glow-${baseId}`;
  const archGlowDarkId = `arch-glow-dark-${baseId}`;
  const lotusGradId = `lotus-grad-${baseId}`;
  const shadowId = `shadow-${baseId}`;
  const logoTextPathId = `logo-text-path-${baseId}`;

  // If the PNG image failed to load (or is not yet uploaded), render the ultra-premium vector SVG
  if (loadError) {
    return (
      <svg 
        viewBox="0 0 200 200" 
        className={`${className} transition-transform duration-300 hover:scale-105`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sanskrit Quest Logo"
      >
        <defs>
          {/* Core Gold Metallic Gradient */}
          <linearGradient id={goldMetalId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="30%" stopColor="#F5B017" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Soft Golden Background Glow inside the Arch */}
          <radialGradient id={archGlowId} cx="50%" cy="50%" r="50%">
            <stop offset="20%" stopColor="#FFFBEB" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#FEF3C7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
          </radialGradient>
          
          {/* Dark Mode Glow */}
          <radialGradient id={archGlowDarkId} cx="50%" cy="50%" r="50%">
            <stop offset="20%" stopColor="#251F14" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#1C180E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1C180E" stopOpacity="0" />
          </radialGradient>

          {/* Lotus Vibrant Red-Orange-Gold Gradient */}
          <linearGradient id={lotusGradId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#C2410C" />     {/* Deep Orange-Red */}
            <stop offset="50%" stopColor="#EA580C" />    {/* Orange */}
            <stop offset="85%" stopColor="#F59E0B" />    {/* Warm Gold */}
            <stop offset="100%" stopColor="#FCD34D" />   {/* Light Yellow Top */}
          </linearGradient>
          
          {/* Outer Shadow for Depth */}
          <filter id={shadowId} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#78350F" floodOpacity="0.15" />
          </filter>

          {/* Curved Path for the bottom text - starts nicely and curves lower to avoid collisions */}
          <path id={logoTextPathId} d="M 28,172 Q 100,202 172,172" fill="none" />
        </defs>

        {/* Behind Logo Background Glow with a solid color fallback */}
        <circle 
          cx="100" 
          cy="85" 
          r="55" 
          fill={isDark ? `url(#${archGlowDarkId}) #1C180E` : `url(#${archGlowId}) #FEF3C7`} 
        />

        <g filter={`url(#${shadowId})`}>
          {/* 1. Indian Temple Torana (Golden Arch Structure) with fallback paint */}
          {/* Outer Temple Dome Pinnacle Spire (Kalasha) */}
          <path 
            d="M100,8 L103.5,17 C105,20 104.5,23 100,26 C95.5,23 95,20 96.5,17 Z" 
            fill={`url(#${goldMetalId}) #D97706`} 
          />
          <circle cx="100" cy="5" r="2.5" fill={`url(#${goldMetalId}) #D97706`} />
          
          {/* Ornate Arch Frame with curls */}
          {/* Left Arch S-Curves */}
          <path 
            d="M100,26 C92,27 82,30 73,36 C64,42 58,51 55,61 C53.5,66 52.5,72 52.5,78" 
            stroke={`url(#${goldMetalId}) #D97706`} 
            strokeWidth="6" 
            strokeLinecap="round" 
          />
          {/* Right Arch S-Curves */}
          <path 
            d="M100,26 C108,27 118,30 127,36 C136,42 142,51 145,61 C146.5,66 147.5,72 147.5,78" 
            stroke={`url(#${goldMetalId}) #D97706`} 
            strokeWidth="6" 
            strokeLinecap="round" 
          />

          {/* Outer Arch Rib Trim */}
          <path 
            d="M100,19 C90,20 78,25 68,32 C58,39 52,49 48,60 C46.5,66 45.5,73 45.5,80 M100,19 C110,20 122,25 132,32 C142,39 148,49 152,60 C153.5,66 154.5,73 154.5,80" 
            stroke={`url(#${goldMetalId}) #D97706`} 
            strokeWidth="2" 
            strokeDasharray="1, 4" 
          />

          {/* Decorative Side Column Pillars */}
          {/* Left Side Pillar */}
          <rect x="52" y="78" width="8" height="38" rx="1" fill={`url(#${goldMetalId}) #D97706`} />
          <rect x="49" y="75" width="14" height="4" rx="0.5" fill={`url(#${goldMetalId}) #D97706`} />
          <rect x="49" y="113" width="14" height="4" rx="0.5" fill={`url(#${goldMetalId}) #D97706`} />
          
          {/* Right Side Pillar */}
          <rect x="140" y="78" width="8" height="38" rx="1" fill={`url(#${goldMetalId}) #D97706`} />
          <rect x="137" y="75" width="14" height="4" rx="0.5" fill={`url(#${goldMetalId}) #D97706`} />
          <rect x="137" y="113" width="14" height="4" rx="0.5" fill={`url(#${goldMetalId}) #D97706`} />

          {/* Left-Right side Ornate Spirals */}
          <path d="M49,70 C44,70 41,74 44,78 C48,82 52,78 52,78" stroke={`url(#${goldMetalId}) #D97706`} strokeWidth="3" fill="none" />
          <path d="M151,70 C156,70 159,74 156,78 C152,82 148,78 148,78" stroke={`url(#${goldMetalId}) #D97706`} strokeWidth="3" fill="none" />

          {/* 2. Central Devanagari Sanskrit Character "ज्ञ" */}
          <text 
            x="100" 
            y="84" 
            textAnchor="middle" 
            dominantBaseline="central"
            fontSize="48" 
            fontWeight="bold" 
            fontFamily="serif, 'Georgia', 'Noto Serif Devanagari'" 
            fill={`url(#${goldMetalId}) #D97706`}
            letterSpacing="0"
          >
            ज्ञ
          </text>

          {/* 3. Symmetrical layered Golden-Orange Lotus base with secure fallbacks */}
          {/* Backmost horizontal petals */}
          <path 
            d="M72,132 C50,135 48,150 68,154 C81,148 90,140 100,138 C110,140 119,148 132,154 C152,150 150,135 128,132" 
            fill={`url(#${lotusGradId}) #EA580C`} 
          />

          {/* Outer Bottom Petals */}
          <path 
            d="M70,145 C52,155 60,170 85,166 C93,160 97,152 100,148 C103,152 107,160 115,166 C140,170 148,155 130,145" 
            fill={`url(#${lotusGradId}) #EA580C`} 
          />

          {/* Mid Row Left-Right Petals */}
          <path 
            d="M100,118 C83,124 75,145 92,152 C98,148 100,136 100,118 Z" 
            fill={`url(#${lotusGradId}) #EA580C`} 
          />
          <path 
            d="M100,118 C117,124 125,145 108,152 C102,148 100,136 100,118 Z" 
            fill={`url(#${lotusGradId}) #EA580C`} 
          />

          {/* Central Foreground Lotus Petal */}
          <path 
            d="M100,110 C92,125 90,143 100,154 C110,143 108,125 100,110 Z" 
            fill={`url(#${lotusGradId}) #EA580C`} 
            stroke="#FFF2B2" 
            strokeWidth="1.2" 
          />
        </g>

        {/* 4. Hindi Subtitle Text "संस्कृत खोज" - shifted slightly higher to clear the curved English text beautifully */}
        <text 
          x="100" 
          y="156" 
          textAnchor="middle" 
          fontSize="11.5" 
          fontWeight="800" 
          fontFamily="sans-serif, 'Inter', 'Noto Sans Devanagari'" 
          fill={isDark ? "#FFA726" : "#E65100"}
          letterSpacing="0.05em"
        >
          संस्कृत खोज
        </text>

        {/* 5. English Primary curved / styled Title "SANSKRIT QUEST" with a clean fall-back */}
        <text 
          fill={`url(#${goldMetalId}) #D97706`}
          fontSize="10" 
          fontWeight="850" 
          fontFamily="sans-serif, 'Outfit', 'Inter'" 
          letterSpacing="0.10em"
        >
          <textPath href={`#${logoTextPathId}`} startOffset="50%" textAnchor="middle">
            SANSKRIT QUEST
          </textPath>
        </text>
      </svg>
    );
  }

  return (
    <img 
      src="/sq_logo_en_borderless.png" 
      alt="Sanskrit Quest Logo" 
      className={`${className} object-contain transition-all duration-300 hover:scale-105 shrink-0`}
      style={{ display: "inline-block" }}
      onError={(e) => {
        console.warn("Failed to load /sq_logo_en_borderless.png. Moving to React Vector SVG Fallback...");
        setLoadError(true);
      }}
    />
  );
}
