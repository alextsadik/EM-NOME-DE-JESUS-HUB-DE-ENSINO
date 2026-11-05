/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Scroll,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Volume2,
  Calendar,
  Save,
  Flame,
  Award,
  History,
  Trash2,
  RotateCcw,
  Check,
  BookOpen
} from 'lucide-react';
import { DailyGratitudeEntry, PlayerStats } from '../types/game';
import { soundService } from '../services/soundEffects';

interface DailyGratitudeParchmentProps {
  stats?: PlayerStats;
  onUpdateStats?: (updater: (prev: PlayerStats) => PlayerStats) => void;
}

const GRATITUDE_STORAGE_KEY = 'em_nome_de_jesus_daily_gratitudes';

const QUICK_INSPIRATIONS = [
  'A salvação imerecida e a graça eterna de nosso Senhor Jesus',
  'A paz que excede todo o entendimento sobre minha família',
  'O fôlego de vida e a saúde renovada a cada alvorecer',
  'A provisão fiel do pão e o cuidado nas pequenas coisas',
  'Livramento de laços invisíveis e a vitória na oração',
  'A doce comunhão do Espírito Santo e as promessas da Palavra',
];

export const DailyGratitudeParchment: React.FC<DailyGratitudeParchmentProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Load history from localStorage
  const [history, setHistory] = useState<Record<string, DailyGratitudeEntry>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(GRATITUDE_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // use default
      }
    }
    return {};
  });

  // Current day's motives (or default)
  const todayEntry: DailyGratitudeEntry = history[todayStr] || {
    date: todayStr,
    formattedDate: todayFormatted,
    motivos: ['', '', ''],
    completedCount: 0,
    consecrated: false,
    scriptureRef: 'Colossenses 3:17 & 1 Tessalonicenses 5:18',
    scriptureText:
      'E tudo quanto fizerdes por palavras ou por obras, fazei-o em nome do Senhor Jesus, dando por ele graças a Deus Pai.',
  };

  const [motivos, setMotivos] = useState<[string, string, string]>(todayEntry.motivos);
  const [isConsecrated, setIsConsecrated] = useState<boolean>(todayEntry.consecrated);

  // Save to localStorage whenever motives or consecrated state changes
  useEffect(() => {
    const filledCount = motivos.filter((m) => m.trim().length > 0).length;
    const updatedEntry: DailyGratitudeEntry = {
      ...todayEntry,
      motivos,
      completedCount: filledCount,
      consecrated: isConsecrated,
      consecratedAt: isConsecrated ? (todayEntry.consecratedAt || Date.now()) : undefined,
    };

    const nextHistory = {
      ...history,
      [todayStr]: updatedEntry,
    };

    setHistory(nextHistory);
    try {
      localStorage.setItem(GRATITUDE_STORAGE_KEY, JSON.stringify(nextHistory));
    } catch {
      // ignore
    }
  }, [motivos, isConsecrated]);

  const handleToggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next) {
      soundService.playScriptureTone();
    }
  };

  const handleMotivoChange = (index: 0 | 1 | 2, value: string) => {
    const next: [string, string, string] = [...motivos];
    next[index] = value;
    setMotivos(next);
  };

  const handleApplyInspiration = (text: string) => {
    const emptyIndex = motivos.findIndex((m) => m.trim() === '');
    if (emptyIndex !== -1) {
      handleMotivoChange(emptyIndex as 0 | 1 | 2, text);
      soundService.playScriptureTone();
    } else {
      handleMotivoChange(0, text);
      soundService.playScriptureTone();
    }
  };

  const handleConsecrateOnAltar = () => {
    const filledCount = motivos.filter((m) => m.trim().length > 0).length;
    if (filledCount === 0) return;

    soundService.playVictoryChime();
    setIsConsecrated(true);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);

    // Reward player with Fruits of Joy and Peace and WorshipScore bonus
    if (onUpdateStats) {
      onUpdateStats((prev) => ({
        ...prev,
        worshipScore: (prev.worshipScore || 0) + 50,
        fruits: {
          ...prev.fruits,
          alegria: (prev.fruits.alegria || 0) + 15,
          paz: (prev.fruits.paz || 0) + 15,
        },
      }));
    }
  };

  const handleProclaimAloud = () => {
    soundService.playScriptureTone();
    const activeMotivos = motivos.filter((m) => m.trim().length > 0);
    const textToSpeak = `Pergaminho de Gratidão de hoje. Primeiro motivo: ${
      motivos[0] || 'Graça do Senhor'
    }. Segundo motivo: ${motivos[1] || 'Fidelidade de Deus'}. Terceiro motivo: ${
      motivos[2] || 'A paz de Cristo'
    }. Colossenses 3 verso 17: E tudo quanto fizerdes por palavras ou por obras, fazei-o em nome do Senhor Jesus, dando por ele graças a Deus Pai. Amém!`;

    soundService.speakText(textToSpeak);
  };

  const completedCount = motivos.filter((m) => m.trim().length > 0).length;
  const isAllComplete = completedCount === 3;

  // Previous days entries for history
  const historyEntries = Object.values(history)
    .filter((entry) => entry.date !== todayStr && entry.completedCount > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-950 border border-amber-600/30 overflow-hidden shadow-xl transition-all">
      {/* 1. Header Bar: Collapsible Toggle */}
      <div
        onClick={handleToggleExpand}
        className="flex items-center justify-between p-4 md:p-5 cursor-pointer select-none bg-slate-950/80 hover:bg-slate-950 border-b border-amber-600/20 transition-colors group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Scroll Icon with Glow */}
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <Scroll className="w-5 h-5 text-amber-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-cinzel text-base md:text-lg font-bold text-amber-300 tracking-wide truncate group-hover:text-amber-200">
                Pergaminho de Gratidão Diária
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold font-mono">
                {completedCount}/3 Motivos
              </span>
              {isConsecrated && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Consagrado
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              3 motivos diários de gratidão sob a égide de Colossenses 3:17 & 1 Ts 5:18
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-xs font-mono text-slate-400 capitalize">
            {todayFormatted}
          </span>
          <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-amber-300 bg-slate-900 border border-slate-800 transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* 2. Unrolled Ancient Biblical Parchment Body */}
      {isExpanded && (
        <div className="animate-parchment-unroll p-4 md:p-6 space-y-6">
          {/* Top Wooden Rod of the Scroll */}
          <div className="relative flex items-center justify-between -mx-2 sm:-mx-4 px-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 border border-amber-400 shadow-md" />
            <div className="flex-1 h-2.5 mx-1 rounded-full bg-gradient-to-r from-amber-900 via-amber-600 to-amber-950 border-t border-b border-amber-400/50 shadow-inner" />
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 border border-amber-400 shadow-md" />
          </div>

          {/* Parchment Paper Core Container */}
          <div className="parchment-texture relative rounded-2xl border-2 border-amber-600/50 p-5 md:p-7 space-y-6 text-amber-100 shadow-2xl overflow-hidden">
            {/* Background Watermark & Corner Flourishes */}
            <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
            
            {/* Corner Decorative Borders */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-500/60 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-500/60 pointer-events-none" />

            {/* Scriptural Inscription Header */}
            <div className="text-center space-y-1 relative z-10 border-b border-amber-600/30 pb-4">
              <span className="font-cinzel text-xs font-bold text-amber-400/90 tracking-widest uppercase block">
                Altar da Gratidão Incessante
              </span>
              <h4 className="font-cinzel text-lg md:text-xl font-bold text-amber-200">
                Memorial dos Três Louvores do Dia
              </h4>
              <p className="text-xs text-amber-300/80 italic max-w-xl mx-auto leading-relaxed">
                "Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco." — 1 Tessalonicenses 5:18
              </p>
            </div>

            {/* The 3 Gratitude Motive Slots */}
            <div className="space-y-4 relative z-10">
              {/* Motivo 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-cinzel font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] flex items-center justify-center font-mono">
                      1
                    </span>
                    <span>Graça & Salvação no Alvorecer</span>
                  </label>
                  <span className="text-[10px] text-amber-400/70 font-mono">Salmos 92:1-2</span>
                </div>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={motivos[0]}
                    onChange={(e) => handleMotivoChange(0, e.target.value)}
                    placeholder="Pelo que você agradece a Deus na dimensão da graça e da vida nesta manhã?"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-amber-600/40 text-xs md:text-sm text-amber-100 placeholder-amber-400/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 resize-none transition-all"
                  />
                  {motivos[0].trim() && (
                    <span className="absolute top-2.5 right-2.5 text-emerald-400">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              {/* Motivo 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-cinzel font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] flex items-center justify-center font-mono">
                      2
                    </span>
                    <span>Provisão, Família & Proteção na Jornada</span>
                  </label>
                  <span className="text-[10px] text-amber-400/70 font-mono">Salmos 103:2-5</span>
                </div>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={motivos[1]}
                    onChange={(e) => handleMotivoChange(1, e.target.value)}
                    placeholder="Qual livramento, comunhão no lar ou provisão você celebra perante o Senhor?"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-amber-600/40 text-xs md:text-sm text-amber-100 placeholder-amber-400/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 resize-none transition-all"
                  />
                  {motivos[1].trim() && (
                    <span className="absolute top-2.5 right-2.5 text-emerald-400">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              {/* Motivo 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-cinzel font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] flex items-center justify-center font-mono">
                      3
                    </span>
                    <span>Vitória Espiritual & Paz ao Entardecer</span>
                  </label>
                  <span className="text-[10px] text-amber-400/70 font-mono">Colossenses 3:17</span>
                </div>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={motivos[2]}
                    onChange={(e) => handleMotivoChange(2, e.target.value)}
                    placeholder="Por qual vitória ou paz interior em Cristo você dá graças agora?"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-amber-600/40 text-xs md:text-sm text-amber-100 placeholder-amber-400/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 resize-none transition-all"
                  />
                  {motivos[2].trim() && (
                    <span className="absolute top-2.5 right-2.5 text-emerald-400">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Inspiration Phrases Picker */}
            <div className="space-y-2 pt-2 border-t border-amber-600/30">
              <span className="text-[11px] font-semibold text-amber-300/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Inspirações Rápidas da Palavra (clique para preencher):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_INSPIRATIONS.map((insp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyInspiration(insp)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-amber-200/90 transition-all text-left"
                  >
                    + {insp}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Bar: Consagrar & Proclamar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-amber-600/30">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleProclaimAloud}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all active:scale-95"
                  title="Ouvir a proclamação das suas gratidões e do versículo bíblico"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Proclamar em Voz Alta</span>
                </button>

                {historyEntries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold transition-all"
                  >
                    <History className="w-4 h-4 text-amber-400" />
                    <span>{showHistory ? 'Ocultar Histórico' : `Histórico (${historyEntries.length})`}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {justSaved && (
                  <span className="text-xs font-bold text-emerald-400 animate-pulse flex items-center gap-1">
                    <Check className="w-4 h-4" /> Consagrado no Altar (+50 pts)
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleConsecrateOnAltar}
                  disabled={completedCount === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-lg transition-all active:scale-95 ${
                    completedCount > 0
                      ? 'bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>{isConsecrated ? 'Atualizar Consagração' : 'Consagrar no Altar (Cl 3:17)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Wooden Rod of the Scroll */}
          <div className="relative flex items-center justify-between -mx-2 sm:-mx-4 px-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-600 to-yellow-500 border border-amber-400 shadow-md" />
            <div className="flex-1 h-2.5 mx-1 rounded-full bg-gradient-to-r from-amber-900 via-amber-600 to-amber-950 border-t border-b border-amber-400/50 shadow-inner" />
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 border border-amber-400 shadow-md" />
          </div>

          {/* 3. History of Past Parchments (if opened) */}
          {showHistory && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h5 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pergaminhos Anteriores Guardados</span>
                </h5>
                <span className="text-[11px] text-slate-400">
                  {historyEntries.length} dia(s) registrados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {historyEntries.map((past) => (
                  <div
                    key={past.date}
                    className="p-4 rounded-xl bg-slate-950/70 border border-amber-900/40 hover:border-amber-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                      <span className="font-cinzel font-bold text-amber-300 capitalize">
                        {past.formattedDate}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">{past.date}</span>
                    </div>

                    <ul className="space-y-1 text-xs text-slate-300">
                      {past.motivos.map((m, i) => (
                        m.trim() && (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span className="line-clamp-2">{m}</span>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
