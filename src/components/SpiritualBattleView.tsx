/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SPIRITUAL_COMMANDS, AUTHORITY_SCRIPTURES } from '../data/biblicalContent';
import {
  SpiritualCommand,
  PlayerStats,
  MinistryDayActivity,
  AuthorityScriptureGuide,
} from '../types/game';
import { soundService } from '../services/soundEffects';
import {
  Shield,
  Flame,
  Volume2,
  Sparkles,
  Lock,
  Scissors,
  VolumeX,
  Zap,
  Gavel,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Plus,
  Share2,
  Check,
  Award,
  Crown,
} from 'lucide-react';
import { TrainingGroundView } from './TrainingGroundView';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface SpiritualBattleViewProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
}

export const SpiritualBattleView: React.FC<SpiritualBattleViewProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [activeBattleSubTab, setActiveBattleSubTab] = useState<'comandos' | 'treinamento'>('treinamento');
  const [selectedCommandId, setSelectedCommandId] = useState<string>(
    SPIRITUAL_COMMANDS[0].id
  );
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [prayerRegisteredToast, setPrayerRegisteredToast] = useState<boolean>(false);

  // Authority Guide States
  const [selectedSphere, setSelectedSphere] = useState<string>('todas');
  const [proclaimedAuthorityId, setProclaimedAuthorityId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentCommand =
    SPIRITUAL_COMMANDS.find((c) => c.id === selectedCommandId) || SPIRITUAL_COMMANDS[0];

  // Ensure dailyProgress has data
  const currentTimeline: MinistryDayActivity[] =
    stats.dailyProgress && stats.dailyProgress.length > 0
      ? stats.dailyProgress
      : [
          { day: 'Seg', oracoes: 4, decretos: 5, jugosQuebrados: 2 },
          { day: 'Ter', oracoes: 6, decretos: 7, jugosQuebrados: 4 },
          { day: 'Qua', oracoes: 5, decretos: 6, jugosQuebrados: 3 },
          { day: 'Qui', oracoes: 8, decretos: 9, jugosQuebrados: 6 },
          { day: 'Sex', oracoes: 7, decretos: 8, jugosQuebrados: 5 },
          { day: 'Sáb', oracoes: 9, decretos: 11, jugosQuebrados: 7 },
          { day: 'Hoje', oracoes: 6, decretos: 8, jugosQuebrados: 5 },
        ];

  const handleExecuteCommand = (cmd: SpiritualCommand) => {
    soundService.playYokeBrokenSound();
    soundService.playCelestialDecreeSound();
    setActiveExecutionId(cmd.id);
    setTimeout(() => setActiveExecutionId(null), 3000);

    // Speak aloud in faith
    setIsSpeaking(true);
    soundService.speakText(cmd.commandText, () => setIsSpeaking(false));

    // Update today's progress in chart
    const updatedDaily = currentTimeline.map((item, idx) => {
      if (idx === currentTimeline.length - 1) {
        return {
          ...item,
          decretos: item.decretos + 1,
          jugosQuebrados: item.jugosQuebrados + 1,
        };
      }
      return item;
    });

    onUpdateStats({
      ...stats,
      strongmanBoundCount: (stats.strongmanBoundCount || 0) + 1,
      angelicAidInvokedCount: (stats.angelicAidInvokedCount || 0) + 1,
      proclaimedDecreesCount: stats.proclaimedDecreesCount + 1,
      dailyProgress: updatedDaily,
      fruits: {
        ...stats.fruits,
        paz: stats.fruits.paz + 8,
        fidelidade: stats.fruits.fidelidade + 8,
        dominioProprio: stats.fruits.dominioProprio + 8,
      },
    });
  };

  const handleAddPrayerMoment = () => {
    soundService.playCelestialDecreeSound();
    setPrayerRegisteredToast(true);
    setTimeout(() => setPrayerRegisteredToast(false), 2500);

    const updatedDaily = currentTimeline.map((item, idx) => {
      if (idx === currentTimeline.length - 1) {
        return {
          ...item,
          oracoes: item.oracoes + 1,
        };
      }
      return item;
    });

    onUpdateStats({
      ...stats,
      dailyProgress: updatedDaily,
      fruits: {
        ...stats.fruits,
        paz: stats.fruits.paz + 5,
        fidelidade: stats.fruits.fidelidade + 5,
      },
    });
  };

  const handleProclaimAuthority = (guide: AuthorityScriptureGuide) => {
    soundService.playCelestialDecreeSound();
    soundService.playAngelicHarpChime();
    setProclaimedAuthorityId(guide.id);
    setTimeout(() => setProclaimedAuthorityId(null), 3000);

    // Speak the proclamation declaration aloud
    setIsSpeaking(true);
    soundService.speakText(guide.proclamationDeclaration, () => setIsSpeaking(false));

    // Update daily progress
    const updatedDaily = currentTimeline.map((item, idx) => {
      if (idx === currentTimeline.length - 1) {
        return {
          ...item,
          decretos: item.decretos + 1,
          jugosQuebrados: item.jugosQuebrados + 1,
        };
      }
      return item;
    });

    onUpdateStats({
      ...stats,
      proclaimedDecreesCount: stats.proclaimedDecreesCount + 1,
      strongmanBoundCount: (stats.strongmanBoundCount || 0) + 1,
      angelicAidInvokedCount: (stats.angelicAidInvokedCount || 0) + 1,
      dailyProgress: updatedDaily,
      fruits: {
        ...stats.fruits,
        fidelidade: stats.fruits.fidelidade + 5,
        paz: stats.fruits.paz + 5,
      },
    });
  };

  const handleCopyText = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getVerbIcon = (verb: SpiritualCommand['actionVerb']) => {
    switch (verb) {
      case 'amarrar':
        return <Lock className="w-4 h-4 text-amber-400" />;
      case 'desarmar':
        return <Scissors className="w-4 h-4 text-sky-400" />;
      case 'amordaçar':
        return <VolumeX className="w-4 h-4 text-rose-400" />;
      case 'uncao_quebra_jugo':
        return <Zap className="w-4 h-4 text-amber-300" />;
      case 'executar_juizo':
        return <Gavel className="w-4 h-4 text-purple-400" />;
      default:
        return <Shield className="w-4 h-4 text-amber-400" />;
    }
  };

  const spheres = [
    { id: 'todas', label: 'Todas as Esferas' },
    { id: 'autoridade_delegada', label: 'Autoridade Delegada (Lc 10:19)' },
    { id: 'chaves_reino', label: 'Chaves do Reino (Mt 16:19)' },
    { id: 'sangue_cruz', label: 'O Sangue & A Cruz (Cl 2:15)' },
    { id: 'armadura', label: 'Armadura de Deus (Ef 6)' },
    { id: 'resistencia', label: 'Sujeição & Resistência (Tg 4:7)' },
    { id: 'guarda_angelical', label: 'Guarda Angelical (Sl 91)' },
  ];

  const filteredAuthority =
    selectedSphere === 'todas'
      ? AUTHORITY_SCRIPTURES
      : AUTHORITY_SCRIPTURES.filter((item) => item.sphere === selectedSphere);

  // Aggregated totals for KPIs
  const totalOracoes = currentTimeline.reduce((acc, curr) => acc + curr.oracoes, 0);
  const totalDecretos = currentTimeline.reduce((acc, curr) => acc + curr.decretos, 0);
  const totalJugos = currentTimeline.reduce((acc, curr) => acc + curr.jugosQuebrados, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 rounded-2xl border border-amber-500/20 p-6 md:p-8 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-1">
              Batalha da Fé e Autoridade Espiritual · Mateus 12:29 & Salmos 149:8-9
            </p>
            <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-white tracking-tight">
              Vozes de Comando em Nome de Jesus
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-2 max-w-3xl leading-relaxed">
              "Como pode alguém entrar na casa do valente e roubar os seus bens sem primeiro amarrá-lo?"
              Em Nome de Jesus, exerça a autoridade delegada: amarre o opressor, desarme principados,
              amordaçe as mentiras e veja a unção do Espírito Santo despedaçar todo jugo!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Atos de Autoridade:</span>
            <span className="text-sm font-semibold text-amber-300 tabular-nums">
              {stats.strongmanBoundCount || 0} Jugos Quebrados
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveBattleSubTab('treinamento');
              soundService.playScriptureTone();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeBattleSubTab === 'treinamento'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Campo de Treinamento contra Principados</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                activeBattleSubTab === 'treinamento'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              Simulador
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBattleSubTab('comandos');
              soundService.playScriptureTone();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeBattleSubTab === 'comandos'
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Vozes de Comando & Gráficos</span>
          </button>
        </div>

        <div className="px-3 text-xs text-slate-400 hidden md:block">
          {activeBattleSubTab === 'treinamento'
            ? 'Pratique a autoridade bíblica contra cenários de opressão'
            : 'Arsenal de decretos de fé, guia bíblico e histórico ministerial'}
        </div>
      </div>

      {activeBattleSubTab === 'treinamento' ? (
        <TrainingGroundView
          stats={stats}
          onUpdateStats={onUpdateStats}
          onNavigateToCommands={() => setActiveBattleSubTab('comandos')}
        />
      ) : (
        <>
          {/* Main Grid: Command Selector & Command Chamber */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: List of 5 Commands (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-1 text-xs text-slate-400">
                <span>Arsenal da Fé e Comandos Bíblicos</span>
                <span>Selecione a ação espiritual</span>
              </div>

          <div className="space-y-3">
            {SPIRITUAL_COMMANDS.map((cmd) => {
              const isSelected = cmd.id === selectedCommandId;

              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    setSelectedCommandId(cmd.id);
                    soundService.playScriptureTone();
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                    {getVerbIcon(cmd.actionVerb)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-amber-400">
                        {cmd.scriptureRef}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-slate-100">
                      {cmd.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Proclamation Command Chamber (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 rounded-2xl border border-amber-500/20 p-6 md:p-8 space-y-6 shadow-xl">
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-amber-300 font-semibold text-sm">
                  {currentCommand.scriptureRef}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 capitalize">
                  Ação: {currentCommand.actionVerb.replace('_', ' ')}
                </span>
              </div>

              <span className="text-xs text-amber-400 font-medium">
                Voz de Autoridade Delegada
              </span>
            </div>

            <div>
              <h2 className="font-cinzel text-2xl font-bold text-white tracking-tight">
                {currentCommand.title}
              </h2>
            </div>

            {/* The Great Decree of Authority */}
            <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/30 border border-amber-400/40 shadow-inner space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Voz de Comando Proclamada com Fé:</span>
              </div>

              <blockquote className="font-cinzel text-base md:text-xl text-amber-100 font-semibold leading-relaxed tracking-wide">
                "{currentCommand.commandText}"
              </blockquote>

              <p className="text-xs text-amber-300/80 italic text-right">
                Pelo Sangue de Jesus e pela Palavra do nosso testemunho (Apocalipse 12:11).
              </p>
            </div>

            {/* Execution Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => handleExecuteCommand(currentCommand)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
                  activeExecutionId === currentCommand.id
                    ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300'
                    : 'bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {activeExecutionId === currentCommand.id
                    ? 'Jugo Despedaçado em Nome de Jesus!'
                    : 'Emitir Voz de Comando'}
                </span>
              </button>

              <button
                onClick={() => {
                  if (isSpeaking) {
                    soundService.stopSpeaking();
                    setIsSpeaking(false);
                  } else {
                    setIsSpeaking(true);
                    soundService.speakText(currentCommand.commandText, () => setIsSpeaking(false));
                  }
                }}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-xs md:text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-amber-400 animate-bounce' : ''}`} />
                <span>{isSpeaking ? 'Parar Leitura' : 'Ouvir Comando'}</span>
              </button>
            </div>

            {/* Execution Feedback Banner */}
            {activeExecutionId === currentCommand.id && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="font-semibold">{currentCommand.effectMessage}</p>
              </div>
            )}

            {/* Angelic Operation upon command */}
            <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 space-y-1.5 text-xs">
              <p className="font-semibold text-sky-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Missão dos Anjos Ministradores (Salmos 103:20):</span>
              </p>
              <p className="text-slate-300 leading-relaxed">
                {currentCommand.angelicMission}
              </p>
            </div>

            {/* Scriptural Foundation */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
              <p className="font-semibold text-slate-300 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Fundamento Teológico:</span>
              </p>
              <p className="text-slate-400 leading-relaxed">
                {currentCommand.biblicalFoundation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: GUIA DE AUTORIDADE BÍBLICA (Organizado por esferas e cartões de autoridade) */}
      <section className="bg-slate-900/90 rounded-2xl border border-amber-500/20 p-6 md:p-8 space-y-6 shadow-2xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Fundamento Jurídico e Espiritual · Lucas 10:19</span>
            </div>
            <h2 className="font-cinzel text-xl md:text-3xl font-bold text-white tracking-tight">
              Guia de Autoridade Bíblica
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Passagens fundamentais das Escrituras que sustentam o exercício legítimo das Vozes de Comando.
              A autoridade espiritual não repousa na carne, mas naquilo que Cristo já lavrou e consumou.
            </p>
          </div>

          <span className="text-xs text-amber-300 font-semibold tabular-nums shrink-0">
            {filteredAuthority.length} Passagens Reveladas
          </span>
        </div>

        {/* Sphere Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {spheres.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSphere(s.id);
                soundService.playScriptureTone();
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedSphere === s.id
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Toast when an authority passage is proclaimed */}
        {proclaimedAuthorityId && (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-400/40 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Proclamação de autoridade bíblica realizada com fé! O registro celestial computou o decreto.
            </span>
          </div>
        )}

        {/* Grid of Authority Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAuthority.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-cinzel text-amber-300 font-bold text-sm">
                    {item.scriptureRef}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => soundService.speakText(`${item.scriptureRef}. ${item.text}`)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                      title="Ouvir leitura da Escritura"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        handleCopyText(`"${item.text}" — ${item.scriptureRef}`, item.id)
                      }
                      className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                      title="Copiar Escritura"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="font-cinzel text-base font-bold text-slate-100">
                  {item.title}
                </h3>

                {/* Scripture Text in reverent font */}
                <blockquote className="text-xs md:text-sm text-slate-200 italic font-serif leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  "{item.text}"
                </blockquote>

                {/* Practical Combat Instruction */}
                <div className="text-xs text-slate-400 space-y-1">
                  <span className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider block">
                    Instrução para a Batalha da Fé:
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    {item.combatInstruction}
                  </p>
                </div>
              </div>

              {/* Action: Proclaim this authority immediately */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleProclaimAuthority(item)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                    proclaimedAuthorityId === item.id
                      ? 'bg-emerald-400 text-slate-950 ring-1 ring-emerald-300'
                      : 'bg-gradient-to-r from-amber-400/90 to-amber-300/90 hover:from-amber-300 hover:to-amber-200 text-slate-950 active:scale-95'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {proclaimedAuthorityId === item.id
                      ? 'Autoridade Proclamada no Céu!'
                      : 'Proclamar com Fé Agora'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: Progress Chart of Ministry (Recharts) */}
      <section className="bg-slate-900/90 rounded-2xl border border-amber-500/20 p-6 md:p-8 space-y-6 shadow-2xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Perseverança Espiritual · Efésios 6:18</span>
            </div>
            <h2 className="font-cinzel text-xl md:text-3xl font-bold text-white tracking-tight">
              Frequência de Orações e Decretos no Ministério
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              "Orando em todo o tempo com toda a oração e súplica no Espírito..." Acompanhe a constância
              diária das suas proclamações bíblicas, orações de vigília e atos de libertação em Cristo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Chart type toggle */}
            <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  chartType === 'area'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Área (Fluxo)
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  chartType === 'bar'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Barras (Disciplinas)
              </button>
            </div>

            {/* Quick action button to register prayer */}
            <button
              onClick={handleAddPrayerMoment}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg transition-all shadow active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Oração da Fé</span>
            </button>
          </div>
        </div>

        {/* Quick toast if prayer registered */}
        {prayerRegisteredToast && (
          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-400/40 text-xs text-sky-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>Momento de Oração e Súplica computado com sucesso no registro celestial!</span>
          </div>
        )}

        {/* KPI Mini-cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
              Orações & Súplicas
            </span>
            <p className="text-2xl font-bold text-slate-100 font-cinzel tabular-nums">
              {totalOracoes}
            </p>
            <p className="text-[11px] text-slate-500">Perseverança contínua no Espírito</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Decretos da Palavra
            </span>
            <p className="text-2xl font-bold text-slate-100 font-cinzel tabular-nums">
              {totalDecretos}
            </p>
            <p className="text-[11px] text-slate-500">Proclamações fundamentadas na Graça</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Jugos Despedaçados
            </span>
            <p className="text-2xl font-bold text-slate-100 font-cinzel tabular-nums">
              {totalJugos}
            </p>
            <p className="text-[11px] text-slate-500">Pela santa unção de Cristo (Is 10:27)</p>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-72 md:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={currentTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOracoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDecretos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorJugos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#f59e0b33',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="oracoes"
                  name="Orações no Espírito"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOracoes)"
                />
                <Area
                  type="monotone"
                  dataKey="decretos"
                  name="Decretos Bíblicos"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDecretos)"
                />
                <Area
                  type="monotone"
                  dataKey="jugosQuebrados"
                  name="Jugos Quebrados"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorJugos)"
                />
              </AreaChart>
            ) : (
              <BarChart data={currentTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#f59e0b33',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                <Bar dataKey="oracoes" name="Orações no Espírito" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="decretos" name="Decretos Bíblicos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="jugosQuebrados" name="Jugos Quebrados" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Theological conclusion note */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-amber-300">Constância Espiritual e Fidelidade:</p>
          <p className="leading-relaxed">
            "A oração do justo pode muito em seus efeitos." (Tiago 5:16). A frequência e perseverança na oração
            mantêm os anjos de Deus mobilizados e a vigilância ativa até a vinda do Senhor.
          </p>
        </div>
      </section>
        </>
      )}
    </div>
  );
};
