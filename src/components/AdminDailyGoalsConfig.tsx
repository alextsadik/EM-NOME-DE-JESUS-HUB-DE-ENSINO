/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Flame,
  CheckCircle2,
  RotateCcw,
  Save,
  BookOpen,
  Clock,
  Heart,
  Shield,
  Award,
  HelpCircle,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { DailySpiritualGoalsConfig, PlayerStats } from '../types/game';
import { DEFAULT_DAILY_GOALS_CONFIG, DAILY_GOALS_PRESETS } from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';

interface AdminDailyGoalsConfigProps {
  currentConfig: DailySpiritualGoalsConfig;
  onSaveConfig: (newConfig: DailySpiritualGoalsConfig) => void;
  playerStats?: PlayerStats;
}

const FRUIT_OPTIONS: { id: keyof PlayerStats['fruits']; label: string; icon: string; color: string }[] = [
  { id: 'alegria', label: 'Alegria', icon: '✨', color: 'text-amber-300' },
  { id: 'paz', label: 'Paz', icon: '🕊️', color: 'text-sky-300' },
  { id: 'amor', label: 'Amor', icon: '❤️', color: 'text-rose-300' },
  { id: 'fidelidade', label: 'Fidelidade', icon: '🛡️', color: 'text-indigo-300' },
  { id: 'dominioProprio', label: 'Domínio Próprio', icon: '⚓', color: 'text-emerald-300' },
  { id: 'longanimidade', label: 'Longanimidade', icon: '🌱', color: 'text-teal-300' },
  { id: 'benignidade', label: 'Benignidade', icon: '🤲', color: 'text-cyan-300' },
  { id: 'bondade', label: 'Bondade', icon: '💎', color: 'text-yellow-300' },
  { id: 'mansidao', label: 'Mansidão', icon: '🐑', color: 'text-slate-300' },
];

export const AdminDailyGoalsConfig: React.FC<AdminDailyGoalsConfigProps> = ({
  currentConfig,
  onSaveConfig,
  playerStats,
}) => {
  const [config, setConfig] = useState<DailySpiritualGoalsConfig>(currentConfig || DEFAULT_DAILY_GOALS_CONFIG);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const handleApplyPreset = (presetId: string) => {
    const preset = DAILY_GOALS_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setConfig({
      ...preset.config,
      updatedAt: Date.now(),
    });
    setActivePresetId(presetId);
    soundService.playScriptureTone();
  };

  const handleSave = () => {
    const sanitized: DailySpiritualGoalsConfig = {
      prayerTargetCount: Math.max(1, Number(config.prayerTargetCount) || 3),
      prayerMinutesTarget: Math.max(1, Number(config.prayerMinutesTarget) || 15),
      decreesTargetCount: Math.max(1, Number(config.decreesTargetCount) || 5),
      meditationMinutesTarget: Math.max(1, Number(config.meditationMinutesTarget) || 15),
      rewardFruit: config.rewardFruit || 'alegria',
      rewardFruitAmount: Math.max(5, Number(config.rewardFruitAmount) || 25),
      rewardGraceBonus: Math.max(10, Number(config.rewardGraceBonus) || 120),
      bannerNote: config.bannerNote?.trim() || DEFAULT_DAILY_GOALS_CONFIG.bannerNote,
      updatedAt: Date.now(),
    };

    onSaveConfig(sanitized);
    setSavedSuccess(true);
    soundService.playCelestialDecreeSound();
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar as metas diárias para a configuração padrão bíblica recomendada?')) {
      setConfig({ ...DEFAULT_DAILY_GOALS_CONFIG, updatedAt: Date.now() });
      setActivePresetId('padrao');
      soundService.playScriptureTone();
    }
  };

  const handleTestSound = () => {
    soundService.playDailyGoalsCompletedChime();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Target className="w-5 h-5" />
            </span>
            <h3 className="text-base md:text-lg font-bold font-cinzel text-amber-200">
              Configuração Ministerial de Metas Diárias
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Sincronizado com Missões
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Defina os alvos diários de comunhão para a membresia e jogadores: oração contínua, proclamação de decretos e tempo de meditação bíblica. Quando cumpridas, uma celebração visual dinâmica é acionada na interface de Missões.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTestSound}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Ouvir toque celestial de celebração das metas"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Testar Som de Celebração</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs md:text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Metas Salvas com Sucesso no Altar Ministerial!</span>
            <p className="text-xs text-emerald-300/80">
              A tela de Missões já está atualizada com estes novos parâmetros de oração, decretos e meditação.
            </p>
          </div>
        </div>
      )}

      {/* Preset Quick Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Modelos e Presets Devocionais Rápidos</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DAILY_GOALS_PRESETS.map((p) => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className={`p-3.5 rounded-xl text-left border transition-all relative ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50 text-amber-200'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-slate-100">{p.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                    {p.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{p.description}</p>
                <div className="text-[10px] text-amber-300/80 font-mono flex items-center gap-2">
                  <span>🙏 {p.config.prayerTargetCount}x</span>
                  <span>📜 {p.config.decreesTargetCount}x</span>
                  <span>🎧 {p.config.meditationMinutesTarget}m</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Target Editors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Prayer Goal */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Meta de Oração</h4>
              <p className="text-[11px] text-slate-400">Colossenses 4:2 & 1 Tess. 5:17</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Quantidade de Orações Diárias
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.prayerTargetCount}
                  onChange={(e) => setConfig({ ...config, prayerTargetCount: parseInt(e.target.value) || 1 })}
                  className="w-24 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-bold text-sky-300 focus:outline-none focus:border-sky-400"
                />
                <div className="text-xs text-slate-400">
                  <span>momentos ou pedidos de oração registrados no dia</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Tempo Recomendado em Intercessão (Minutos)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                step="5"
                value={config.prayerMinutesTarget || 15}
                onChange={(e) => setConfig({ ...config, prayerMinutesTarget: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-slate-200 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-sky-950/20 border border-sky-500/20 text-[11px] text-sky-300/90 leading-tight">
              💡 <span className="font-semibold">Bíblico:</span> Daniel orava 3 vezes ao dia (Dn 6:10). David clamava de manhã, ao meio-dia e à noite (Sl 55:17).
            </div>
          </div>
        </div>

        {/* 2. Decree Readings Goal */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Leitura de Decretos</h4>
              <p className="text-[11px] text-slate-400">Jó 22:28 & Romanos 4:17</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Decretos Lidos / Proclamados no Dia
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.decreesTargetCount}
                  onChange={(e) => setConfig({ ...config, decreesTargetCount: parseInt(e.target.value) || 1 })}
                  className="w-24 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
                <div className="text-xs text-slate-400">
                  <span>decretos de autoridade proclamados com fé</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300/90 leading-tight">
                💡 <span className="font-semibold">Bíblico:</span> "Determinando tu algum negócio, ser-te-á firme, e a luz brilhará em teus caminhos." — Jó 22:28
              </div>
            </div>
          </div>
        </div>

        {/* 3. Meditation Time Goal */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Tempo de Meditação</h4>
              <p className="text-[11px] text-slate-400">Salmos 1:2 & Josué 1:8</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Minutos Diários de Meditação / Adoração
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="180"
                  step="5"
                  value={config.meditationMinutesTarget}
                  onChange={(e) => setConfig({ ...config, meditationMinutesTarget: parseInt(e.target.value) || 5 })}
                  className="w-24 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                />
                <div className="text-xs text-slate-400">
                  <span>minutos escutando a Rádio Web ou em silêncio</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300/90 leading-tight">
                💡 <span className="font-semibold">Bíblico:</span> "Antes tem o seu prazer na lei do Senhor, e na sua lei medita de dia e de noite." — Sl 1:2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reward & Feedback Configuration */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-bold text-slate-100">
            Recompensa Celestial ao Bater Todas as Metas
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Fruto do Espírito Bonificado
            </label>
            <select
              value={config.rewardFruit}
              onChange={(e) => setConfig({ ...config, rewardFruit: e.target.value as keyof PlayerStats['fruits'] })}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {FRUIT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.icon} {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Quantidade de Fruto Concedida
            </label>
            <input
              type="number"
              min="5"
              max="200"
              step="5"
              value={config.rewardFruitAmount}
              onChange={(e) => setConfig({ ...config, rewardFruitAmount: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Bônus de Graça Celestial (Pontos)
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              step="10"
              value={config.rewardGraceBonus}
              onChange={(e) => setConfig({ ...config, rewardGraceBonus: parseInt(e.target.value) || 50 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Nota Pastoral / Exortação Exibida no Altar das Missões
          </label>
          <input
            type="text"
            value={config.bannerNote || ''}
            onChange={(e) => setConfig({ ...config, bannerNote: e.target.value })}
            placeholder="Ex: Consagrem suas horas diárias ao Senhor através da oração perseverante..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restaurar Padrão Bíblico</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Metas Diárias</span>
        </button>
      </div>
    </div>
  );
};
