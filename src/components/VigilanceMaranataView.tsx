/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { VIGILANCE_TOPICS } from '../data/biblicalContent';
import { VigilanceTopic, PlayerStats } from '../types/game';
import { soundService } from '../services/soundEffects';
import {
  Clock,
  Flame,
  Volume2,
  Sparkles,
  HeartHandshake,
  Gavel,
  ShieldAlert,
  Moon,
  SunMedium,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Heart,
  Sliders,
} from 'lucide-react';

interface VigilanceMaranataViewProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
}

export const VigilanceMaranataView: React.FC<VigilanceMaranataViewProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    VIGILANCE_TOPICS[0].id
  );
  const [criedMaranata, setCriedMaranata] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Vigil Timer State
  const [selectedDuration, setSelectedDuration] = useState<number>(180); // in seconds (default: 3 min)
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);

  // Vigilance Alert / Heartbeat Configuration
  const [heartbeatAlertEnabled, setHeartbeatAlertEnabled] = useState<boolean>(true);
  const [heartbeatThreshold, setHeartbeatThreshold] = useState<number>(30); // in seconds
  const timerIntervalRef = useRef<number | null>(null);

  const currentTopic =
    VIGILANCE_TOPICS.find((t) => t.id === selectedTopicId) || VIGILANCE_TOPICS[0];

  // Timer countdown loop
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            setTimerFinished(true);
            soundService.playShofarSound();
            soundService.playReconciliationChime();

            // Increment daily progress
            const updatedTimeline = stats.dailyProgress
              ? stats.dailyProgress.map((item, idx) => {
                  if (idx === stats.dailyProgress!.length - 1) {
                    return { ...item, oracoes: item.oracoes + 1 };
                  }
                  return item;
                })
              : undefined;

            onUpdateStats({
              ...stats,
              dailyProgress: updatedTimeline,
              fruits: {
                ...stats.fruits,
                paz: stats.fruits.paz + 10,
                fidelidade: stats.fruits.fidelidade + 10,
              },
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timeLeft, onUpdateStats, stats]);

  const handleStartTimer = () => {
    if (timerFinished) {
      setTimeLeft(selectedDuration);
      setTimerFinished(false);
    }
    setIsTimerRunning(true);
    soundService.playScriptureTone();
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    soundService.playScriptureTone();
  };

  const handleResetTimer = (newDuration?: number) => {
    setIsTimerRunning(false);
    const duration = newDuration !== undefined ? newDuration : selectedDuration;
    setTimeLeft(duration);
    setTimerFinished(false);
    soundService.playScriptureTone();
  };

  const handleDurationChange = (seconds: number) => {
    setSelectedDuration(seconds);
    // adjust threshold if duration is short
    if (seconds <= 60 && heartbeatThreshold > 15) {
      setHeartbeatThreshold(15);
    }
    handleResetTimer(seconds);
  };

  const handleProclaimMaranata = () => {
    soundService.playShofarSound();
    soundService.playAngelicHarpChime();
    setCriedMaranata(true);
    setTimeout(() => setCriedMaranata(false), 3500);

    // Speak aloud the cry of the Bride
    setIsSpeaking(true);
    soundService.speakText(
      'Maranata! O Espírito e a Noiva dizem: Vem! Certamente cedo venho. Amém! Ora vem, Senhor Jesus!',
      () => setIsSpeaking(false)
    );

    onUpdateStats({
      ...stats,
      maranataProclaimedCount: (stats.maranataProclaimedCount || 0) + 1,
      fruits: {
        ...stats.fruits,
        alegria: stats.fruits.alegria + 10,
        paz: stats.fruits.paz + 10,
        fidelidade: stats.fruits.fidelidade + 10,
      },
    });
  };

  // Formatter for MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.max(0, ((selectedDuration - timeLeft) / selectedDuration) * 100)
  );

  // Is heartbeat alert active?
  const isHeartbeatActive =
    heartbeatAlertEnabled && isTimerRunning && timeLeft > 0 && timeLeft <= heartbeatThreshold;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 rounded-2xl border border-amber-500/20 p-6 md:p-8 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-1">
              Vigília Espiritual dos Santos · Mateus 24:42 & Apocalipse 22:20
            </p>
            <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-white tracking-tight">
              A Qualquer Momento: Maranata, Ora Vem Senhor Jesus!
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
              "Ninguém sabe o dia nem a hora em que o ladrão virá." O ladrão vem apenas para roubar,
              matar e destruir, mas Jesus nos deu vida em abundância. Mantenha a lâmpada acesa,
              as vestes alvas e proclame com fervor o clamor da Igreja remida.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Clamores Proclamados:</span>
            <span className="text-sm font-semibold text-amber-300 tabular-nums">
              {stats.maranataProclaimedCount || 0} Maranatas
            </span>
          </div>
        </div>
      </div>

      {/* NOVO RECURSO: Cronômetro de Vigília com Alerta Visual Heartbeat */}
      <section
        className={`relative p-6 md:p-8 rounded-2xl border transition-all duration-500 shadow-2xl ${
          isHeartbeatActive
            ? 'bg-gradient-to-b from-rose-950/40 via-slate-950 to-amber-950/40 border-amber-400/80 animate-heartbeat'
            : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Timer Display & Controls */}
          <div className="space-y-4 text-center lg:text-left w-full lg:w-auto">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Cronômetro da Vigília Noturna · Mateus 26:41</span>
            </div>

            <div className="space-y-1">
              <div
                className={`font-mono text-5xl md:text-6xl font-bold tracking-tight tabular-nums transition-colors ${
                  isHeartbeatActive
                    ? 'text-rose-400 drop-shadow-[0_0_16px_rgba(239,68,68,0.5)]'
                    : timeLeft === 0
                    ? 'text-emerald-400'
                    : 'text-white'
                }`}
              >
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-slate-400">
                {isTimerRunning
                  ? isHeartbeatActive
                    ? 'Iminência da Chegada: A hora é chegada!'
                    : 'Vigília em andamento diante do Pai...'
                  : timerFinished
                  ? 'Vigília Concluída com Glória!'
                  : 'Tempo de recolhimento e oração no Espírito'}
              </p>
            </div>

            {/* Duration Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {[
                { sec: 60, label: '1 Minuto' },
                { sec: 180, label: '3 Minutos' },
                { sec: 300, label: '5 Minutos' },
                { sec: 600, label: '10 Minutos' },
              ].map((item) => (
                <button
                  key={item.sec}
                  onClick={() => handleDurationChange(item.sec)}
                  disabled={isTimerRunning}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    selectedDuration === item.sec
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  } ${isTimerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
              {!isTimerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all shadow-md active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{timeLeft === 0 ? 'Iniciar Nova Vigília' : 'Iniciar Vigília'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 transition-all border border-slate-700 active:scale-95"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausar Vigília</span>
                </button>
              )}

              <button
                onClick={() => handleResetTimer()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 transition-colors border border-slate-800"
                title="Reiniciar cronômetro"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>

          {/* Right: Heartbeat Configuration Deck & Theological Warning */}
          <div className="w-full lg:w-96 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${isHeartbeatActive ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                <span className="font-cinzel text-xs font-bold text-slate-200 uppercase tracking-wide">
                  Alerta de Iminência (Heartbeat)
                </span>
              </div>

              {/* Heartbeat Toggle */}
              <button
                onClick={() => setHeartbeatAlertEnabled(!heartbeatAlertEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  heartbeatAlertEnabled ? 'bg-amber-400' : 'bg-slate-800'
                }`}
                role="switch"
                aria-checked={heartbeatAlertEnabled}
                title="Ativar/desativar efeito pulsante de batimento cardíaco"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    heartbeatAlertEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Configura uma notificação visual pulsante no ritmo de um coração acelerado quando o tempo
              estiver próximo ao fim, simbolizando a urgência e a iminência da volta de Jesus Cristo.
            </p>

            {/* Threshold Selector */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Ativar Pulso Nos Últimos:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setHeartbeatThreshold(sec)}
                    disabled={!heartbeatAlertEnabled}
                    className={`py-1 px-2 text-xs rounded-lg border font-medium transition-colors ${
                      heartbeatThreshold === sec && heartbeatAlertEnabled
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    } ${!heartbeatAlertEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {sec} Segundos
                  </button>
                ))}
              </div>
            </div>

            {/* Active Heartbeat Status Notice */}
            {isHeartbeatActive && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400 animate-bounce shrink-0" />
                <span className="font-semibold">
                  Alerta da Iminência Ativo! O Noivo está às portas! (Mateus 24:33)
                </span>
              </div>
            )}

            {/* Timer Complete Toast */}
            {timerFinished && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">
                  Vigília Concluída: Oração registrada diante do Trono da Graça!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-6">
          <div
            className={`h-full transition-all duration-300 ${
              isHeartbeatActive
                ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300'
                : 'bg-amber-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* The Great Maranata Shofar Hero Strip */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-400/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>O Toque da Trombeta Celestial · 1 Coríntios 15:52</span>
          </div>
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-amber-100">
            "Maranata! O Espírito e a Noiva dizem: Vem!"
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
            Toque o Shofar espiritual e clame pela revelação do Noivo. A unção que despedaça todo jugo
            guarda a noiva imaculada até o grande Dia do Senhor.
          </p>
        </div>

        <button
          onClick={handleProclaimMaranata}
          className={`px-8 py-4 rounded-xl text-sm md:text-base font-bold whitespace-nowrap transition-all shadow-lg active:scale-95 flex items-center gap-3 shrink-0 ${
            criedMaranata
              ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300'
              : 'bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{criedMaranata ? 'Trombeta Soando nos Céus!' : 'Proclamar: Maranata, Ora Vem!'}</span>
        </button>
      </div>

      {/* Topics Grid: 3 Watchman Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VIGILANCE_TOPICS.map((top) => {
          const isSelected = top.id === selectedTopicId;

          return (
            <button
              key={top.id}
              onClick={() => {
                setSelectedTopicId(top.id);
                soundService.playScriptureTone();
              }}
              className={`p-5 rounded-2xl border text-left transition-all space-y-2 ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span>{top.scriptureRef}</span>
              </div>
              <h3 className="font-cinzel text-base font-bold text-slate-100">
                {top.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {top.alertContext}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Topic Deep Exploration */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-amber-400 font-semibold text-sm">
              {currentTopic.scriptureRef}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Alerta de Prontidão</span>
          </div>

          <button
            onClick={() => soundService.speakText(currentTopic.maranataPrayer)}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>Ouvir Oração</span>
          </button>
        </div>

        <div>
          <h2 className="font-cinzel text-2xl font-bold text-white tracking-tight">
            {currentTopic.title}
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {currentTopic.alertContext}
          </p>
        </div>

        {/* Biblical Holy Distinction: Mercy for Man vs. Judgment for Darkness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>Graça e Misericórdia para o Homem:</span>
            </div>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              {currentTopic.mercyForMan}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <Gavel className="w-4 h-4 text-rose-400" />
              <span>Juízo Lavrado para as Trevas:</span>
            </div>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              {currentTopic.judgmentForDarkness}
            </p>
          </div>
        </div>

        {/* Watchman's Warning Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs text-amber-200">
          <strong className="text-amber-400 block font-semibold text-xs uppercase tracking-wider">
            Orientação Pastoral de Jesus:
          </strong>
          <p className="leading-relaxed text-slate-300">
            {currentTopic.spiritualWarning}
          </p>
        </div>

        {/* The Prayer of Vigilance */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/30 to-slate-950 border border-amber-400/30 space-y-2 text-xs md:text-sm">
          <p className="font-semibold text-amber-300">Oração da Igreja Triunfante:</p>
          <p className="italic text-slate-200 font-serif leading-relaxed">
            "{currentTopic.maranataPrayer}"
          </p>
        </div>
      </div>
    </div>
  );
};
