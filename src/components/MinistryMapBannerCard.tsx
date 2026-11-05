/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  MapPin,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { PlayerStats } from '../types/game';
import { MINISTRY_LOCATIONS } from '../data/ministryLocations';
import { soundService } from '../services/soundEffects';

interface MinistryMapBannerCardProps {
  stats: PlayerStats;
  onOpenMinistryMap: () => void;
}

export const MinistryMapBannerCard: React.FC<MinistryMapBannerCardProps> = ({
  stats,
  onOpenMinistryMap,
}) => {
  const isNodeCompleted = (node: typeof MINISTRY_LOCATIONS[0]) => {
    const missionDone = node.missionId ? stats.completedMissions.includes(node.missionId) : false;
    const decreeDone = node.associatedDecreeId ? stats.unlockedDecrees.includes(node.associatedDecreeId) : false;
    return missionDone || decreeDone;
  };

  const completedCount = MINISTRY_LOCATIONS.filter(isNodeCompleted).length;
  const progressPercent = Math.round((completedCount / MINISTRY_LOCATIONS.length) * 100);

  const handleClick = () => {
    soundService.playScriptureTone();
    onOpenMinistryMap();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-amber-500/30 p-4 md:p-5 shadow-lg space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '40s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold font-cinzel text-amber-300">
                Mapa do Ministério · Jornada Apostólica
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {completedCount} / {MINISTRY_LOCATIONS.length} Territórios
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Rastreamento dos locais bíblicos de cada missão e decreto pelo Evangelho da Graça (Atos 1:8).
            </p>
          </div>
        </div>

        <button
          onClick={handleClick}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Explorar Mapa Cartográfico</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar & Quick Waypoint Nodes Ribbon */}
      <div className="space-y-2">
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Horizontal Mini Territory Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {MINISTRY_LOCATIONS.map((loc) => {
            const isDone = isNodeCompleted(loc);
            return (
              <button
                key={loc.id}
                onClick={handleClick}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 border ${
                  isDone
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
                title={`${loc.name} · ${loc.regionLabel}`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                ) : (
                  <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                )}
                <span>{loc.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
