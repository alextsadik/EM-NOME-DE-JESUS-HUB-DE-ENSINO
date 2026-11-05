/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Clock,
  Plus,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Flame,
  Heart,
  Sun,
  Sunset,
  Moon,
  Compass,
} from 'lucide-react';
import { PrayerReminder, PrayerReminderPeriod, PlayerStats } from '../types/game';
import { prayerReminderService } from '../services/prayerReminderService';
import { soundService } from '../services/soundEffects';

interface ScheduledPrayerRemindersPanelProps {
  onTriggerVisualAlert: (reminder: PrayerReminder) => void;
  onUpdateStats?: (updater: React.SetStateAction<PlayerStats>) => void;
}

export const ScheduledPrayerRemindersPanel: React.FC<ScheduledPrayerRemindersPanelProps> = ({
  onTriggerVisualAlert,
}) => {
  const [settings, setSettings] = useState(() => prayerReminderService.getSettings());
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newTime, setNewTime] = useState<string>('15:00');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPeriod, setNewPeriod] = useState<PrayerReminderPeriod>('tarde');
  const [newPrompt, setNewPrompt] = useState<string>('');
  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Periodically refresh upcoming reminder time display
  const [, setTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleReminder = (id: string) => {
    soundService.playDecreeClick();
    const updated = prayerReminderService.toggleReminder(id);
    setSettings(updated);
  };

  const handleToggleSound = (id: string) => {
    soundService.playDecreeClick();
    const updated = prayerReminderService.toggleSound(id);
    setSettings(updated);
  };

  const handleToggleGlobalSound = () => {
    const nextState = !settings.soundAlertsEnabled;
    soundService.playDecreeClick();
    const updated = prayerReminderService.setGlobalSoundEnabled(nextState);
    setSettings(updated);
  };

  const handleRequestBrowserPermission = async () => {
    const granted = await prayerReminderService.requestBrowserNotificationPermission();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
    if (granted) {
      soundService.playCelestialDecreeSound();
    }
  };

  const handleAddCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime || !newTitle.trim()) return;

    soundService.playPrayerChime();
    const updated = prayerReminderService.addReminder({
      time: newTime,
      title: newTitle.trim(),
      period: newPeriod,
      scriptureRef: 'Colossenses 3:17',
      verseText:
        'E tudo quanto fizerdes por palavras ou por obras, fazei-o em nome do Senhor Jesus, dando por ele graças a Deus Pai.',
      adorationPrompt:
        newPrompt.trim() ||
        'Momento consagrado ao Senhor Jesus: dê graças pelo sustento e apresente suas obras em santidade.',
      practicalAction: 'Diga: "Senhor Jesus, faço tudo para a Tua honra e glória!".',
      enabled: true,
      soundEnabled: true,
    });

    setSettings(updated);
    setNewTitle('');
    setNewPrompt('');
    setIsAddingNew(false);
  };

  const handleDeleteReminder = (id: string) => {
    soundService.playScriptureTone();
    const updated = prayerReminderService.deleteReminder(id);
    setSettings(updated);
  };

  const handleResetDefaults = () => {
    soundService.playScriptureTone();
    const updated = prayerReminderService.resetToDefaults();
    setSettings(updated);
  };

  const handleTestNow = (reminder?: PrayerReminder) => {
    const target = reminder || settings.reminders[0];
    if (target) {
      if (settings.soundAlertsEnabled && target.soundEnabled) {
        soundService.playPrayerReminderChime();
      }
      onTriggerVisualAlert(target);
    }
  };

  const upcoming = prayerReminderService.getNextUpcomingReminder();
  const activeCount = settings.reminders.filter((r) => r.enabled).length;

  const getPeriodIcon = (period: PrayerReminderPeriod) => {
    switch (period) {
      case 'manha':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'meio_dia':
        return <Flame className="w-4 h-4 text-amber-300" />;
      case 'tarde':
        return <Sunset className="w-4 h-4 text-orange-400" />;
      case 'noite':
        return <Moon className="w-4 h-4 text-indigo-300" />;
      case 'personalizado':
      default:
        return <Compass className="w-4 h-4 text-sky-400" />;
    }
  };

  const formatRemainingMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `em ${mins}m`;
    if (mins === 0) return `em ${hours}h`;
    return `em ${hours}h ${mins}m`;
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-amber-500/30 p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-base md:text-lg font-bold text-amber-300">
                Lembretes de Oração & Adoração Contínua
              </h2>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Colossenses 3:17
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Notificações visuais e sonoras agendadas para consagrar obras e palavras em Nome de Jesus
            </p>
          </div>
        </div>

        {/* Quick Actions Header */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          {/* Test Alert Button */}
          <button
            type="button"
            onClick={() => handleTestNow()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
            title="Abrir prévia visual do alerta de oração"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Testar Alerta Visual</span>
          </button>

          {/* Browser Notification Button */}
          <button
            type="button"
            onClick={handleRequestBrowserPermission}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              browserPermission === 'granted'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="Ativar notificações do navegador para receber alertas mesmo em segundo plano"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {browserPermission === 'granted'
                ? 'Notificações do Navegador: Ativas'
                : 'Ativar Notificações Navegador'}
            </span>
          </button>

          {/* Global Sound Alert Toggle */}
          <button
            type="button"
            onClick={handleToggleGlobalSound}
            className={`p-2 rounded-xl border transition-colors ${
              settings.soundAlertsEnabled
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={settings.soundAlertsEnabled ? 'Sons de Alerta Ativados' : 'Sons Desativados'}
          >
            {settings.soundAlertsEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isExpanded ? 'Recolher painel' : 'Expandir painel'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Summary Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">{activeCount} horários ativos</span>
          </div>

          {upcoming ? (
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Próximo Altar: <strong>{upcoming.reminder.time}</strong> ({upcoming.reminder.title}) —{' '}
                <span className="text-amber-200/90 font-medium">
                  {formatRemainingMinutes(upcoming.minutesRemaining)}
                </span>
              </span>
            </div>
          ) : (
            <span className="text-slate-500 italic">Nenhum horário ativado no momento.</span>
          )}
        </div>

        {/* Quick Presets Info */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Horários bíblicos:</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-amber-300">
            06:00
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-amber-300">
            12:00
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-amber-300">
            18:00
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-amber-300">
            21:00
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
          {/* Reminders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {settings.reminders.map((rem) => {
              return (
                <div
                  key={rem.id}
                  className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    rem.enabled
                      ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/30 border-slate-900 opacity-60'
                  }`}
                >
                  <div>
                    {/* Top row: Time + Period badge + Enable Toggle */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base md:text-lg text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/25">
                          {rem.time}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                          {getPeriodIcon(rem.period)}
                          <span className="capitalize">{rem.period}</span>
                        </div>
                        {rem.isPreset && (
                          <span className="text-[10px] text-amber-400/80 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Padrão
                          </span>
                        )}
                      </div>

                      {/* Enable Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleReminder(rem.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          rem.enabled
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title={rem.enabled ? 'Desativar este horário' : 'Ativar este horário'}
                      >
                        {rem.enabled ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Ativo</span>
                          </>
                        ) : (
                          <span>Inativo</span>
                        )}
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="font-cinzel text-sm font-bold text-slate-100 mb-1">
                      {rem.title}
                    </h3>

                    {/* Adoration Prompt snippet */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                      {rem.adorationPrompt}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-2.5 border-t border-slate-900 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-cinzel text-amber-400/80 font-semibold">
                      {rem.scriptureRef}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Sound toggle per reminder */}
                      <button
                        type="button"
                        onClick={() => handleToggleSound(rem.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          rem.soundEnabled
                            ? 'text-amber-400 hover:bg-amber-500/10'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title={rem.soundEnabled ? 'Som ativado' : 'Som desativado'}
                      >
                        {rem.soundEnabled ? (
                          <Volume2 className="w-3.5 h-3.5" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Preview / Trigger Now */}
                      <button
                        type="button"
                        onClick={() => handleTestNow(rem)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition-colors"
                        title="Visualizar a notificação deste lembrete agora"
                      >
                        Ver Alerta
                      </button>

                      {/* Delete button if custom */}
                      {!rem.isPreset && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReminder(rem.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                          title="Excluir este lembrete personalizado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form to Add Custom Prayer Time */}
          {isAddingNew ? (
            <form
              onSubmit={handleAddCustomReminder}
              className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 md:p-5 space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-cinzel text-sm font-bold text-amber-300">
                  Cadastrar Horário Personalizado de Oração
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Time Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Horário (HH:mm)
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Period Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Período do Dia
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value as PrayerReminderPeriod)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="manha">Manhã</option>
                    <option value="meio_dia">Meio-dia</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Nome / Propósito
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Altar das 15h, Intercessão da Família..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Prompt Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Incentivo de Oração & Prática de Colossenses 3:17
                </label>
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Ex: Parar 2 minutos para agradecer a Deus pelo sustento e consagrar as próximas tarefas em Nome de Jesus."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm"
                >
                  Salvar Horário Agendado
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Horário Específico</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                title="Restaura os horários sagrados das 06:00, 12:00, 18:00 e 21:00"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Horários Padrões Bíblicos</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
