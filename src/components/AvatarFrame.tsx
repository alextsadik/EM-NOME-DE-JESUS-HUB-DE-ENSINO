/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerStats, AvatarFrameDefinition } from '../types/game';
import { getEquippedFrame, AVATAR_FRAMES } from '../data/avatarFrames';
import { calculateWorshipScore } from '../data/biblicalContent';
import { Sparkles, Crown } from 'lucide-react';

export interface AvatarFrameProps {
  stats: PlayerStats;
  frameId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showAura?: boolean;
  showBadgeChip?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  customPhotoUrl?: string;
  customIcon?: React.ReactNode;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = ({
  stats,
  frameId,
  size = 'md',
  showAura = true,
  showBadgeChip = true,
  interactive = false,
  onClick,
  className = '',
  customPhotoUrl,
  customIcon,
}) => {
  const currentScore = calculateWorshipScore(stats);
  const frame: AvatarFrameDefinition = frameId
    ? AVATAR_FRAMES.find((f) => f.id === frameId) || getEquippedFrame(stats)
    : getEquippedFrame(stats);

  const photoUrl = customPhotoUrl || stats.avatarPhotoUrl;
  const iconSymbol = stats.avatarIconSymbol || '🕊️';

  // Dimension classes mapping
  const sizeConfig = {
    xs: {
      container: 'w-8 h-8',
      inner: 'w-6 h-6',
      iconText: 'text-xs',
      badgeSize: 'w-3 h-3 text-[8px] -bottom-0.5 -right-0.5',
      pad: 'p-[2px]',
      notch: false,
    },
    sm: {
      container: 'w-10 h-10',
      inner: 'w-8 h-8',
      iconText: 'text-sm',
      badgeSize: 'w-3.5 h-3.5 text-[9px] -bottom-0.5 -right-0.5',
      pad: 'p-[2px]',
      notch: false,
    },
    md: {
      container: 'w-13 h-13',
      inner: 'w-10 h-10',
      iconText: 'text-base',
      badgeSize: 'w-4 h-4 text-[10px] -bottom-1 -right-1',
      pad: 'p-[2.5px]',
      notch: true,
    },
    lg: {
      container: 'w-18 h-18',
      inner: 'w-14 h-14',
      iconText: 'text-2xl',
      badgeSize: 'w-5 h-5 text-xs -bottom-1 -right-1',
      pad: 'p-[3px]',
      notch: true,
    },
    xl: {
      container: 'w-24 h-24',
      inner: 'w-19 h-19',
      iconText: 'text-3xl',
      badgeSize: 'w-6 h-6 text-sm -bottom-1 -right-1',
      pad: 'p-[3.5px]',
      notch: true,
    },
  }[size];

  const content = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeConfig.container} ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
      title={`${frame.name} (${frame.accentTitle}) · ${frame.epithet}`}
    >
      {/* 1. Ambient Celestial Aura with Pulsing Halo Glow */}
      {showAura && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none animate-frame-pulse"
          style={{ background: frame.auraGlow }}
        />
      )}

      {/* 2. Rotating Animated Gradient Ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${frame.gradientClass} ${
          frame.ringAnimation
        } ${interactive ? 'group-hover:scale-105 transition-transform' : ''}`}
      />

      {/* 3. Outer Shimmer Accent Ring */}
      <div
        className={`absolute inset-[1px] rounded-full bg-gradient-to-b ${frame.gradientClass} opacity-80 animate-gradient-shimmer`}
      />

      {/* 4. Cardinal Decorative Cross Notches (sizes md, lg, xl) */}
      {sizeConfig.notch && (
        <>
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-amber-200/90 rounded-full shadow-sm z-10 pointer-events-none" />
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-amber-200/90 rounded-full shadow-sm z-10 pointer-events-none" />
          <div className="absolute top-1/2 -left-0.5 -translate-y-1/2 h-1.5 w-1 bg-amber-200/90 rounded-full shadow-sm z-10 pointer-events-none" />
          <div className="absolute top-1/2 -right-0.5 -translate-y-1/2 h-1.5 w-1 bg-amber-200/90 rounded-full shadow-sm z-10 pointer-events-none" />
        </>
      )}

      {/* 5. Inner Sanctum Avatar Body */}
      <div
        className={`relative z-10 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border ${frame.innerBorderClass} ${sizeConfig.inner} shadow-inner transition-transform ${
          interactive ? 'group-hover:scale-102' : ''
        }`}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={frame.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : customIcon ? (
          <div className="flex items-center justify-center text-amber-200">{customIcon}</div>
        ) : (
          <div
            className={`flex items-center justify-center select-none font-cinzel font-bold text-amber-200 ${sizeConfig.iconText}`}
          >
            {frame.id === 'frame-5000' ? (
              <Crown className="w-1/2 h-1/2 text-yellow-300 animate-pulse" />
            ) : (
              <span>{iconSymbol}</span>
            )}
          </div>
        )}

        {/* Ambient inner soft sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
      </div>

      {/* 6. Milestone Indicator Chip */}
      {showBadgeChip && (
        <div
          className={`absolute z-20 rounded-full bg-slate-950 border border-amber-400/80 shadow-md flex items-center justify-center font-bold text-amber-200 pointer-events-none ${sizeConfig.badgeSize}`}
          title={`Símbolo: ${frame.badgeSymbol} · Marco: ${frame.minScore} pts`}
        >
          {frame.minScore === 5000 ? (
            <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
          ) : (
            <span>{frame.badgeSymbol}</span>
          )}
        </div>
      )}
    </div>
  );

  if (interactive && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full p-0.5 transition-all text-left"
        aria-label={`Personalizar Moldura de Avatar: ${frame.name}`}
      >
        {content}
      </button>
    );
  }

  return content;
};
