/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Compass,
  MapPin,
  CheckCircle2,
  Lock,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
  Shield,
  Layers,
  ArrowRight,
  Info,
  Maximize2
} from 'lucide-react';
import { MinistryLocationNode, PlayerStats, BiblicalRegion } from '../types/game';
import { MINISTRY_LOCATIONS, MINISTRY_MAP_PATHS } from '../data/ministryLocations';
import { soundService } from '../services/soundEffects';

interface MinistryJourneyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onNavigateToMission?: (missionId: string) => void;
  onNavigateToDecree?: (decreeId: string) => void;
}

export const MinistryJourneyMapModal: React.FC<MinistryJourneyMapModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
  onNavigateToMission,
  onNavigateToDecree,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('loc-jerusalem');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'galileia_judeia' | 'asia_siria' | 'europa'>('todos');
  const [claimedBlessings, setClaimedBlessings] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('em_nome_de_jesus_claimed_territories');
        if (saved) return JSON.parse(saved);
      } catch {
        // default
      }
    }
    return [];
  });

  if (!isOpen) return null;

  // Check completion logic for a node:
  // A node is completed if its mission is in completedMissions OR its decree is in unlockedDecrees
  const isNodeCompleted = (node: MinistryLocationNode) => {
    const missionDone = node.missionId ? stats.completedMissions.includes(node.missionId) : false;
    const decreeDone = node.associatedDecreeId ? stats.unlockedDecrees.includes(node.associatedDecreeId) : false;
    return missionDone || decreeDone;
  };

  const completedCount = MINISTRY_LOCATIONS.filter(isNodeCompleted).length;
  const progressPercent = Math.round((completedCount / MINISTRY_LOCATIONS.length) * 100);

  const selectedNode = MINISTRY_LOCATIONS.find((n) => n.id === selectedNodeId) || MINISTRY_LOCATIONS[0];
  const isSelectedCompleted = isNodeCompleted(selectedNode);
  const isSelectedClaimed = claimedBlessings.includes(selectedNode.id);

  // Filtered nodes
  const filteredNodes = MINISTRY_LOCATIONS.filter((node) => {
    if (selectedFilter === 'todos') return true;
    if (selectedFilter === 'galileia_judeia') {
      return ['galileia', 'samaria', 'judeia'].includes(node.region);
    }
    if (selectedFilter === 'asia_siria') {
      return ['siria', 'asia_menor', 'mediterraneo'].includes(node.region);
    }
    if (selectedFilter === 'europa') {
      return ['macedonia', 'grecia', 'italia'].includes(node.region);
    }
    return true;
  });

  const handleSelectNode = (node: MinistryLocationNode) => {
    setSelectedNodeId(node.id);
    soundService.playScriptureTone();
  };

  const handleClaimTerritoryBlessing = (node: MinistryLocationNode) => {
    if (!isSelectedCompleted || isSelectedClaimed || !node.bonusReward) return;

    const fruit = node.bonusReward.fruit;
    const amount = node.bonusReward.amount;
    const points = node.bonusReward.gracePoints;

    const updatedFruits = { ...stats.fruits };
    updatedFruits[fruit] = (updatedFruits[fruit] || 0) + amount;

    const updatedStats: PlayerStats = {
      ...stats,
      worshipScore: (stats.worshipScore || 0) + points,
      fruits: updatedFruits,
    };

    const newClaimed = [...claimedBlessings, node.id];
    setClaimedBlessings(newClaimed);
    try {
      localStorage.setItem('em_nome_de_jesus_claimed_territories', JSON.stringify(newClaimed));
    } catch {
      // storage unavailable
    }

    onUpdateStats(updatedStats);
    soundService.playReconciliationChime();
  };

  const handleProclaimDecreeLocally = (decreeId: string) => {
    soundService.playCelestialDecreeSound();
    onUpdateStats({
      ...stats,
      proclaimedDecreesCount: (stats.proclaimedDecreesCount || 0) + 1,
      fruits: {
        ...stats.fruits,
        alegria: stats.fruits.alegria + 3,
      },
    });
  };

  // Commission stage calculation based on Acts 1:8
  const getCommissionStage = () => {
    if (completedCount >= 10) return 'Confins da Terra (Vitória Plena no Império)';
    if (completedCount >= 6) return 'Macedônia, Acaia & Roma (Europa)';
    if (completedCount >= 4) return 'Ásia Menor & Síria (Gentios)';
    if (completedCount >= 2) return 'Samaria & Galileia (Reconciliação)';
    return 'Jerusalém (Berço do Fogo)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl my-auto bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '30s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold font-cinzel text-amber-300">
                  Mapa do Ministério · A Jornada Apostólica
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ATOS 1:8
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Rastreamento cartográfico dos locais bíblicos de missões reconciliadas e decretos estabelecidos pelo Evangelho da Graça.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fechar Mapa do Ministério"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gamification Metric Ribbon */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Territórios Alcançados:</span>
              <span className="font-bold text-amber-300 font-mono text-sm">
                {completedCount} / {MINISTRY_LOCATIONS.length} ({progressPercent}%)
              </span>
            </div>

            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Estágio da Comissão:</span>
              <span className="font-semibold text-emerald-400">{getCommissionStage()}</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedFilter('todos')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedFilter === 'todos' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({MINISTRY_LOCATIONS.length})
            </button>
            <button
              onClick={() => setSelectedFilter('galileia_judeia')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedFilter === 'galileia_judeia' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Terra Santa
            </button>
            <button
              onClick={() => setSelectedFilter('asia_siria')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedFilter === 'asia_siria' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ásia & Síria
            </button>
            <button
              onClick={() => setSelectedFilter('europa')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedFilter === 'europa' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Europa & Roma
            </button>
          </div>
        </div>

        {/* Content Body: Map on Left/Top, Inspector on Right/Bottom */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          {/* ======================================================== */}
          {/* CARTOGRAPHIC MAP CANVAS (SVG INTERACTIVE)                */}
          {/* ======================================================== */}
          <div className="flex-1 p-4 md:p-6 bg-slate-950 relative flex flex-col items-center justify-center min-h-[380px] lg:min-h-[520px]">
            {/* Compass Rose Accent Watermark */}
            <div className="absolute top-6 left-6 pointer-events-none opacity-20">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="text-amber-400">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <polygon points="50,10 54,46 50,42 46,46" fill="currentColor" />
                <polygon points="50,90 54,54 50,58 46,54" fill="currentColor" />
                <polygon points="10,50 46,46 42,50 46,54" fill="currentColor" />
                <polygon points="90,50 54,46 58,50 54,54" fill="currentColor" />
                <text x="47" y="8" fill="currentColor" fontSize="8" fontWeight="bold">N</text>
              </svg>
            </div>

            {/* Map Canvas Outer Border Container */}
            <div className="relative w-full aspect-[16/10] max-h-[500px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 border border-amber-500/20 overflow-hidden shadow-inner select-none">
              {/* Latitude / Longitude Celestial Grid */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="#f59e0b" strokeDasharray="4 4" />
                <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#f59e0b" strokeDasharray="4 4" />
                <line x1="0%" y1="75%" x2="100%" y2="75%" stroke="#f59e0b" strokeDasharray="4 4" />
                <line x1="25%" y1="0%" x2="25%" y2="100%" stroke="#f59e0b" strokeDasharray="4 4" />
                <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#f59e0b" strokeDasharray="4 4" />
                <line x1="75%" y1="0%" x2="75%" y2="100%" stroke="#f59e0b" strokeDasharray="4 4" />
              </svg>

              {/* Geographic Region Watermarks */}
              <div className="absolute top-[12%] left-[12%] text-[10px] md:text-xs font-cinzel font-bold text-slate-700 pointer-events-none tracking-widest uppercase">
                Itália
              </div>
              <div className="absolute top-[16%] left-[38%] text-[10px] md:text-xs font-cinzel font-bold text-slate-700 pointer-events-none tracking-widest uppercase">
                Macedônia
              </div>
              <div className="absolute top-[44%] left-[36%] text-[10px] md:text-xs font-cinzel font-bold text-slate-700 pointer-events-none tracking-widest uppercase">
                Grécia & Acaia
              </div>
              <div className="absolute top-[36%] left-[54%] text-[10px] md:text-xs font-cinzel font-bold text-slate-700 pointer-events-none tracking-widest uppercase">
                Ásia Menor
              </div>
              <div className="absolute top-[36%] right-[16%] text-[10px] md:text-xs font-cinzel font-bold text-slate-700 pointer-events-none tracking-widest uppercase">
                Síria
              </div>
              <div className="absolute bottom-[22%] right-[10%] text-[10px] md:text-xs font-cinzel font-bold text-slate-700 pointer-events-none tracking-widest uppercase">
                Terra Santa
              </div>
              <div className="absolute bottom-[36%] left-[34%] text-[10px] md:text-xs font-cinzel italic text-sky-900/60 pointer-events-none tracking-wider">
                Mar Mediterrâneo (O Grande Mar)
              </div>

              {/* SVG Connecting Paths between locations */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="goldRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
                  </linearGradient>
                </defs>

                {MINISTRY_MAP_PATHS.map((path) => {
                  const from = MINISTRY_LOCATIONS.find((n) => n.id === path.fromNodeId);
                  const to = MINISTRY_LOCATIONS.find((n) => n.id === path.toNodeId);
                  if (!from || !to) return null;

                  const fromDone = isNodeCompleted(from);
                  const toDone = isNodeCompleted(to);
                  const isRouteActive = fromDone && toDone;

                  return (
                    <line
                      key={path.id}
                      x1={`${from.x}%`}
                      y1={`${from.y}%`}
                      x2={`${to.x}%`}
                      y2={`${to.y}%`}
                      stroke={isRouteActive ? 'url(#goldRouteGradient)' : '#334155'}
                      strokeWidth={isRouteActive ? '2.5' : '1.5'}
                      strokeDasharray={isRouteActive ? 'none' : '4 4'}
                      strokeLinecap="round"
                      opacity={isRouteActive ? 0.9 : 0.4}
                    />
                  );
                })}
              </svg>

              {/* Waypoint Nodes (Markers on Map) */}
              {filteredNodes.map((node) => {
                const isCompleted = isNodeCompleted(node);
                const isSelected = node.id === selectedNodeId;

                return (
                  <div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 z-10"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <button
                      onClick={() => handleSelectNode(node)}
                      className={`group relative flex flex-col items-center focus:outline-none`}
                      title={`${node.name} (${node.regionLabel})`}
                    >
                      {/* Pulse beacon for completed or active nodes */}
                      {isCompleted ? (
                        <span className="absolute -inset-2 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
                      ) : (
                        isSelected && (
                          <span className="absolute -inset-2 rounded-full bg-sky-400/30 animate-pulse pointer-events-none" />
                        )
                      )}

                      {/* Main Node Pin Circle */}
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-all transform ${
                          isSelected ? 'scale-125 ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-950 z-20' : 'group-hover:scale-110'
                        } ${
                          isCompleted
                            ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/50'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>

                      {/* Floating Name Label */}
                      <span
                        className={`mt-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap pointer-events-none transition-colors border ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold'
                            : isCompleted
                            ? 'bg-slate-950/90 text-amber-300 border-amber-500/40'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800'
                        }`}
                      >
                        {node.name}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Map Legend & Instructions */}
            <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-300 inline-block"></span>
                  <span className="text-slate-300">Território Reconciliado</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 inline-block"></span>
                  <span>A Conquistar</span>
                </span>
                <span className="flex items-center gap-1.5 hidden sm:inline-flex">
                  <span className="w-4 h-0.5 bg-amber-400 inline-block"></span>
                  <span>Rota Apostólica Ativa</span>
                </span>
              </div>

              <span className="text-slate-500 italic">Clique nos marcos do mapa para inspecionar</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* INSPECTOR PANEL FOR SELECTED BIBLICAL LOCATION           */}
          {/* ======================================================== */}
          <div className="w-full lg:w-96 p-5 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Node Title & Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {selectedNode.regionLabel}
                  </span>
                  {isSelectedCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reconciliado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                      <Lock className="w-3 h-3" />
                      A Conquistar
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold font-cinzel text-white leading-tight">
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-amber-300/90 font-medium">
                  {selectedNode.biblicalTitle}
                </p>
              </div>

              {/* Biblical Event Context */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Marco Bíblico Histórico:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedNode.biblicalEvent}
                </p>
                <div className="pt-1 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{selectedNode.scriptureRef}</span>
                </div>
              </div>

              {/* Key Verse Quote */}
              <div className="p-3 rounded-xl bg-amber-950/20 border-l-2 border-amber-400 text-xs italic text-amber-200/90 leading-relaxed">
                "{selectedNode.keyVerse}"
              </div>

              {/* Mission Connection */}
              {selectedNode.missionTitle && (
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Missão Vinculada:</span>
                    <span className="text-amber-400 font-semibold">Capítulo {selectedNode.missionChapter}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    {selectedNode.missionTitle}
                  </p>
                  {onNavigateToMission && selectedNode.missionId && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToMission(selectedNode.missionId!);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Acessar Missão na Região</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Decree Connection */}
              {selectedNode.decreeTitle && (
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Decreto Territorial:</span>
                    <span className="text-xs text-amber-400">Palavra de Fé</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    {selectedNode.decreeTitle}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleProclaimDecreeLocally(selectedNode.associatedDecreeId || 'dec-1')}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Proclamar no Território (+1)</span>
                    </button>
                    {onNavigateToDecree && selectedNode.associatedDecreeId && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToDecree(selectedNode.associatedDecreeId!);
                        }}
                        className="py-1.5 px-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-slate-800 transition-colors"
                        title="Ver no Altar de Decretos"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Claim Territory Blessing Action (Gamification) */}
            <div className="pt-3 border-t border-slate-800">
              {selectedNode.bonusReward && (
                isSelectedClaimed ? (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Bênção Apostólica já Consagrada neste Território!</span>
                  </div>
                ) : isSelectedCompleted ? (
                  <button
                    onClick={() => handleClaimTerritoryBlessing(selectedNode)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 font-cinzel active:scale-95"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>Reclamar Bênção (+{selectedNode.bonusReward.amount} {selectedNode.bonusReward.fruit.toUpperCase()} & +{selectedNode.bonusReward.gracePoints} Graça)</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    Complete a missão ou estabeleça o decreto deste local para liberar a Bênção Apostólica Territorial.
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Avanço do Reino: {completedCount} de {MINISTRY_LOCATIONS.length} territórios consagrados ao Nome de Jesus.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Fechar Mapa
          </button>
        </div>
      </div>
    </div>
  );
};
