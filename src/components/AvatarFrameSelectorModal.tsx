/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Lock,
  Crown,
  Volume2,
  Image,
  Award,
  ChevronRight,
  TrendingUp,
  Flame,
  Shield,
  BookOpen
} from 'lucide-react';
import { PlayerStats, AvatarFrameDefinition } from '../types/game';
import {
  AVATAR_FRAMES,
  AVAILABLE_AVATAR_ICONS,
  getAvatarFramesWithStatus,
  getEquippedFrame,
  getNextFrameUnlock,
} from '../data/avatarFrames';
import { calculateWorshipScore } from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';
import { AvatarFrame } from './AvatarFrame';

interface AvatarFrameSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onUpdateStats: (updater: React.SetStateAction<PlayerStats>) => void;
}

export const AvatarFrameSelectorModal: React.FC<AvatarFrameSelectorModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateStats,
}) => {
  const currentScore = calculateWorshipScore(stats);
  const framesWithStatus = getAvatarFramesWithStatus(stats);
  const equippedFrame = getEquippedFrame(stats);

  const [previewFrameId, setPreviewFrameId] = useState<string>(equippedFrame.id);
  const [photoInput, setPhotoInput] = useState<string>(stats.avatarPhotoUrl || '');
  const [isPhotoEditing, setIsPhotoEditing] = useState<boolean>(false);
  const [justEquippedId, setJustEquippedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePreviewFrame =
    AVATAR_FRAMES.find((f) => f.id === previewFrameId) || equippedFrame;
  const isPreviewUnlocked = currentScore >= activePreviewFrame.minScore;
  const isPreviewEquipped = (stats.equippedAvatarFrameId || equippedFrame.id) === activePreviewFrame.id;
  const { nextFrame, pointsToUnlock, progressPercent } = getNextFrameUnlock(currentScore);

  const handleEquipFrame = (frame: AvatarFrameDefinition) => {
    if (currentScore < frame.minScore) return;

    soundService.playVictoryChime();
    setJustEquippedId(frame.id);
    setTimeout(() => setJustEquippedId(null), 2500);

    onUpdateStats((prev) => ({
      ...prev,
      equippedAvatarFrameId: frame.id,
    }));
  };

  const handleSelectIcon = (symbol: string) => {
    soundService.playScriptureTone();
    onUpdateStats((prev) => ({
      ...prev,
      avatarIconSymbol: symbol,
      avatarPhotoUrl: undefined, // switch back to symbol
    }));
  };

  const handleSavePhotoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (photoInput.trim()) {
      soundService.playDailyGoalsCompletedChime();
      onUpdateStats((prev) => ({
        ...prev,
        avatarPhotoUrl: photoInput.trim(),
      }));
      setIsPhotoEditing(false);
    }
  };

  const handleRemovePhoto = () => {
    soundService.playScriptureTone();
    setPhotoInput('');
    onUpdateStats((prev) => ({
      ...prev,
      avatarPhotoUrl: undefined,
    }));
    setIsPhotoEditing(false);
  };

  const handleProclaimScripture = (frame: AvatarFrameDefinition) => {
    soundService.playScriptureTone();
    soundService.speakText(`${frame.name}. ${frame.scriptureRef}: ${frame.scriptureText}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-avatar-frames-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2
                id="modal-avatar-frames-title"
                className="font-cinzel text-lg md:text-xl font-bold text-amber-300 tracking-wide"
              >
                Molduras de Avatar & Resplendor
              </h2>
              <p className="text-xs text-slate-400">
                Bordas decorativas e gradientes animados desbloqueados em marcos de 500, 1.000, 2.000 e 5.000 pontos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs font-mono text-amber-300">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentScore.toLocaleString()} WorshipScore</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Main Showcase Banner: Live Large Preview & Equipped Status */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/20 p-5 md:p-6 overflow-hidden shadow-xl">
            {/* Background radiant aura based on previewed frame */}
            <div
              className="absolute -top-12 -right-12 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
              style={{ background: activePreviewFrame.auraGlow }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              {/* Large Animated Avatar Frame */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <AvatarFrame
                  stats={stats}
                  frameId={activePreviewFrame.id}
                  size="xl"
                  showAura={true}
                  showBadgeChip={true}
                />
                <span className="text-[11px] font-mono text-amber-300/80 font-bold uppercase tracking-wider">
                  {isPreviewEquipped ? 'Equipado no Perfil' : isPreviewUnlocked ? 'Pronto para Equipar' : 'Bloqueado'}
                </span>
              </div>

              {/* Frame Details & Actions */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-cinzel font-bold">
                    {activePreviewFrame.accentTitle}
                  </span>
                  <span className="text-xs text-slate-400">
                    Marco: <strong className="text-amber-200">{activePreviewFrame.minScore} pts</strong>
                  </span>
                  {isPreviewUnlocked && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Desbloqueada
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-cinzel text-xl md:text-2xl font-bold text-amber-100">
                    {activePreviewFrame.name}
                  </h3>
                  <p className="text-xs text-amber-300/80 italic">
                    "{activePreviewFrame.epithet}"
                  </p>
                </div>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
                  {activePreviewFrame.description}
                </p>

                {/* Biblical anchor quote */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-cinzel text-amber-400 font-semibold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      {activePreviewFrame.scriptureRef}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleProclaimScripture(activePreviewFrame)}
                      className="text-amber-300/80 hover:text-amber-200 flex items-center gap-1 text-[11px]"
                      title="Ouvir Proclamação Sagrada"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Proclamar</span>
                    </button>
                  </div>
                  <p className="italic text-slate-400 line-clamp-2">
                    "{activePreviewFrame.scriptureText}"
                  </p>
                </div>

                {/* Primary Action Button */}
                <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {isPreviewUnlocked ? (
                    isPreviewEquipped ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-semibold text-xs md:text-sm">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>Moldura Atualmente em Uso</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEquipFrame(activePreviewFrame)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs md:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Equipar Esta Moldura</span>
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs">
                      <Lock className="w-4 h-4 text-amber-500/60" />
                      <span>
                        Faltam{' '}
                        <strong className="text-amber-300 font-mono">
                          {(activePreviewFrame.minScore - currentScore).toLocaleString()} pts
                        </strong>{' '}
                        de WorshipScore para desbloquear
                      </span>
                    </div>
                  )}

                  {justEquippedId === activePreviewFrame.id && (
                    <span className="text-xs font-semibold text-emerald-400 animate-pulse">
                      ✓ Moldura equipada com sucesso!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Next Milestone Progress Bar (if not at max 5000) */}
          {nextFrame && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 font-bold">
                  {nextFrame.badgeSymbol}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      Próximo Marco: {nextFrame.name} ({nextFrame.minScore} pts)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Acumule mais {pointsToUnlock.toLocaleString()} pontos na Rádio 24h, Decretos e Salmos para desbloquear.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-48 shrink-0 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{currentScore.toLocaleString()} pts</span>
                  <span className="text-amber-300 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Grid of All 5 Milestone Frames */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Coleção de Molduras (Marcos de Pontos)</span>
              </h4>
              <span className="text-xs text-slate-400">
                {framesWithStatus.filter((f) => f.isUnlocked).length} de {framesWithStatus.length} Desbloqueadas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {framesWithStatus.map((frame) => {
                const isSelected = previewFrameId === frame.id;
                const isEquipped = (stats.equippedAvatarFrameId || equippedFrame.id) === frame.id;

                return (
                  <div
                    key={frame.id}
                    onClick={() => {
                      setPreviewFrameId(frame.id);
                      soundService.playScriptureTone();
                    }}
                    className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                        : frame.isUnlocked
                        ? 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-amber-500/30'
                        : 'bg-slate-950/60 border-slate-900 opacity-75 hover:opacity-95'
                    }`}
                  >
                    {/* Top Row: Mini Avatar Frame, Title, Status */}
                    <div className="flex items-start gap-3.5">
                      <div className="shrink-0 pt-0.5">
                        <AvatarFrame
                          stats={stats}
                          frameId={frame.id}
                          size="md"
                          showAura={isSelected || frame.isUnlocked}
                          showBadgeChip={true}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 leading-tight">
                          <h5 className="font-cinzel text-xs font-bold text-slate-100 truncate group-hover:text-amber-200">
                            {frame.name}
                          </h5>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-amber-400/90 block">
                          {frame.accentTitle} ({frame.minScore} pts)
                        </span>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {frame.epithet}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Status / Equip Trigger */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      {frame.isUnlocked ? (
                        isEquipped ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Em Uso
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEquipFrame(frame);
                            }}
                            className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition-colors"
                          >
                            Equipar
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Lock className="w-3 h-3 text-amber-500/50" />
                          <span>Faltam {frame.pointsNeeded.toLocaleString()} pts</span>
                        </div>
                      )}

                      <span className="text-[10px] text-slate-400 font-mono">
                        {frame.scriptureRef}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customization Section: Avatar Icon & Photo */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-cinzel text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Image className="w-4 h-4 text-amber-400" />
                  <span>Ícone Central & Foto de Perfil</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Escolha um símbolo bíblico de adoração ou insira o link de sua imagem para compor a moldura
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPhotoEditing(!isPhotoEditing)}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-500/40 transition-colors self-start sm:self-auto"
              >
                {isPhotoEditing ? 'Ocultar Link de Foto' : 'Usar Foto Personalizada'}
              </button>
            </div>

            {/* Custom Photo URL Input */}
            {isPhotoEditing && (
              <form onSubmit={handleSavePhotoUrl} className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300">
                  URL da Imagem de Perfil (HTTPS)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
                  >
                    Salvar
                  </button>
                  {stats.avatarPhotoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs transition-colors shrink-0"
                    >
                      Remover Foto
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Biblical Icon Symbols Selector */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-medium text-slate-400">
                Símbolos Bíblicos da Aliança:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {AVAILABLE_AVATAR_ICONS.map((icon) => {
                  const isSelected = stats.avatarIconSymbol === icon.symbol && !stats.avatarPhotoUrl;
                  return (
                    <button
                      key={icon.symbol}
                      type="button"
                      onClick={() => handleSelectIcon(icon.symbol)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50 text-amber-200'
                          : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                      title={`${icon.name} (${icon.ref})`}
                    >
                      <span className="text-2xl mb-1">{icon.symbol}</span>
                      <span className="text-[11px] font-medium truncate w-full">{icon.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{icon.ref}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-amber-300 font-bold">Colossenses 3:17</span>
            <span>·</span>
            <span>Tudo para a Glória do Senhor Jesus</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
