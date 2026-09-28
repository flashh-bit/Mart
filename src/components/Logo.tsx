import React from 'react';

interface LogoProps {
  variant?: 'full' | 'badge';
  size?: 32 | 40 | 48 | 64 | 96;
  className?: string;
}

export const LogoBadgeSvg: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Aura Mart Emblem"
    >
      {/* Minimalist circular background */}
      <circle cx="24" cy="24" r="24" fill="#F6F0F1" />
      
      {/* Abstract geometric background elements (Subtle sparkles) */}
      <g fill="#E8D3D6">
        <circle cx="12" cy="14" r="1.5" />
        <circle cx="36" cy="34" r="1.5" />
        <path d="M38 14L39 17L42 18L39 19L38 22L37 19L34 18L37 17L38 14Z" opacity="0.5" />
      </g>

      {/* Shopping Tote Bag representing Kirana / Essentials */}
      <path d="M16 22 C16 22 16 36 16 36 C16 38 18 40 24 40 C30 40 32 38 32 36 C32 36 32 22 32 22 Z" fill="#8C4D56" />
      
      {/* Tote Bag Handles */}
      <path d="M20 22 V16 C20 13 22 12 24 12 C26 12 28 13 28 16 V22" stroke="#8C4D56" strokeWidth="2" strokeLinecap="round" fill="none" />
      
      {/* Fashion Jewellery Sparkle / Pendant overlay on the bag */}
      <path d="M24 24 L26 28 L30 30 L26 32 L24 36 L22 32 L18 30 L22 28 L24 24 Z" fill="#F6F0F1" opacity="0.9" />
      <circle cx="24" cy="30" r="1.5" fill="#8C4D56" />

    </svg>
  );
};

export const StoreLogo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 40,
  className = '',
}) => {
  if (variant === 'badge') {
    return <LogoBadgeSvg size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoBadgeSvg size={size} />
      <div className="flex flex-col leading-tight">
        <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
          Aura Mart
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-accent">
          Everyday Essentials
        </span>
      </div>
    </div>
  );
};

export const Logo = StoreLogo;
export default StoreLogo;
