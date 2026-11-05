/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio, 
  Music, 
  Sparkles, 
  Tv, 
  Flame, 
  ChevronUp,
  Headphones,
  SkipForward,
  SkipBack,
  AlertTriangle,
  Settings,
  Shield,
  Clock,
  X,
  Trophy
} from 'lucide-react';
import {
  AudioStreamChannel,
  ActivePraiseMultiplier,
  PraiseTrack24h,
  RadioMaintenanceConfig
} from '../types/game';
import {
  DEFAULT_WORSHIP_CHANNELS,
  INITIAL_24H_PLAYLIST,
  DEFAULT_MAINTENANCE_CONFIG
} from '../data/biblicalContent';
import { RadioMaintenanceCountdownBadge } from './RadioMaintenanceCountdownBadge';

interface WorshipStationFooterProps {
  activeMultiplier: ActivePraiseMultiplier | null;
  onOpenMediaChamber: () => void;
  onOpenPraiseChallenge: () => void;
  onOpenRank?: () => void;
  onListeningMinuteTick?: () => void;
  playlist24h?: PraiseTrack24h[];
  maintenanceConfig?: RadioMaintenanceConfig;
  onOpenAdmin?: () => void;
  forcedTrack?: PraiseTrack24h | null;
}

const DAYS_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const WorshipStationFooter: React.FC<WorshipStationFooterProps> = ({
  activeMultiplier,
  onOpenMediaChamber,
  onOpenPraiseChallenge,
  onOpenRank,
  onListeningMinuteTick,
  playlist24h = INITIAL_24H_PLAYLIST,
  maintenanceConfig = DEFAULT_MAINTENANCE_CONFIG,
  onOpenAdmin,
  forcedTrack
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentChannelId, setCurrentChannelId] = useState<string>('radio-24h');
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.65);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isMaintenanceAlertDismissed, setIsMaintenanceAlertDismissed] = useState<boolean>(false);
  const [maintenanceState, setMaintenanceState] = useState<{
    isActive: boolean;
    isApproaching: boolean;
    minutesUntilStart: number;
  }>({
    isActive: false,
    isApproaching: false,
    minutesUntilStart: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    oscillators: OscillatorNode[];
    gainNode: GainNode | null;
    intervalId?: number;
  }>({
    oscillators: [],
    gainNode: null,
  });

  const activeTracks = playlist24h.filter((t) => t.isActive);
  const safeTracks = activeTracks.length > 0 ? activeTracks : playlist24h;
  const currentTrack: PraiseTrack24h = safeTracks[currentTrackIndex % safeTracks.length] || safeTracks[0];
  const nextTrack: PraiseTrack24h = safeTracks[(currentTrackIndex + 1) % safeTracks.length];

  // Channel definitions, with 24H Praise Playlist as primary option
  const channels: AudioStreamChannel[] = [
    {
      id: 'radio-24h',
      title: 'Rádio Louvor 24h & Harpa',
      genre: 'webradio',
      genreLabel: 'Programação Contínua 24h',
      description: 'Cânticos da Harpa Cristã e adoração ininterrupta sincronizada com rotação ministerial.',
      streamUrl: currentTrack?.audioUrl || 'https://listen.radionomy.com/worshipradio',
      synthTone: 'harp',
      iconName: 'radio',
    },
    ...DEFAULT_WORSHIP_CHANNELS,
  ];

  const currentChannel = channels.find((c) => c.id === currentChannelId) || channels[0];

  // React to forced track selection from Admin
  useEffect(() => {
    if (forcedTrack) {
      const idx = safeTracks.findIndex((t) => t.id === forcedTrack.id);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
        setCurrentChannelId('radio-24h');
        if (!isPlaying) {
          setIsPlaying(true);
          startSynth(forcedTrack.genre === 'instrumental' ? 'celestial' : 'harp');
        }
        if (audioRef.current && forcedTrack.audioUrl) {
          audioRef.current.src = forcedTrack.audioUrl;
          audioRef.current.play().catch(() => {});
        }
      }
    }
  }, [forcedTrack]);

  // Real-time Maintenance Schedule Evaluator
  useEffect(() => {
    const checkMaintenance = () => {
      if (maintenanceConfig.isManualMaintenance) {
        setMaintenanceState({
          isActive: true,
          isApproaching: false,
          minutesUntilStart: 0,
        });
        if (maintenanceConfig.autoSilenceAudio && isPlaying) {
          stopSynth();
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
        }
        return;
      }

      const now = new Date();
      const currentDay = now.getDay();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeVal = currentHours * 60 + currentMinutes;

      const [startH, startM] = maintenanceConfig.startHour.split(':').map(Number);
      const [endH, endM] = maintenanceConfig.endHour.split(':').map(Number);
      const startTimeVal = (startH || 0) * 60 + (startM || 0);
      const endTimeVal = (endH || 0) * 60 + (endM || 0);

      const isSameDay = currentDay === maintenanceConfig.maintenanceDayOfWeek;
      const isWindowActive = isSameDay && currentTimeVal >= startTimeVal && currentTimeVal <= endTimeVal;

      const preAlertWindow = maintenanceConfig.preAlertMinutes || 30;
      const isApproaching =
        isSameDay &&
        currentTimeVal >= startTimeVal - preAlertWindow &&
        currentTimeVal < startTimeVal;

      const diffToStart = startTimeVal - currentTimeVal;

      setMaintenanceState({
        isActive: isWindowActive,
        isApproaching,
        minutesUntilStart: Math.max(0, diffToStart),
      });

      if (isWindowActive && maintenanceConfig.autoSilenceAudio && isPlaying) {
        stopSynth();
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    checkMaintenance();
    const interval = setInterval(checkMaintenance, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [maintenanceConfig, isPlaying]);

  // Multiplier countdown timer formatting
  useEffect(() => {
    if (!activeMultiplier) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, activeMultiplier.expiresAt - now);
      if (diff <= 0) {
        setTimeRemaining('Expirado');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeMultiplier]);

  // Gamification continuous listening tracker (rewards adoration rank points)
  useEffect(() => {
    if (!isPlaying || isMuted || maintenanceState.isActive) return;

    const interval = setInterval(() => {
      onListeningMinuteTick?.();
    }, 60000);

    return () => clearInterval(interval);
  }, [isPlaying, isMuted, maintenanceState.isActive, onListeningMinuteTick]);

  // Synthesizer Harmonic Engine
  const stopSynth = () => {
    if (synthNodesRef.current.intervalId) {
      window.clearInterval(synthNodesRef.current.intervalId);
      synthNodesRef.current.intervalId = undefined;
    }
    synthNodesRef.current.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    synthNodesRef.current.oscillators = [];
    if (synthNodesRef.current.gainNode) {
      try {
        synthNodesRef.current.gainNode.disconnect();
      } catch {
        // ignore
      }
      synthNodesRef.current.gainNode = null;
    }
  };

  const startSynth = (toneType: 'peace' | 'harp' | 'celestial') => {
    stopSynth();
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      const currentVol = isMuted ? 0 : volume * 0.18;
      masterGain.gain.setValueAtTime(currentVol, ctx.currentTime);
      masterGain.connect(ctx.destination);
      synthNodesRef.current.gainNode = masterGain;

      const chords = {
        peace: [146.83, 220.0, 293.66, 369.99, 440.0],
        harp: [220.0, 277.18, 329.63, 440.0, 554.37],
        celestial: [293.66, 440.0, 587.33, 880.0, 1174.66],
      };

      const selectedFreqs = chords[toneType] || chords.peace;
      const oscillators: OscillatorNode[] = [];

      selectedFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = toneType === 'harp' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const detuneLFO = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        detuneLFO.frequency.setValueAtTime(0.2 + idx * 0.05, ctx.currentTime);
        lfoGain.gain.setValueAtTime(3.5, ctx.currentTime);
        detuneLFO.connect(lfoGain);
        lfoGain.connect(osc.detune);
        detuneLFO.start();

        const baseGain = (1 / selectedFreqs.length) * 0.8;
        oscGain.gain.setValueAtTime(baseGain, ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();

        oscillators.push(osc);
      });

      synthNodesRef.current.oscillators = oscillators;
    } catch {
      // AudioContext unavailable
    }
  };

  // Sync master volume
  useEffect(() => {
    const effectiveVol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = effectiveVol;
    }
    if (synthNodesRef.current.gainNode && audioCtxRef.current) {
      synthNodesRef.current.gainNode.gain.setValueAtTime(
        effectiveVol * 0.18,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Track playback change
  const playCurrentTrackOrChannel = () => {
    const streamUrl =
      currentChannelId === 'radio-24h'
        ? currentTrack?.audioUrl || 'https://listen.radionomy.com/worshipradio'
        : currentChannel.streamUrl;

    const synthTone =
      currentChannelId === 'radio-24h'
        ? currentTrack?.genre === 'instrumental'
          ? 'celestial'
          : 'harp'
        : currentChannel.synthTone;

    startSynth(synthTone);
    if (audioRef.current && streamUrl) {
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch(() => {});
    }
  };

  // Toggle play / pause
  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopSynth();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playCurrentTrackOrChannel();
    }
  };

  // Next / Previous Track in 24h Rotation
  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % safeTracks.length;
    setCurrentTrackIndex(nextIdx);
    if (isPlaying) {
      setTimeout(() => {
        playCurrentTrackOrChannel();
      }, 50);
    }
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + safeTracks.length) % safeTracks.length;
    setCurrentTrackIndex(prevIdx);
    if (isPlaying) {
      setTimeout(() => {
        playCurrentTrackOrChannel();
      }, 50);
    }
  };

  // Select Channel
  const handleSelectChannel = (channel: AudioStreamChannel) => {
    setCurrentChannelId(channel.id);
    if (isPlaying) {
      startSynth(channel.synthTone);
      if (audioRef.current && channel.streamUrl) {
        audioRef.current.src = channel.streamUrl;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Handle Track Completion auto-advance
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentChannelId === 'radio-24h') {
        handleNextTrack();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentChannelId, currentTrackIndex, safeTracks.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSynth();
    };
  }, []);

  const showMaintenanceBanner = (maintenanceState.isActive || maintenanceState.isApproaching) && !isMaintenanceAlertDismissed;

  return (
    <footer 
      role="region"
      aria-label="Estação de Adoração e Multimídia"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-slate-100 shadow-2xl transition-all"
    >
      <audio ref={audioRef} className="hidden" preload="none" />

      {/* ========================================================= */}
      {/* MAINTENANCE NOTIFICATION BANNER (Real-time Alert Bar)     */}
      {/* ========================================================= */}
      {showMaintenanceBanner && (
        <div className={`px-4 py-2 border-b flex items-center justify-between gap-3 text-xs font-medium animate-fadeIn ${
          maintenanceState.isActive
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-amber-950/90 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <AlertTriangle className={`w-4 h-4 shrink-0 ${
              maintenanceState.isActive ? 'text-rose-400 animate-bounce' : 'text-amber-400 animate-pulse'
            }`} />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 truncate">
              <strong className="font-bold uppercase tracking-wide text-amber-300">
                {maintenanceState.isActive
                  ? 'Aviso: Manutenção Técnica da Rádio Ativa'
                  : `Atenção: Manutenção em ${maintenanceState.minutesUntilStart} minutos`}
              </strong>
              <span className="text-slate-300 truncate">
                · {maintenanceConfig.alertMessage}
              </span>
              <span className="text-[11px] text-amber-400/90 hidden sm:inline">
                ({DAYS_NAMES[maintenanceConfig.maintenanceDayOfWeek]}s {maintenanceConfig.startHour} às {maintenanceConfig.endHour})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors"
              >
                Gerenciar
              </button>
            )}
            <button
              onClick={() => setIsMaintenanceAlertDismissed(true)}
              className="p-1 hover:text-white rounded"
              title="Dispensar aviso por agora"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Player Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Left: Station Identity, Current 24h Track Info & Channels */}
        <div className="flex items-center gap-3 shrink-0 min-w-0 max-w-full sm:max-w-md md:max-w-lg">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            {currentChannelId === 'radio-24h' ? (
              <Radio className="w-5 h-5 text-amber-300 animate-pulse" />
            ) : currentChannel.iconName === 'sparkles' ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <Music className="w-5 h-5" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
                {currentChannelId === 'radio-24h' ? 'Rádio 24h Contínua' : currentChannel.genreLabel}
              </span>
              {currentChannelId === 'radio-24h' && currentTrack?.shiftPeriod && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-medium capitalize bg-slate-800 text-amber-300/80 hidden xs:inline">
                  Turno: {currentTrack.shiftPeriod}
                </span>
              )}
              {maintenanceState.isActive && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  Manutenção
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 truncate">
              <span className="text-sm font-semibold text-slate-100 truncate">
                {currentChannelId === 'radio-24h' ? currentTrack?.title : currentChannel.title}
              </span>
              {currentChannelId === 'radio-24h' && currentTrack?.artistOrMinister && (
                <span className="text-xs text-slate-400 hidden sm:inline truncate">
                  — {currentTrack.artistOrMinister}
                </span>
              )}
            </div>

            {/* Next Track Preview */}
            {currentChannelId === 'radio-24h' && nextTrack && (
              <span className="text-[10px] text-slate-400/90 truncate hidden md:inline">
                A seguir: <strong className="text-slate-300">{nextTrack.title}</strong> ({nextTrack.artistOrMinister})
              </span>
            )}
          </div>

          {/* Quick channel tabs */}
          <div className="hidden xl:flex items-center gap-1 ml-2 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            {channels.map((ch) => {
              const active = ch.id === currentChannelId;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ch.title.split('&')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Audio Controls (Prev, Play/Pause, Next, Equalizer, Volume, Mute) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Previous Track (when on 24h Radio) */}
          {currentChannelId === 'radio-24h' && (
            <button
              onClick={handlePrevTrack}
              aria-label="Louvor anterior na rotação 24h"
              className="p-1.5 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-900 transition-colors"
              title="Louvor anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          {/* Play / Pause Toggle */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar rádio 24h' : 'Tocar rádio 24h'}
            className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Track (when on 24h Radio) */}
          {currentChannelId === 'radio-24h' && (
            <button
              onClick={handleNextTrack}
              aria-label="Próximo louvor na rotação 24h"
              className="p-1.5 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-900 transition-colors"
              title="Próximo louvor"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}

          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? 'Desmutar rádio' : 'Mutar rádio'}
            className={`p-2 rounded-lg text-xs transition-colors ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Volume slider */}
          <div className="hidden sm:flex items-center gap-1.5 w-20 md:w-24">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              aria-label="Controle de volume da rádio"
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Equalizer Waveform Animation */}
          {isPlaying && !isMuted && (
            <div className="hidden lg:flex items-end gap-0.5 h-4 w-6 px-1" title="Em transmissão 24h contínua">
              <span className="w-1 bg-amber-400 rounded-t animate-[bounce_0.8s_infinite] h-2"></span>
              <span className="w-1 bg-amber-400 rounded-t animate-[bounce_1.2s_infinite] h-4"></span>
              <span className="w-1 bg-amber-400 rounded-t animate-[bounce_0.6s_infinite] h-3"></span>
            </div>
          )}
        </div>

        {/* Right: Admin Button, Countdown Pill, Multiplier Badge & Media Chamber */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Visual Radio Maintenance Countdown Component (Footer Pill) */}
          <RadioMaintenanceCountdownBadge
            maintenanceConfig={maintenanceConfig}
            onOpenAdmin={onOpenAdmin}
            variant="footer"
            showDetailsPopover={true}
          />

          {/* Admin Launcher Button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
              title="Abrir Área Administrativa da Rádio 24h & Streams"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin Rádio</span>
            </button>
          )}

          {/* Active Praise Multiplier */}
          {activeMultiplier ? (
            <div 
              onClick={onOpenPraiseChallenge}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-emerald-900/80 transition-colors shadow-sm"
              title="Multiplicador dos Frutos do Espírito ativo!"
            >
              <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="tabular-nums">
                +{Math.round((activeMultiplier.multiplier - 1) * 100)}% ({timeRemaining})
              </span>
            </div>
          ) : (
            <button
              onClick={onOpenPraiseChallenge}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
              title="Ativar um Desafio dos Salmos para ganhar bônus de colheita"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Salmos</span>
            </button>
          )}

          {/* Rank de Adoradores Quick Access */}
          {onOpenRank && (
            <button
              onClick={onOpenRank}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-300 border border-yellow-500/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
              title="Abrir Tabela de Classificação do Rank de Adoradores"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">Rank</span>
            </button>
          )}

          {/* Central Multimídia (Vídeos e Podcasts) */}
          <button
            onClick={onOpenMediaChamber}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-slate-600 text-xs font-medium transition-all shadow-sm"
            aria-label="Abrir central de vídeos e podcasts"
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span className="whitespace-nowrap hidden sm:inline">Vídeos & Podcasts</span>
            <span className="sm:hidden">Mídia</span>
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </footer>
  );
};
