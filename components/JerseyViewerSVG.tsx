'use client';

import React from 'react';

interface JerseyViewerProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  pattern?: 'stripes' | 'solid' | 'hoops' | 'sash' | 'gradient' | 'retro-wave';
  sponsorText?: string;
  name?: string;
  number?: string;
  view?: 'front' | 'back';
  crestIcon?: string;
  patchNames?: string[];
  height?: number | string;
  className?: string;
}

export const JerseyViewerSVG: React.FC<JerseyViewerProps> = ({
  primaryColor = '#ffffff',
  secondaryColor = '#09152b',
  accentColor = '#c5a059',
  textColor = '#09152b',
  pattern = 'solid',
  sponsorText = 'JERSEY JUNCTION',
  name = 'CUSTOM',
  number = '10',
  view = 'front',
  crestIcon = 'shield',
  patchNames = [],
  height = 360,
  className = ''
}) => {
  // Pattern rendering logic
  const renderPattern = () => {
    switch (pattern) {
      case 'stripes':
        return (
          <g>
            <rect x="75" y="60" width="25" height="240" fill={secondaryColor} />
            <rect x="125" y="60" width="25" height="240" fill={secondaryColor} />
            <rect x="175" y="60" width="25" height="240" fill={secondaryColor} />
            <rect x="225" y="60" width="25" height="240" fill={secondaryColor} />
          </g>
        );
      case 'hoops':
        return (
          <g>
            <rect x="50" y="90" width="200" height="22" fill={secondaryColor} />
            <rect x="50" y="140" width="200" height="22" fill={secondaryColor} />
            <rect x="50" y="190" width="200" height="22" fill={secondaryColor} />
            <rect x="50" y="240" width="200" height="22" fill={secondaryColor} />
          </g>
        );
      case 'sash':
        return (
          <polygon
            points="60,60 110,60 250,280 200,280"
            fill={secondaryColor}
          />
        );
      case 'retro-wave':
        return (
          <g opacity="0.35">
            <path
              d="M 50,100 Q 100,140 150,100 T 250,100 L 250,130 Q 200,170 150,130 T 50,130 Z"
              fill={secondaryColor}
            />
            <path
              d="M 50,160 Q 100,200 150,160 T 250,160 L 250,190 Q 200,230 150,190 T 50,190 Z"
              fill={accentColor}
            />
          </g>
        );
      case 'gradient':
        return (
          <rect x="50" y="160" width="200" height="140" fill={secondaryColor} opacity="0.6" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 300 320"
        style={{ height: typeof height === 'number' ? `${height}px` : height, width: 'auto' }}
        className="drop-shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
      >
        <defs>
          <linearGradient id={`jerseyShade-${name}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>

          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
          </filter>

          {/* Clip path for Jersey Torso */}
          <clipPath id="torsoClip">
            <path d="M 85,65 Q 150,82 215,65 L 250,90 L 245,290 L 55,290 L 50,90 Z" />
          </clipPath>

          {/* Clip path for Left Sleeve */}
          <clipPath id="leftSleeveClip">
            <path d="M 85,65 L 15,115 L 45,175 L 67,135 L 55,90 Z" />
          </clipPath>

          {/* Clip path for Right Sleeve */}
          <clipPath id="rightSleeveClip">
            <path d="M 215,65 L 285,115 L 255,175 L 233,135 L 245,90 Z" />
          </clipPath>
        </defs>

        {/* --- BASE SLEEVES --- */}
        {/* Left Sleeve */}
        <path
          d="M 85,65 L 15,115 L 45,175 L 67,135 L 55,90 Z"
          fill={primaryColor}
          stroke={secondaryColor}
          strokeWidth="1.5"
        />
        {/* Left Sleeve Trim */}
        <polygon points="15,115 45,175 36,180 6,120" fill={accentColor} />

        {/* Right Sleeve */}
        <path
          d="M 215,65 L 285,115 L 255,175 L 233,135 L 245,90 Z"
          fill={primaryColor}
          stroke={secondaryColor}
          strokeWidth="1.5"
        />
        {/* Right Sleeve Trim */}
        <polygon points="285,115 255,175 264,180 294,120" fill={accentColor} />

        {/* Shoulder Stripes / Accents */}
        <path d="M 85,65 L 45,90 L 52,98 L 88,73 Z" fill={secondaryColor} opacity="0.8" />
        <path d="M 215,65 L 255,90 L 248,98 L 212,73 Z" fill={secondaryColor} opacity="0.8" />

        {/* --- MAIN TORSO --- */}
        <path
          d="M 85,65 Q 150,82 215,65 L 250,90 L 245,290 Q 150,300 55,290 L 50,90 Z"
          fill={primaryColor}
          stroke={secondaryColor}
          strokeWidth="1.5"
        />

        {/* Pattern overlay clipped to Torso */}
        <g clipPath="url(#torsoClip)">
          {renderPattern()}
          {/* Subtle Fabric Fold Shadow overlay */}
          <rect x="50" y="65" width="200" height="235" fill={`url(#jerseyShade-${name})`} />
        </g>

        {/* Collar Design */}
        {/* V-neck / Crew Collar Base */}
        <path
          d="M 85,65 Q 150,115 215,65 Q 150,82 85,65 Z"
          fill={secondaryColor}
        />
        <path
          d="M 92,66 Q 150,110 208,66 Q 150,78 92,66 Z"
          fill={accentColor}
        />

        {/* --- FRONT VIEW CONTENT --- */}
        {view === 'front' && (
          <g>
            {/* Manufacturer Brand Logo (Left Chest) */}
            <g transform="translate(92, 115) scale(0.7)">
              <polygon points="0,15 8,0 12,0 3,15" fill={accentColor || secondaryColor} />
              <polygon points="7,15 15,0 19,0 10,15" fill={accentColor || secondaryColor} />
              <polygon points="14,15 22,0 26,0 17,15" fill={accentColor || secondaryColor} />
            </g>

            {/* Team Crest / Badge (Right Chest) */}
            <g transform="translate(182, 108)">
              <g>
                <path
                  d="M 0,0 L 26,0 L 26,18 C 26,28 13,34 13,34 C 13,34 0,28 0,18 Z"
                  fill={secondaryColor}
                  stroke={accentColor}
                  strokeWidth="2"
                />
                <circle cx="13" cy="12" r="6" fill={accentColor} />
                <path d="M 13,8 L 13,16 M 9,12 L 17,12" stroke={primaryColor} strokeWidth="1.5" />
              </g>
            </g>

            {/* Main Sponsor Text (Center Torso) */}
            {sponsorText && (
              <g transform="translate(150, 185)">
                <rect
                  x="-75"
                  y="-18"
                  width="150"
                  height="36"
                  rx="6"
                  fill={secondaryColor}
                  opacity="0.15"
                />
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="15"
                  fontWeight="900"
                  letterSpacing="1.5"
                  fontFamily="Impact, Arial Black, sans-serif"
                >
                  {sponsorText.toUpperCase()}
                </text>
              </g>
            )}

            {/* Optional Small Front Number */}
            {number && (
              <text
                x="150"
                y="242"
                textAnchor="middle"
                fill={textColor}
                fontSize="22"
                fontWeight="800"
                opacity="0.85"
                fontFamily="'Trebuchet MS', sans-serif"
              >
                {number}
              </text>
            )}

            {/* Authentic Tag at Bottom Hem */}
            <g transform="translate(68, 268)">
              <rect x="0" y="0" width="24" height="12" fill="#d97706" rx="2" />
              <text x="12" y="8" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">
                AUTHENTIC
              </text>
            </g>
          </g>
        )}

        {/* --- BACK VIEW CONTENT --- */}
        {view === 'back' && (
          <g>
            {/* Player Name */}
            <g transform="translate(150, 125)">
              {/* Curved/Arched Text for Player Name */}
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill={textColor}
                stroke={secondaryColor === textColor ? primaryColor : secondaryColor}
                strokeWidth="0.8"
                fontSize="20"
                fontWeight="900"
                letterSpacing="3"
                fontFamily="'Trebuchet MS', 'Arial Black', sans-serif"
              >
                {(name || 'PLAYER').toUpperCase()}
              </text>
            </g>

            {/* Player Number */}
            <g transform="translate(150, 205)">
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill={textColor}
                stroke={secondaryColor === textColor ? primaryColor : secondaryColor}
                strokeWidth="2"
                fontSize="72"
                fontWeight="900"
                fontFamily="Impact, 'Arial Black', sans-serif"
                filter="url(#shadow)"
              >
                {number || '10'}
              </text>
            </g>

            {/* Sub-Neck Team Motto/Emblem */}
            <circle cx="150" cy="85" r="5" fill={accentColor} />
          </g>
        )}

        {/* Sleeve Patches Indicator */}
        {patchNames && patchNames.length > 0 && (
          <g transform="translate(25, 125)">
            <circle cx="10" cy="10" r="11" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <text x="10" y="13" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
              ★
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
