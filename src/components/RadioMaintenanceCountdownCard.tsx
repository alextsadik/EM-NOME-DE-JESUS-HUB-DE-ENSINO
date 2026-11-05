/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  Radio,
  Settings,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Wrench,
  Sparkles,
  Volume2,
  VolumeX,
  ExternalLink
} from 'lucide-react';
import { RadioMaintenanceConfig } from '../types/game';
import { DEFAULT_MAINTENANCE_CONFIG } from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';

interface RadioMaintenanceCountdownCardProps {
  maintenanceConfig?: RadioMaintenanceConfig;
  onOpenAdmin?: () => void;
  className?: string;
  initiallyExpanded?: boolean;
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export const RadioMaintenanceCountdownCard: React.FC<RadioMaintenanceCountdownCardProps> = ({
  maintenanceConfig = DEFAULT_MAINTENANCE_CONFIG,
  onOpenAdmin,
  className = '',
  initiallyExpanded = true
}) => {
  const [config, setConfig] = useState<RadioMaintenanceConfig>(maintenanceConfig);
  const [isExpanded, setIsExpanded] = useState<boolean>(initiallyExpanded);
  const [showFullNotice, setShowFullNotice] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Keep internal state synced if parent updates or if localStorage changes
  useEffect(() => {
    setConfig(maintenanceConfig);
  }, [maintenanceConfig]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'em_nome_de_jesus_radio_maintenance' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setConfig(parsed);
        } catch {
          // ignore parsing error
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate detailed maintenance status & countdown values
  const countdownData = useMemo(() => {
    if (config.isManualMaintenance) {
      return {
        isManual: true,
        isInProgress: true,
        isApproaching: false,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        targetStart: null,
        targetEnd: null,
        durationMinutes: 0,
        formattedWindow: 'Manutenção forçada ativa (intervenção ministerial manual)',
        statusTitle: 'Manutenção Manual Ativa',
        statusColor: 'rose',
      };
    }

    const now = currentTime;
    const targetDay = config.maintenanceDayOfWeek ?? 2;
    const [startH, startM] = (config.startHour || '02:00').split(':').map(Number);
    const [endH, endM] = (config.endHour || '04:30').split(':').map(Number);

    const safeStartH = Number.isNaN(startH) ? 2 : startH;
    const safeStartM = Number.isNaN(startM) ? 0 : startM;
    const safeEndH = Number.isNaN(endH) ? 4 : endH;
    const safeEndM = Number.isNaN(endM) ? 30 : endM;

    // Days until the target weekday (0..6)
    const currentDay = now.getDay();
    let daysUntil = (targetDay - currentDay + 7) % 7;

    // Build this week's candidate start Date
    let candStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntil,
      safeStartH,
      safeStartM,
      0,
      0
    );

    // Build this week's candidate end Date
    let candEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntil,
      safeEndH,
      safeEndM,
      0,
      0
    );

    // If end hour is less than start hour (overnight window across midnight)
    if (candEnd.getTime() <= candStart.getTime()) {
      candEnd = new Date(candEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    let isInProgress = false;
    let isApproaching = false;
    let remainingMs = 0;

    // If it's today
    if (daysUntil === 0) {
      if (now.getTime() >= candStart.getTime() && now.getTime() <= candEnd.getTime()) {
        // We are currently INSIDE the maintenance window!
        isInProgress = true;
        remainingMs = Math.max(0, candEnd.getTime() - now.getTime());
      } else if (now.getTime() > candEnd.getTime()) {
        // Window already passed today -> schedule is for NEXT week (+7 days)
        candStart = new Date(candStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        candEnd = new Date(candEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
        remainingMs = Math.max(0, candStart.getTime() - now.getTime());
      } else {
        // Today, but maintenance starts later
        remainingMs = Math.max(0, candStart.getTime() - now.getTime());
        const preAlertMs = (config.preAlertMinutes || 30) * 60 * 1000;
        if (remainingMs <= preAlertMs) {
          isApproaching = true;
        }
      }
    } else {
      // Future day this week
      remainingMs = Math.max(0, candStart.getTime() - now.getTime());
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Calculate window duration in minutes
    const windowDurationMinutes = Math.round((candEnd.getTime() - candStart.getTime()) / 60000);
    const durationHours = Math.floor(windowDurationMinutes / 60);
    const durationMins = windowDurationMinutes % 60;
    const durationText =
      durationHours > 0
        ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}min` : ''}`
        : `${durationMins}min`;

    const dayName = DAYS_OF_WEEK[targetDay] || 'Terça-feira';
    const formattedWindow = `Toda ${dayName}, das ${config.startHour || '02:00'} às ${config.endHour || '04:30'} (${durationText})`;

    let statusTitle = 'Operação Normal 24h';
    let statusColor: 'emerald' | 'amber' | 'rose' = 'emerald';

    if (isInProgress) {
      statusTitle = 'Manutenção Técnica em Andamento';
      statusColor = 'rose';
    } else if (isApproaching) {
      statusTitle = 'Aviso: Manutenção se Aproximando';
      statusColor = 'amber';
    }

    return {
      isManual: false,
      isInProgress,
      isApproaching,
      days,
      hours,
      minutes,
      seconds,
      targetStart: candStart,
      targetEnd: candEnd,
      durationMinutes: windowDurationMinutes,
      formattedWindow,
      statusTitle,
      statusColor,
    };
  }, [config, currentTime]);

  const padZero = (num: number) => num.toString().padStart(2, '0');

  return (
    <section
      aria-label="Contagem regressiva para manutenção da rádio"
      className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg ${
        countdownData.statusColor === 'rose'
          ? 'bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 border-rose-500/40 shadow-rose-950/20'
          : countdownData.statusColor === 'amber'
          ? 'bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950 border-amber-500/40 shadow-amber-950/20'
          : 'bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 border-amber-500/20 shadow-black/40'
      } ${className}`}
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              countdownData.statusColor === 'rose'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : countdownData.statusColor === 'amber'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {countdownData.isInProgress ? (
              <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            ) : countdownData.isApproaching ? (
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            ) : (
              <Radio className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-base md:text-lg font-bold text-white tracking-wide">
                Rádio Web 24h · Manutenção Programada
              </span>
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  countdownData.statusColor === 'rose'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                    : countdownData.statusColor === 'amber'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    countdownData.statusColor === 'rose'
                      ? 'bg-rose-400'
                      : countdownData.statusColor === 'amber'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                {countdownData.statusTitle}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              {countdownData.formattedWindow}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {onOpenAdmin && (
            <button
              onClick={() => {
                soundService.playScriptureTone();
                onOpenAdmin();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all active:scale-95 shadow-sm"
              title="Ajustar dia e horário de manutenção no Painel Administrativo"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ajustar no Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800 transition-colors"
            title={isExpanded ? 'Recolher detalhes' : 'Expandir contador'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Countdown Body */}
      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Active Maintenance Alert Banner (when in progress) */}
          {countdownData.isInProgress && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs sm:text-sm space-y-1">
                <p className="font-semibold text-rose-300">
                  Período de Calibração e Manutenção Técnica Ativo
                </p>
                <p className="text-rose-200/90 leading-relaxed">
                  {config.alertMessage ||
                    'A transmissão da Rádio 24h está em janela de alinhamento técnico. Retornaremos com a programação ininterrupta em breve!'}
                </p>
                <p className="text-xs text-rose-300/70 pt-1">
                  Tempo estimado restante para o término da manutenção:
                </p>
              </div>
            </div>
          )}

          {/* Pre-Alert Window Banner (when approaching within X minutes) */}
          {countdownData.isApproaching && !countdownData.isInProgress && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs sm:text-sm space-y-1">
                <p className="font-semibold text-amber-300">
                  Atenção: Janela de Manutenção Técnica em Instantes
                </p>
                <p className="text-amber-200/90 leading-relaxed">
                  Faltam menos de {config.preAlertMinutes || 30} minutos para o início da calibração programada.
                  A transmissão poderá apresentar breves pausas técnicas.
                </p>
              </div>
            </div>
          )}

          {/* 4-Tile Visual Countdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Days Tile */}
            <div className="relative rounded-xl p-3.5 sm:p-4 text-center bg-slate-950/80 border border-amber-500/20 shadow-inner group hover:border-amber-400/40 transition-colors">
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-amber-300 tabular-nums tracking-wider drop-shadow-sm">
                {padZero(countdownData.days)}
              </div>
              <div className="text-[11px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
                {countdownData.days === 1 ? 'Dia' : 'Dias'}
              </div>
              <div className="absolute top-2 right-2.5 text-[10px] text-slate-600 font-mono">
                D-24h
              </div>
            </div>

            {/* Hours Tile */}
            <div className="relative rounded-xl p-3.5 sm:p-4 text-center bg-slate-950/80 border border-amber-500/20 shadow-inner group hover:border-amber-400/40 transition-colors">
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-amber-300 tabular-nums tracking-wider drop-shadow-sm">
                {padZero(countdownData.hours)}
              </div>
              <div className="text-[11px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
                {countdownData.hours === 1 ? 'Hora' : 'Horas'}
              </div>
              <div className="absolute top-2 right-2.5 text-[10px] text-slate-600 font-mono">
                HR
              </div>
            </div>

            {/* Minutes Tile */}
            <div className="relative rounded-xl p-3.5 sm:p-4 text-center bg-slate-950/80 border border-amber-500/20 shadow-inner group hover:border-amber-400/40 transition-colors">
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-amber-300 tabular-nums tracking-wider drop-shadow-sm">
                {padZero(countdownData.minutes)}
              </div>
              <div className="text-[11px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
                {countdownData.minutes === 1 ? 'Minuto' : 'Minutos'}
              </div>
              <div className="absolute top-2 right-2.5 text-[10px] text-slate-600 font-mono">
                MIN
              </div>
            </div>

            {/* Seconds Tile */}
            <div className="relative rounded-xl p-3.5 sm:p-4 text-center bg-slate-950/80 border border-amber-500/20 shadow-inner group hover:border-amber-400/40 transition-colors">
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-amber-400 tabular-nums tracking-wider drop-shadow-sm animate-pulse">
                {padZero(countdownData.seconds)}
              </div>
              <div className="text-[11px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
                Segundos
              </div>
              <div className="absolute top-2 right-2.5 text-[10px] text-slate-600 font-mono">
                SEG
              </div>
            </div>
          </div>

          {/* Target Timestamp & Configuration Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            {/* Target Date */}
            <div className="flex items-center gap-2.5 text-slate-300">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  {countdownData.isInProgress ? 'Término Previsto' : 'Próxima Ocorrência'}
                </span>
                <span className="font-medium text-slate-200">
                  {countdownData.targetStart
                    ? `${DAYS_OF_WEEK[config.maintenanceDayOfWeek]}, ${config.startHour} às ${config.endHour}`
                    : 'Horário sob demanda'}
                </span>
              </div>
            </div>

            {/* Auto Silence & Audio Behavior */}
            <div className="flex items-center gap-2.5 text-slate-300">
              {config.autoSilenceAudio ? (
                <VolumeX className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Comportamento do Áudio
                </span>
                <span className="font-medium text-slate-200">
                  {config.autoSilenceAudio
                    ? 'Pausa automática durante manutenção'
                    : 'Transmissão contínua com aviso em tela'}
                </span>
              </div>
            </div>

            {/* Advance Notice Alert Window */}
            <div className="flex items-center gap-2.5 text-slate-300">
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                  Alerta Ministerial Prévio
                </span>
                <span className="font-medium text-slate-200">
                  {config.preAlertMinutes || 30} minutos antes do início
                </span>
              </div>
            </div>
          </div>

          {/* Ministerial Alert Notice Box (Collapsible / Viewable) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden text-xs">
            <button
              onClick={() => setShowFullNotice(!showFullNotice)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-2 text-slate-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Mensagem de Alerta Configurada no Admin para os Fiéis & Ouvintes</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-300">
                <span>{showFullNotice ? 'Ocultar' : 'Visualizar mensagem'}</span>
                {showFullNotice ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showFullNotice && (
              <div className="px-4 pb-3.5 pt-1 space-y-2 border-t border-slate-800/60 bg-slate-900/40">
                <p className="text-slate-300 leading-relaxed italic">
                  "{config.alertMessage || 'Aviso Ministerial: A Rádio Web 24h está em período de manutenção técnica preventiva...'}"
                </p>
                {config.contactNotice && (
                  <p className="text-[11px] text-slate-400 font-semibold pt-1">
                    Responsabilidade: <span className="text-amber-300">{config.contactNotice}</span>
                  </p>
                )}
                {onOpenAdmin && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        soundService.playScriptureTone();
                        onOpenAdmin();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 hover:underline"
                    >
                      <Settings className="w-3 h-3" />
                      Editar esta mensagem e reprogramar dia no Admin
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
