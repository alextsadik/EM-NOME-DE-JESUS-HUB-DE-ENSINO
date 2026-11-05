/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookMarked,
  Plus,
  Heart,
  HeartPulse,
  Users,
  Handshake,
  BookOpen,
  Briefcase,
  Shield,
  Sparkles,
  Volume2,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  Filter,
  Check,
  Flame,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
  BellRing,
  Scroll,
} from 'lucide-react';
import { PlayerStats, PrayerEntry, PrayerType, PrayerCategory, PrayerReminder } from '../types/game';
import { PRAYER_THEMES_INFO, INITIAL_PRAYER_ENTRIES } from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';
import { ScheduledPrayerRemindersPanel } from './ScheduledPrayerRemindersPanel';
import { PrayerReminderNotificationModal } from './PrayerReminderNotificationModal';
import { DailyGratitudeParchment } from './DailyGratitudeParchment';
import { WeeklySpiritualGrowthChart } from './WeeklySpiritualGrowthChart';
import { SharedIntercessionMural } from './SharedIntercessionMural';
import { PrayerParchmentExportModal } from './PrayerParchmentExportModal';

interface PrayerJournalViewProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onTriggerVisualReminder?: (reminder: PrayerReminder) => void;
}

export const PrayerJournalView: React.FC<PrayerJournalViewProps> = ({
  stats,
  onUpdateStats,
  onTriggerVisualReminder,
}) => {
  const [entries, setEntries] = useState<PrayerEntry[]>(() => {
    return stats.prayerEntries && stats.prayerEntries.length > 0
      ? stats.prayerEntries
      : INITIAL_PRAYER_ENTRIES;
  });

  const [localReminderAlert, setLocalReminderAlert] = useState<PrayerReminder | null>(null);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<PrayerType>('gratidao');
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory>('familia');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [scriptureRef, setScriptureRef] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('todas');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [prayingEntryId, setPrayingEntryId] = useState<string | null>(null);
  const [answeringModalId, setAnsweringModalId] = useState<string | null>(null);
  const [testimonyInput, setTestimonyInput] = useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const handleTriggerVisualAlert = (rem: PrayerReminder) => {
    if (onTriggerVisualReminder) {
      onTriggerVisualReminder(rem);
    } else {
      setLocalReminderAlert(rem);
    }
  };

  const handleOpenFromReminder = (rem: PrayerReminder) => {
    setTitle(`Consagração: ${rem.title} (${rem.time})`);
    setSelectedType('gratidao');
    setSelectedCategory('espiritual');
    setScriptureRef(rem.scriptureRef || 'Colossenses 3:17');
    setDescription(
      `"E tudo quanto fizerdes por palavras ou por obras, fazei-o em nome do Senhor Jesus, dando por ele graças a Deus Pai." (Colossenses 3:17). Em Nome de Jesus Cristo, consagro este momento sagrado de oração das ${rem.time}. ${rem.adorationPrompt}`
    );
    setIsFormOpen(true);
    setLocalReminderAlert(null);
  };

  const currentTheme = PRAYER_THEMES_INFO[selectedCategory];

  const getCategoryIcon = (category: PrayerCategory, className = 'w-4 h-4') => {
    switch (category) {
      case 'familia':
        return <Users className={className} />;
      case 'cura':
        return <HeartPulse className={className} />;
      case 'reconciliacao':
        return <Handshake className={className} />;
      case 'evangelho':
        return <BookOpen className={className} />;
      case 'trabalho':
        return <Briefcase className={className} />;
      case 'espiritual':
      default:
        return <Shield className={className} />;
    }
  };

  const syncEntriesWithStats = (newEntries: PrayerEntry[], incrementOracaoCount = false) => {
    setEntries(newEntries);

    let updatedDaily = stats.dailyProgress;
    if (incrementOracaoCount && updatedDaily && updatedDaily.length > 0) {
      updatedDaily = updatedDaily.map((item, idx) => {
        if (idx === updatedDaily!.length - 1) {
          return {
            ...item,
            oracoes: item.oracoes + 1,
          };
        }
        return item;
      });
    }

    onUpdateStats({
      ...stats,
      prayerEntries: newEntries,
      dailyProgress: updatedDaily,
      fruits: {
        ...stats.fruits,
        paz: stats.fruits.paz + 5,
        fidelidade: stats.fruits.fidelidade + 5,
        amor: stats.fruits.amor + 3,
      },
    });
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    soundService.playPrayerChime();

    const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const newEntry: PrayerEntry = {
      id: `pr-${Date.now()}`,
      type: selectedType,
      category: selectedCategory,
      title: title.trim(),
      description: description.trim(),
      scriptureRef: scriptureRef.trim() || currentTheme.suggestedScriptures[0].ref,
      date: todayFormatted,
      isAnswered: selectedType === 'gratidao', // gratitude is answered by default
    };

    const nextEntries = [newEntry, ...entries];
    syncEntriesWithStats(nextEntries, true);

    // Reset form
    setTitle('');
    setDescription('');
    setScriptureRef('');
    setIsFormOpen(false);
  };

  const handleMarkAsAnswered = (id: string) => {
    if (!testimonyInput.trim()) return;

    soundService.playCelestialDecreeSound();
    const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const nextEntries = entries.map((entry) => {
      if (entry.id === id) {
        return {
          ...entry,
          isAnswered: true,
          answeredDate: todayFormatted,
          testimonyNote: testimonyInput.trim(),
        };
      }
      return entry;
    });

    syncEntriesWithStats(nextEntries, false);
    setAnsweringModalId(null);
    setTestimonyInput('');
  };

  const handleDeleteEntry = (id: string) => {
    const nextEntries = entries.filter((e) => e.id !== id);
    syncEntriesWithStats(nextEntries, false);
    soundService.playScriptureTone();
  };

  const handlePrayAloud = (entry: PrayerEntry) => {
    soundService.playPrayerChime();
    setPrayingEntryId(entry.id);
    setTimeout(() => setPrayingEntryId(null), 3000);

    const spokenText =
      entry.type === 'gratidao'
        ? `Ação de Graças em Nome de Jesus Cristo. ${entry.title}. ${entry.description}. Fundamentado em ${entry.scriptureRef || 'Colossenses 3:17'}. Amém!`
        : `Intercessão em Nome de Jesus Cristo. ${entry.title}. ${entry.description}. Clamamos em fé conforme ${entry.scriptureRef || 'Filipenses 4:6'}. Em Nome de Jesus, amém!`;

    soundService.speakText(spokenText);

    // Register prayer repetition in daily progress
    syncEntriesWithStats(entries, true);
  };

  // Filtered entries
  const filteredEntries = entries.filter((entry) => {
    if (filterType === 'gratidao' && entry.type !== 'gratidao') return false;
    if (filterType === 'intercessao' && entry.type !== 'intercessao') return false;
    if (filterType === 'respondida' && !entry.isAnswered) return false;

    if (filterCategory !== 'todos' && entry.category !== filterCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.title.toLowerCase().includes(q);
      const matchDesc = entry.description.toLowerCase().includes(q);
      const matchScripture = entry.scriptureRef?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchScripture) return false;
    }

    return true;
  });

  const gratidoesCount = entries.filter((e) => e.type === 'gratidao').length;
  const intercessoesCount = entries.filter((e) => e.type === 'intercessao').length;
  const respondidasCount = entries.filter((e) => e.isAnswered).length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-slate-900 shadow-xl">
        <div className="h-44 md:h-56 w-full relative">
          <img
            src="/src/assets/images/prayer_altar_1793049533355.jpg"
            alt="Altar de oração bíblica iluminado pela presença do Senhor"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
          <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-1">
            Comunhão e Petição em Cristo · Filipenses 4:6-7 & Colossenses 3:17
          </p>
          <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-white tracking-tight drop-shadow-md">
            Diário de Oração em Nome de Jesus
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
            "Não estejais inquietos por coisa alguma; antes as vossas petições sejam conhecidas diante de Deus pela oração e súplica, com ação de graças." Registre suas gratidões e intercessões consagradas ao Senhor.
          </p>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total no Diário</p>
            <p className="font-cinzel text-xl md:text-2xl font-bold text-white tabular-nums">
              {entries.length}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookMarked className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Ações de Graça</p>
            <p className="font-cinzel text-xl md:text-2xl font-bold text-amber-300 tabular-nums">
              {gratidoesCount}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Intercessões</p>
            <p className="font-cinzel text-xl md:text-2xl font-bold text-sky-400 tabular-nums">
              {intercessoesCount}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Respondidas / Testemunhos</p>
            <p className="font-cinzel text-xl md:text-2xl font-bold text-emerald-300 tabular-nums">
              {respondidasCount}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Weekly Spiritual Growth Chart (Recharts: Prayers & Decrees Frequency) */}
      <WeeklySpiritualGrowthChart stats={stats} />

      {/* Scheduled Prayer Reminders Panel (Colossians 3:17) */}
      <ScheduledPrayerRemindersPanel
        onTriggerVisualAlert={handleTriggerVisualAlert}
        onUpdateStats={(updater) => {
          if (typeof updater === 'function') {
            onUpdateStats(updater(stats));
          } else {
            onUpdateStats(updater);
          }
        }}
      />

      {/* Daily 3 Gratitudes Biblical Parchment (Colossians 3:17 & 1 Thess 5:18) */}
      <DailyGratitudeParchment
        stats={stats}
        onUpdateStats={(updater) => {
          if (typeof updater === 'function') {
            onUpdateStats(updater(stats));
          } else {
            onUpdateStats(updater);
          }
        }}
      />

      {/* Shared Intercession Mural (Firestore Database & Community Prayer Requests) */}
      <SharedIntercessionMural
        stats={stats}
        onUpdateStats={(updater) => {
          if (typeof updater === 'function') {
            onUpdateStats(updater(stats));
          } else {
            onUpdateStats(updater);
          }
        }}
      />

      {/* Action Bar & Filters */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* New Prayer Button */}
            <button
              onClick={() => {
                setIsFormOpen(!isFormOpen);
                soundService.playScriptureTone();
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-md transition-all active:scale-95"
            >
              {isFormOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isFormOpen ? 'Recolher Formulário' : 'Novo Registro de Oração'}</span>
            </button>

            {/* Export Parchment Button */}
            <button
              onClick={() => {
                setIsExportModalOpen(true);
                soundService.playScriptureTone();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-400/30 text-amber-200 border border-amber-500/40 shadow-md transition-all active:scale-95"
              title="Exportar memorial semanal em formato pergaminho para impressão ou download"
            >
              <Scroll className="w-4 h-4 text-amber-400" />
              <span>Exportar Pergaminho</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, conteúdo ou passagem..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400/60 transition-colors"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          {/* Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs w-full lg:w-auto pb-1 lg:pb-0">
            <span className="text-slate-500 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Tipo:
            </span>
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'gratidao', label: 'Ação de Graças' },
              { id: 'intercessao', label: 'Intercessão' },
              { id: 'respondida', label: 'Respondidas' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterType === f.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs w-full lg:w-auto pb-1 lg:pb-0">
            <span className="text-slate-500 shrink-0">Tema:</span>
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'familia', label: 'Família' },
              { id: 'cura', label: 'Cura' },
              { id: 'reconciliacao', label: 'Reconciliação' },
              { id: 'evangelho', label: 'Evangelho' },
              { id: 'trabalho', label: 'Trabalho' },
              { id: 'espiritual', label: 'Espiritual' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Creation Form Panel (Expandable) */}
      {isFormOpen && (
        <form
          onSubmit={handleCreateEntry}
          className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-cinzel text-lg md:text-xl font-bold text-amber-300">
                Consagrar Entrada no Diário de Oração
              </h2>
              <p className="text-xs text-slate-400">
                Apresente seu pedido ou sua gratidão em Nome de Jesus Cristo, fundamentado na Palavra
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancelar
            </button>
          </div>

          {/* Type Toggle: Gratidão vs Intercessão */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Natureza da Entrada
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedType('gratidao')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 transition-all text-xs md:text-sm font-semibold ${
                  selectedType === 'gratidao'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Gratidão (Ação de Graças)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('intercessao')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 transition-all text-xs md:text-sm font-semibold ${
                  selectedType === 'intercessao'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-1 ring-sky-400/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Heart className="w-4 h-4 text-sky-400" />
                <span>Intercessão (Clamor em Fé)</span>
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tema Bíblico
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {(Object.keys(PRAYER_THEMES_INFO) as PrayerCategory[]).map((cat) => {
                const info = PRAYER_THEMES_INFO[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (info.suggestedScriptures.length > 0 && !scriptureRef) {
                        setScriptureRef(info.suggestedScriptures[0].ref);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-400/80 text-amber-200 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(cat, isSelected ? 'w-4 h-4 text-amber-400' : 'w-4 h-4 text-slate-500')}
                      <span className="text-xs font-bold">{info.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      {info.suggestedScriptures[0].ref}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 italic">
              {currentTheme.description}
            </p>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Título da Oração ou Ação de Graças
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Clamor pela saúde e alívio de enfermidade, Gratidão pelo sustento do lar..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Scripture Anchor with Suggestion Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Fundamento Bíblico / Passagem Sagrada
              </label>
              <span className="text-[11px] text-slate-500">Sugestões para o tema {currentTheme.label}:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {currentTheme.suggestedScriptures.map((s) => (
                <button
                  key={s.ref}
                  type="button"
                  onClick={() => setScriptureRef(s.ref)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    scriptureRef === s.ref
                      ? 'bg-amber-400 text-slate-950 font-semibold border-amber-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                  title={s.excerpt}
                >
                  {s.ref}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={scriptureRef}
              onChange={(e) => setScriptureRef(e.target.value)}
              placeholder="Ex: Filipenses 4:6-7, Colossenses 3:17, Isaías 53:5..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Oração, Clamor ou Agradecimento Selado em Nome de Jesus
              </label>

              {/* Quick Template Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDescription((prev) =>
                      prev
                        ? `${prev} Em Nome de Jesus Cristo, dou graças a Deus Pai por Sua misericórdia inabalável.`
                        : 'Pai Celeste, em Nome de Jesus Cristo, apresento minha profunda gratidão por... Dando por Ele graças a Deus Pai!'
                    )
                  }
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline"
                >
                  Inserir Gratidão Cl 3:17
                </button>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={() =>
                    setDescription((prev) =>
                      prev
                        ? `${prev} Em Nome de Jesus Cristo, repreendo todo temor e desespero, descansando na paz de Deus.`
                        : 'Senhor Jesus Cristo, coloco diante do Teu trono da Graça este clamor por... Confiando que nenhuma oração feita em Teu Nome é em vão!'
                    )
                  }
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline"
                >
                  Inserir Clamor Fp 4:6
                </button>
              </div>
            </div>

            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escreva com suas palavras a sua oração sincera ao Pai em Nome do Senhor Jesus..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
            />
          </div>

          {/* Form Submit Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              Cada oração registrada fortalece a fé e atualiza o seu progresso diário com o Senhor.
            </p>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Gravar no Diário de Oração</span>
            </button>
          </div>
        </form>
      )}

      {/* Prayer Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
          <BookMarked className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-cinzel text-lg font-bold text-slate-300">
            Nenhuma entrada encontrada
          </h3>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
            Não há registros correspondentes aos filtros selecionados. Comece consagrando uma gratidão ou intercessão no botão acima.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEntries.map((entry) => {
            const isPraying = prayingEntryId === entry.id;
            const themeInfo = PRAYER_THEMES_INFO[entry.category];

            return (
              <div
                key={entry.id}
                className={`rounded-2xl border p-5 md:p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  isPraying
                    ? 'ring-2 ring-amber-400 bg-amber-950/20 border-amber-400/80 shadow-lg shadow-amber-500/10'
                    : entry.isAnswered
                    ? 'bg-slate-900/90 border-emerald-500/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Top: Badges and Date */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Type Badge */}
                      {entry.type === 'gratidao' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Flame className="w-3 h-3 text-amber-400" />
                          Ação de Graças
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                          <Heart className="w-3 h-3 text-sky-400" />
                          Intercessão
                        </span>
                      )}

                      {/* Theme Category Badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-950 text-slate-300 border border-slate-800">
                        {getCategoryIcon(entry.category, 'w-3 h-3 text-amber-400')}
                        <span>{themeInfo?.label || entry.category}</span>
                      </span>

                      {/* Answered Badge */}
                      {entry.isAnswered && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Respondida
                        </span>
                      )}
                    </div>

                    {/* Entry Date */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      <span>{entry.date}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-cinzel text-lg font-bold text-slate-100 mb-2 leading-snug">
                    {entry.title}
                  </h3>

                  {/* Scripture Anchor */}
                  {entry.scriptureRef && (
                    <div className="mb-3">
                      <span className="text-[11px] font-cinzel text-amber-400/90 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {entry.scriptureRef}
                      </span>
                    </div>
                  )}

                  {/* Prayer Text */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-serif italic">
                      "{entry.description}"
                    </p>
                  </div>

                  {/* Answered Testimony Note */}
                  {entry.isAnswered && entry.testimonyNote && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 mb-4 flex items-start gap-2">
                      <MessageSquareQuote className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[11px] font-sans uppercase tracking-wider text-emerald-300 mb-0.5">
                          Testemunho da Graça de Deus ({entry.answeredDate || 'Confirmado'}):
                        </strong>
                        <span>{entry.testimonyNote}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {/* Speak Prayer Aloud */}
                    <button
                      onClick={() => handlePrayAloud(entry)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isPraying
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800'
                      }`}
                      title="Orar e Proclamar em voz alta"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPraying ? 'Clamando ao Pai...' : 'Orar em Voz Alta'}</span>
                    </button>

                    {/* Mark as Answered button if not already */}
                    {!entry.isAnswered && (
                      <button
                        onClick={() => {
                          setAnsweringModalId(entry.id);
                          setTestimonyInput('');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-500/30 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Marcar como Respondida</span>
                      </button>
                    )}
                  </div>

                  {/* Delete Entry */}
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Excluir entrada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Answered Testimony Modal */}
      {answeringModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-emerald-300">
                  Registrar Oração Respondida
                </h3>
                <p className="text-xs text-slate-400">
                  Dê glória a Deus relatando como o Senhor operou a graça ou livramento
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Relato do Testemunho / Como Deus respondeu:
              </label>
              <textarea
                rows={3}
                required
                value={testimonyInput}
                onChange={(e) => setTestimonyInput(e.target.value)}
                placeholder="Ex: O Senhor trouxe a paz de volta ao lar; o exame confirmou a cura; houve reconciliação fraterna..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAnsweringModalId(null)}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleMarkAsAnswered(answeringModalId)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md active:scale-95"
              >
                Confirmar Glória a Deus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Visual Prayer Reminder Modal */}
      <PrayerReminderNotificationModal
        isOpen={!!localReminderAlert}
        reminder={localReminderAlert}
        onClose={() => setLocalReminderAlert(null)}
        onNavigateToJournal={() => {
          if (localReminderAlert) {
            handleOpenFromReminder(localReminderAlert);
          }
        }}
        onUpdateStats={(updater) => {
          if (typeof updater === 'function') {
            onUpdateStats(updater(stats));
          } else {
            onUpdateStats(updater);
          }
        }}
      />

      {/* Sacred Parchment Weekly Export & Print Modal */}
      <PrayerParchmentExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        stats={stats}
        entries={entries}
      />
    </div>
  );
};
