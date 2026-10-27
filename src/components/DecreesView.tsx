/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DECREES } from '../data/biblicalContent';
import { Decree, PlayerStats } from '../types/game';
import { soundService } from '../services/soundEffects';
import {
  Sparkles,
  Volume2,
  BookOpen,
  Check,
  Share2,
  Flame,
  HeartHandshake,
  Shield,
  Eye,
} from 'lucide-react';

interface DecreesViewProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  initialSelectedDecreeId?: string;
}

export const DecreesView: React.FC<DecreesViewProps> = ({
  stats,
  onUpdateStats,
  initialSelectedDecreeId,
}) => {
  const [selectedDecreeId, setSelectedDecreeId] = useState<string>(
    initialSelectedDecreeId || DECREES[0].id
  );
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [justProclaimed, setJustProclaimed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentDecree = DECREES.find((d) => d.id === selectedDecreeId) || DECREES[0];

  const categories = [
    { id: 'todos', label: 'Todos os Decretos' },
    { id: 'anjos_ministradores', label: 'Ajuda Angelical (Sl 103)' },
    { id: 'batalha_espiritual', label: 'Combate Efésios 6' },
    { id: 'reconciliação', label: 'Reconciliação' },
    { id: 'obediência', label: 'Obediência (Cl 3:17)' },
    { id: 'autoridade', label: 'Autoridade em Jesus' },
    { id: 'cura', label: 'Cura & Paz' },
    { id: 'esperança', label: 'Eterna Esperança' },
    { id: 'graça', label: 'Graça & Salvação' },
  ];

  const filteredDecrees =
    activeCategory === 'todos'
      ? DECREES
      : DECREES.filter((d) => d.category === activeCategory);

  const handleProclaim = (decree: Decree) => {
    soundService.playCelestialDecreeSound();
    soundService.playAngelicHarpChime();
    setJustProclaimed(true);
    setTimeout(() => setJustProclaimed(false), 2500);

    // Speak aloud
    setIsSpeaking(true);
    soundService.speakText(decree.proclamationText, () => {
      setIsSpeaking(false);
    });

    // Update stats
    const updatedDecrees = stats.unlockedDecrees.includes(decree.id)
      ? stats.unlockedDecrees
      : [...stats.unlockedDecrees, decree.id];

    onUpdateStats({
      ...stats,
      proclaimedDecreesCount: stats.proclaimedDecreesCount + 1,
      unlockedDecrees: updatedDecrees,
      angelicAidInvokedCount: (stats.angelicAidInvokedCount || 0) + 1,
      fruits: {
        ...stats.fruits,
        paz: stats.fruits.paz + 5,
        fidelidade: stats.fruits.fidelidade + 5,
      },
    });
  };

  const handleCopyText = (decree: Decree) => {
    const textToCopy = `"${decree.proclamationText}"\n— Base bíblica: ${decree.scriptureRef} (Em Nome de Jesus Cristo)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-slate-900 shadow-xl">
        <div className="h-44 md:h-56 w-full relative">
          <img
            src="/src/assets/images/scripture_scroll_1793049511230.jpg"
            alt="Pergaminho sagrado das Escrituras iluminado"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
          <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-1">
            O Altar da Palavra e Ajuda Celestial · Salmos 103:20 & Hebreus 1:14
          </p>
          <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-white tracking-tight">
            Decretos Bíblicos em Nome de Jesus
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-2 max-w-3xl">
            Proclame com audácia e reverência as verdades imutáveis da Graça. Os anjos de Deus obedecem
            à voz da Palavra do Senhor proclamada pelos santos, desfazendo as obras das trevas e
            ministrando a salvação em Cristo.
          </p>
        </div>
      </div>

      {/* Category Segmented Controls (functional buttons with handlers) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              soundService.playScriptureTone();
            }}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Decrees List & Active Decree Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Decrees selector list (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1 text-xs text-slate-400">
            <span>Decretos Disponíveis ({filteredDecrees.length})</span>
            <span>Clique para selecionar</span>
          </div>

          <div className="space-y-3">
            {filteredDecrees.map((d) => {
              const isSelected = d.id === selectedDecreeId;

              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDecreeId(d.id);
                    soundService.playScriptureTone();
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-amber-400">
                      {d.scriptureRef}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {d.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-100">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {d.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Proclamation Sanctuary (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 rounded-2xl border border-amber-500/20 p-6 md:p-8 space-y-6 shadow-xl">
            {/* Top metadata row */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-amber-300 font-semibold text-sm">
                  {currentDecree.scriptureRef}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 capitalize">{currentDecree.category.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(currentDecree)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors p-1"
                  title="Copiar texto do decreto"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Decree Title & Subtitle */}
            <div>
              <h2 className="font-cinzel text-2xl font-bold text-white tracking-tight">
                {currentDecree.title}
              </h2>
              <p className="text-sm text-amber-400/90 mt-1">
                {currentDecree.subtitle}
              </p>
            </div>

            {/* The Great Proclamation Box */}
            <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-amber-950/20 border border-amber-400/40 shadow-inner space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Proclamação com Autoridade Espiritual:</span>
              </div>

              <blockquote className="font-cinzel text-base md:text-xl text-amber-100 font-semibold leading-relaxed tracking-wide">
                "{currentDecree.proclamationText}"
              </blockquote>

              <p className="text-xs text-amber-300/80 italic text-right">
                Em Nome de Jesus Cristo, nossa Fonte de Vida e Eterna Esperança.
              </p>
            </div>

            {/* Actions: Proclaim with Audio & Voice */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => handleProclaim(currentDecree)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
                  justProclaimed
                    ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300'
                    : 'bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {justProclaimed ? 'Decreto Proclamado no Céu!' : 'Proclamar em Nome de Jesus'}
                </span>
              </button>

              <button
                onClick={() => {
                  if (isSpeaking) {
                    soundService.stopSpeaking();
                    setIsSpeaking(false);
                  } else {
                    setIsSpeaking(true);
                    soundService.speakText(currentDecree.proclamationText, () => setIsSpeaking(false));
                  }
                }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs md:text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-amber-400 animate-bounce' : ''}`} />
                <span>{isSpeaking ? 'Parar Leitura' : 'Ouvir Proclamação'}</span>
              </button>
            </div>

            {/* Angelic Response Note */}
            {currentDecree.angelicResponseNote && (
              <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/30 text-xs text-sky-200 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <p>
                  <strong className="text-sky-300 font-semibold">Ajuda Celestial (Sl 103:20):</strong>{' '}
                  {currentDecree.angelicResponseNote}
                </p>
              </div>
            )}

            {/* Theological Explanation of Grace */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Fundamento Teológico do Evangelho da Graça:</span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {currentDecree.theologicalTruth}
              </p>
            </div>

            {/* Practical Action of Colossians 3:17 */}
            <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-500/20 space-y-1.5">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Aplicação Prática no Dia a Dia (Cl 3:17):
              </p>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                {currentDecree.actionPrompt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
