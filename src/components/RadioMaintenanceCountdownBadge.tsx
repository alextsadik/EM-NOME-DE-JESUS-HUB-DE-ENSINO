/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  AlertTriangle,
  Wrench,
  Settings,
  ChevronRight,
  Info,
  Radio,
  X
} from 'lucide-react';
import { RadioMaintenanceConfig } from '../types/game';
import { DEFAULT_MAINTENANCE_CONFIG } from '../data/biblicalContent';

const DAYS_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export interface RadioMaintenanceCountdownBadgeProps {
  maintenanceConfig?: RadioMaintenanceConfig;
  onOpenAdmin?: () => void;
  variant?: 'header' | 'footer' | 'inline' | 'compact';
  showDetailsPopover?: boolean;
}

export function calculateMaintenanceCountdown(
  config: RadioMaintenanceConfig,
  now: Date = new Date()
) {
  if (config.isManualMaintenance) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isInProgress: true,
      isApproaching: false,
      isManual: true,
      formattedTarget: 'Intervenção Ministerial Manual',
      formattedDuration: 'Sob demanda',
      formattedRemaining: '00:00:00',
      statusBadge: {
        label: 'Manutenção Manual Ativa',
        sublabel: 'Rádio em calibração manual imediata',
        variant: 'active' as const,
      },
      targetDate: null,
    };
  }

  const targetDay = config.maintenanceDayOfWeek ?? 2;
  const [startH, startM] = (config.startHour || '02:00').split(':').map(Number);
  const [endH, endM] = (config.endHour || '04:30').split(':').map(Number);

  const safeStartH = Number.isNaN(startH) ? 2 : startH;
  const safeStartM = Number.isNaN(startM) ? 0 : startM;
  const safeEndH = Number.isNaN(endH) ? 4 : endH;
  const safeEndM = Number.isNaN(endM) ? 30 : endM;

  const currentDay = now.getDay();
  const daysUntil = (targetDay - currentDay + 7) % 7;

  let candStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntil,
    safeStartH,
    safeStartM,
    0,
    0
  );

  let candEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntil,
    safeEndH,
    safeEndM,
    0,
    0
  );

  // If overnight window (e.g. 23:00 to 02:00)
  if (candEnd.getTime() <= candStart.getTime()) {
    candEnd = new Date(candEnd.getTime() + 24 * 60 * 60 * 1000);
  }

  let isInProgress = false;
  let isApproaching = false;
  let remainingMs = 0;

  if (daysUntil === 0) {
    if (now.getTime() >= candStart.getTime() && now.getTime() <= candEnd.getTime()) {
      // Currently inside maintenance window
      isInProgress = true;
      remainingMs = Math.max(0, candEnd.getTime() - now.getTime());
    } else if (now.getTime() > candEnd.getTime()) {
      // Maintenance window passed today, calculate for next week
      candStart = new Date(candStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      candEnd = new Date(candEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
      remainingMs = Math.max(0, candStart.getTime() - now.getTime());
    } else {
      // Starts later today
      remainingMs = Math.max(0, candStart.getTime() - now.getTime());
      const preAlertMs = (config.preAlertMinutes || 30) * 60 * 1000;
      if (remainingMs <= preAlertMs) {
        isApproaching = true;
      }
    }
  } else {
    // Scheduled for future day
    remainingMs = Math.max(0, candStart.getTime() - now.getTime());
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  let formattedRemaining = '';
  if (days > 0) {
    formattedRemaining = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else if (hours > 0) {
    formattedRemaining = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  } else {
    formattedRemaining = `${pad(minutes)}m ${pad(seconds)}s`;
  }

  // Format Duration
  const windowDurationMinutes = Math.round((candEnd.getTime() - candStart.getTime()) / 60000);
  const durH = Math.floor(windowDurationMinutes / 60);
  const durM = windowDurationMinutes % 60;
  const formattedDuration =
    durH > 0 ? `${durH}h${durM > 0 ? ` ${durM}min` : ''}` : `${durM}min`;

  const dayName = DAYS_NAMES[targetDay] || 'Terça-feira';
  const formattedTarget = `Toda ${dayName} às ${config.startHour || '02:00'}`;

  let variant: 'normal' | 'pre_alert' | 'active' = 'normal';
  let label = 'Próx. Manutenção';
  let sublabel = `Prevista para ${dayName} às ${config.startHour || '02:00'}`;

  if (isInProgress) {
    variant = 'active';
    label = 'Manutenção Ativa';
    sublabel = `Termina em ${formattedRemaining}`;
  } else if (isApproaching) {
    variant = 'pre_alert';
    label = 'Manutenção em Breve';
    sublabel = `Inicia em ${formattedRemaining}`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isInProgress,
    isApproaching,
    isManual: false,
    formattedTarget,
    formattedDuration,
    formattedRemaining,
    targetDate: candStart,
    statusBadge: {
      label,
      sublabel,
      variant,
    },
  };
}

export const RadioMaintenanceCountdownBadge: React.FC<RadioMaintenanceCountdownBadgeProps> = ({
  maintenanceConfig = DEFAULT_MAINTENANCE_CONFIG,
  onOpenAdmin,
  variant = 'header',
  showDetailsPopover = true,
}) => {
  const [config, setConfig] = useState<RadioMaintenanceConfig>(maintenanceConfig);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Sync prop updates
  useEffect(() => {
    setConfig(maintenanceConfig);
  }, [maintenanceConfig]);

  // Sync with localStorage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'em_nome_de_jesus_radio_maintenance' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setConfig(parsed);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 1-second ticking clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isPopoverOpen]);

  const countdown = useMemo(() => {
    return calculateMaintenanceCountdown(config, currentTime);
  }, [config, currentTime]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  // ==========================================
  // FOOTER VARIANT (Compact, responsive pill)
  // ==========================================
  if (variant === 'footer') {
    return (
      <div className="relative inline-flex items-center" ref={popoverRef}>
        <button
          onClick={() => {
            if (showDetailsPopover) {
              setIsPopoverOpen(!isPopoverOpen);
            } else if (onOpenAdmin) {
              onOpenAdmin();
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all active:scale-95 select-none ${
            countdown.statusBadge.variant === 'active'
              ? 'bg-rose-950/80 hover:bg-rose-900/90 border-rose-500/50 text-rose-300 shadow-sm shadow-rose-950'
              : countdown.statusBadge.variant === 'pre_alert'
              ? 'bg-amber-950/80 hover:bg-amber-900/90 border-amber-500/50 text-amber-300 animate-pulse shadow-sm shadow-amber-950'
              : 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/25 text-amber-300 hover:text-amber-200'
          }`}
          title="Clique para ver os detalhes da contagem de manutenção da Rádio 24h"
          aria-label="Contagem regressiva da manutenção da rádio"
        >
          {countdown.statusBadge.variant === 'active' ? (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
          ) : countdown.statusBadge.variant === 'pre_alert' ? (
            <AlertTriangle className="w-3 h-3 text-amber-400 animate-bounce" />
          ) : (
            <Clock className="w-3 h-3 text-amber-400" />
          )}

          <span className="hidden sm:inline font-sans text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {countdown.isInProgress ? 'Manutenção:' : 'Manut. Rádio:'}
          </span>

          <span className="font-bold text-amber-200 tracking-tight tabular-nums">
            {countdown.isInProgress ? (
              <span className="text-rose-300 font-sans font-semibold">
                Ativa ({countdown.formattedRemaining})
              </span>
            ) : (
              countdown.formattedRemaining
            )}
          </span>
        </button>

        {/* Popover on click */}
        {isPopoverOpen && (
          <div className="absolute bottom-full mb-2 right-0 w-72 sm:w-80 bg-slate-950 border border-amber-500/40 rounded-xl shadow-2xl p-3.5 z-50 animate-fadeIn text-left font-sans">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Programação de Manutenção</span>
              </div>
              <button
                onClick={() => setIsPopoverOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Tempo Exato Restante:</span>
                  <span className="font-mono font-bold text-amber-300 text-xs tabular-nums">
                    {countdown.formattedRemaining}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Janela Recorrente:</span>
                  <span className="font-medium text-slate-200">
                    {DAYS_SHORT[config.maintenanceDayOfWeek ?? 2]}, {config.startHour} às {config.endHour}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Duração Prevista:</span>
                  <span className="font-medium text-slate-200">{countdown.formattedDuration}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                "{config.alertMessage}"
              </p>

              {onOpenAdmin && (
                <button
                  onClick={() => {
                    setIsPopoverOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-950" />
                  <span>Ajustar Data & Hora no Admin</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // HEADER VARIANT (TopBar Component)
  // ==========================================
  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      <button
        onClick={() => {
          if (showDetailsPopover) {
            setIsPopoverOpen(!isPopoverOpen);
          } else if (onOpenAdmin) {
            onOpenAdmin();
          }
        }}
        className={`group flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs transition-all active:scale-95 shadow-sm select-none ${
          countdown.statusBadge.variant === 'active'
            ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/50 text-rose-200 ring-1 ring-rose-500/30'
            : countdown.statusBadge.variant === 'pre_alert'
            ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/50 text-amber-200 animate-pulse ring-1 ring-amber-500/30'
            : 'bg-slate-900/90 hover:bg-slate-800/90 border-amber-500/30 text-amber-300 hover:text-amber-200 hover:border-amber-400/50'
        }`}
        title="Tempo exato para o próximo dia de manutenção da rádio 24h"
        aria-label="Contagem regressiva até a próxima manutenção técnica da rádio"
      >
        {/* Pulsing state icon */}
        <div className="relative flex items-center justify-center shrink-0">
          {countdown.statusBadge.variant === 'active' ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          ) : countdown.statusBadge.variant === 'pre_alert' ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400/90"></span>
            </span>
          )}
        </div>

        {/* Label and Live Countdown Display */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          
          <span className="font-semibold text-slate-300 text-[11px] hidden lg:inline whitespace-nowrap">
            {countdown.isInProgress
              ? 'Manutenção Ativa:'
              : countdown.isApproaching
              ? 'Aviso Manutenção:'
              : 'Manut. Rádio:'}
          </span>

          {/* Number countdown pill */}
          <div className="font-mono text-[11px] font-bold text-amber-300 tracking-tight flex items-center gap-0.5 tabular-nums">
            {countdown.days > 0 && (
              <span className="bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 text-amber-200">
                {countdown.days}d
              </span>
            )}
            <span className="bg-slate-950/80 px-1 py-0.5 rounded border border-slate-800 text-amber-300">
              {pad(countdown.hours)}h
            </span>
            <span className="text-amber-500/70">:</span>
            <span className="bg-slate-950/80 px-1 py-0.5 rounded border border-slate-800 text-amber-300">
              {pad(countdown.minutes)}m
            </span>
            <span className="text-amber-500/70">:</span>
            <span className="bg-slate-950/80 px-1 py-0.5 rounded border border-slate-800 text-amber-400">
              {pad(countdown.seconds)}s
            </span>
          </div>
        </div>

        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors hidden sm:inline" />
      </button>

      {/* Popover on click with full schedule, quick settings & admin shortcut */}
      {isPopoverOpen && (
        <div className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 w-80 bg-slate-950 border border-amber-500/40 rounded-xl shadow-2xl p-4 z-50 animate-fadeIn text-left font-sans">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Manutenção da Rádio 24h</span>
            </div>
            <button
              onClick={() => setIsPopoverOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Status overview */}
            <div
              className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                countdown.statusBadge.variant === 'active'
                  ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                  : countdown.statusBadge.variant === 'pre_alert'
                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                  : 'bg-slate-900/90 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-300">Status Atual:</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                    countdown.statusBadge.variant === 'active'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : countdown.statusBadge.variant === 'pre_alert'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {countdown.statusBadge.label}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Contagem Regressiva:</span>
                <span className="font-mono font-bold text-amber-300 text-sm tabular-nums">
                  {countdown.formattedRemaining}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Dia & Horário Configurado:</span>
                <span className="text-slate-200 font-medium">
                  {DAYS_NAMES[config.maintenanceDayOfWeek ?? 2]}, das {config.startHour} às {config.endHour}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Janela de Interrupção:</span>
                <span className="text-slate-200 font-medium">{countdown.formattedDuration}</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Silenciar Áudio Automático:</span>
                <span className={config.autoSilenceAudio ? 'text-amber-300 font-medium' : 'text-slate-400'}>
                  {config.autoSilenceAudio ? 'Sim (Pausa automática)' : 'Não (Fluxo mantido)'}
                </span>
              </div>
            </div>

            {/* Ministerial Notice */}
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Aviso aos Ouvintes:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed italic">
                "{config.alertMessage}"
              </p>
            </div>

            {/* Quick Admin Navigation */}
            {onOpenAdmin && (
              <button
                onClick={() => {
                  setIsPopoverOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Settings className="w-3.5 h-3.5 text-slate-950" />
                <span>Modificar Data & Hora no Admin</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
