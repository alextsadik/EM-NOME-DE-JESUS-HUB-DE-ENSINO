/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SCRIPTURES } from '../data/biblicalContent';
import { Scripture } from '../types/game';
import { soundService } from '../services/soundEffects';
import { Search, BookOpen, Volume2, Share2, Check, Sparkles } from 'lucide-react';

export const ScriptureLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const themes = [
    { id: 'todos', label: 'Todas as Escrituras' },
    { id: 'name_of_jesus', label: 'Nome de Jesus' },
    { id: 'reconciliation', label: 'Ministério da Reconciliação' },
    { id: 'grace', label: 'Evangelho da Graça' },
    { id: 'eternal_hope', label: 'Eterna Esperança' },
    { id: 'obedience', label: 'Obediência à Palavra' },
  ];

  const filteredScriptures = SCRIPTURES.filter((item) => {
    const matchesTheme = selectedTheme === 'todos' || item.theme === selectedTheme;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.commentary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  const handleCopy = (item: Scripture) => {
    const textToCopy = `"${item.text}" — ${item.reference} (Sagradas Escrituras)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 shadow-xl space-y-4">
        <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-1">
          Compêndio Sagrado · A Palavra Viva e Eficaz (Hebreus 4:12)
        </p>
        <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-white tracking-tight">
          Bíblia da Graça e da Reconciliação
        </h1>
        <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
          Mergulhe nas verdades eternas que fundamentam nossa fé: o poder inigualável do Nome de Jesus,
          a justificação gratuita, a eterna esperança e o chamado a viver tudo para a Sua glória.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                setSelectedTheme(theme.id);
                soundService.playScriptureTone();
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedTheme === theme.id
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        {/* Search input with functional handler */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por versículo ou tema..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Scriptures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredScriptures.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition-all space-y-4 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="font-cinzel text-amber-300 font-bold text-sm">
                  {item.reference}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => soundService.speakText(`${item.reference}. ${item.text}`)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                    title="Ouvir versículo"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                    title="Copiar versículo"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <blockquote className="text-sm md:text-base text-slate-100 italic leading-relaxed font-serif">
                "{item.text}"
              </blockquote>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-amber-400/90 text-[11px] uppercase tracking-wider">
                Exposição Pastoral da Graça:
              </p>
              <p className="leading-relaxed text-slate-300">
                {item.commentary}
              </p>
            </div>
          </div>
        ))}

        {filteredScriptures.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">Nenhum versículo encontrado para a busca "{searchTerm}".</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTheme('todos');
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Limpar filtros e exibir todas as Escrituras
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
