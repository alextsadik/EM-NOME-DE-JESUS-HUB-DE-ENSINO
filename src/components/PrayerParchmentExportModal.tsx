import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Scroll,
  Sparkles,
  BookOpen,
  Calendar,
  Heart,
  CheckCircle2,
  Shield,
  Award,
  Share2
} from 'lucide-react';
import { PlayerStats, PrayerEntry, DailyGratitudeEntry } from '../types/game';
import { soundService } from '../services/soundEffects';

interface PrayerParchmentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  entries: PrayerEntry[];
}

export const PrayerParchmentExportModal: React.FC<PrayerParchmentExportModalProps> = ({
  isOpen,
  onClose,
  stats,
  entries,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'intercessions' | 'answered' | 'gratitude'>('all');
  const parchmentRef = useRef<HTMLDivElement>(null);

  // Load gratitudes from localStorage
  const weeklyGratitudes = useMemo(() => {
    try {
      const raw = localStorage.getItem('em_nome_de_jesus_daily_gratitudes');
      if (!raw) return [];
      const parsed: Record<string, DailyGratitudeEntry> = JSON.parse(raw);
      // Sort desc by date, take past 7 entries
      return Object.values(parsed)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7);
    } catch {
      return [];
    }
  }, [isOpen]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => {
      if (filterType === 'answered') return e.isAnswered;
      if (filterType === 'intercessions') return e.type === 'intercessao';
      if (filterType === 'gratitude') return e.type === 'gratidao';
      return true;
    });
  }, [entries, filterType]);

  const answeredEntries = useMemo(() => {
    return (entries || []).filter((e) => e.isAnswered);
  }, [entries]);

  if (!isOpen) return null;

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handlePrint = () => {
    soundService.playScriptureTone();
    window.print();
  };

  const handleCopyText = () => {
    let text = `📜 MEMORIAL SAGRADO DE ORAÇÕES & GRATIDÃO 📜\n`;
    text += `«E tudo o que fizerdes, seja em palavra, seja em ação, fazei-o em nome do Senhor Jesus» (Cl 3:17)\n`;
    text += `Semana de Consagração — Gerado em: ${todayFormatted}\n`;
    text += `WorshipScore: ${stats.worshipScore || 0} pts | Nível: ${Math.floor((stats.worshipScore || 0) / 500) + 1}\n\n`;

    text += `═══════════════════════════════════════════\n`;
    text += `✨ CLAMORES & REGISTROS DE ORAÇÃO:\n`;
    text += `═══════════════════════════════════════════\n`;
    filteredEntries.forEach((entry, idx) => {
      text += `\n${idx + 1}. ${entry.title.toUpperCase()} (${entry.category})\n`;
      text += `   Data: ${entry.date} | Versículo: ${entry.scriptureRef || 'Colossenses 3:17'}\n`;
      text += `   Clamor: ${entry.description}\n`;
      if (entry.isAnswered && entry.testimonyNote) {
        text += `   [TESTEMUNHO DE RESPOSTA]: ${entry.testimonyNote}\n`;
      }
    });

    if (weeklyGratitudes.length > 0) {
      text += `\n═══════════════════════════════════════════\n`;
      text += `🙏 3 MOTIVOS DIÁRIOS DE GRATIDÃO:\n`;
      text += `═══════════════════════════════════════════\n`;
      weeklyGratitudes.forEach((g) => {
        text += `\n📅 Data: ${g.formattedDate || g.date}\n`;
        (g.motivos || []).forEach((item: string) => {
          text += `   • ${item}\n`;
        });
      });
    }

    text += `\n═══════════════════════════════════════════\n`;
    text += `Bênção Sacerdotal (Números 6:24-26):\n`;
    text += `"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz." Amém!\n`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    soundService.playPrayerChime();
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadHtml = () => {
    soundService.playAngelicHarpChime();
    const content = parchmentRef.current?.innerHTML || '';
    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Pergaminho de Orações - ${todayFormatted}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    body {
      margin: 0;
      padding: 40px 20px;
      background: #2a2015;
      font-family: 'Playfair Display', Georgia, serif;
      color: #3b2a1a;
      display: flex;
      justify-content: center;
    }
    .parchment-container {
      max-width: 820px;
      width: 100%;
      background: #faf4e3;
      background: linear-gradient(135deg, #fdf8eb 0%, #f7eccb 50%, #f4e4bc 100%);
      padding: 45px 50px;
      border: 3px double #9b7238;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.45);
      position: relative;
    }
    h1, h2, h3, h4, .cinzel { font-family: 'Cinzel', serif; }
    .gold-seal {
      border: 2px solid #b8860b;
      background: #fffdf7;
      padding: 12px;
      border-radius: 8px;
    }
    @media print {
      body { background: white; padding: 0; }
      .parchment-container { box-shadow: none; border: 2px solid #8b6228; padding: 30px; }
    }
  </style>
</head>
<body>
  <div class="parchment-container">
    ${content}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pergaminho_Oracoes_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Print stylesheet override for pristine parchment A4 output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #parchment-print-zone, #parchment-print-zone * {
            visibility: visible;
          }
          #parchment-print-zone {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: #fffdf7 !important;
            color: #2b1d0c !important;
            border: 2px double #8b6508 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-transparent">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-950 border-b border-amber-500/30 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base md:text-lg font-bold text-amber-200">
                Memorial Semanal de Oração em Pergaminho
              </h3>
              <p className="text-xs text-slate-400">
                Exporte, imprima ou salve as orações e gratidões em pergaminho sagrado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/20 transition-all"
              title="Copiar texto formatado"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40 transition-all"
              title="Baixar Pergaminho em HTML"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-md transition-all active:scale-95"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors ml-1"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar for export */}
        <div className="no-print bg-slate-950/60 border-b border-slate-800 px-5 py-2.5 flex items-center gap-2 text-xs overflow-x-auto">
          <span className="text-slate-400 shrink-0 font-medium">Conteúdo do Pergaminho:</span>
          {[
            { id: 'all', label: 'Tudo (Orações + Gratidões)' },
            { id: 'intercessions', label: 'Apenas Intercessões' },
            { id: 'gratitude', label: 'Apenas Ações de Graça' },
            { id: 'answered', label: 'Apenas Respondidas' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as typeof filterType)}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Parchment Viewer (Scrollable preview & Print container) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-amber-950/20 print:p-0 print:bg-white">
          <div
            id="parchment-print-zone"
            ref={parchmentRef}
            className="mx-auto max-w-3xl bg-[#faf4e1] bg-gradient-to-b from-[#fdf8ec] via-[#f7ebd0] to-[#f3e3be] text-[#3d2c1d] rounded-xl shadow-2xl p-6 sm:p-10 border-4 border-double border-[#8f6a33] relative print:border-2 print:shadow-none print:rounded-none"
          >
            {/* Ornate corner ornaments (SVG filigrees) */}
            <div className="absolute top-2 left-2 text-[#8f6a33]/60 select-none pointer-events-none font-serif text-lg">
              ❦
            </div>
            <div className="absolute top-2 right-2 text-[#8f6a33]/60 select-none pointer-events-none font-serif text-lg">
              ❧
            </div>
            <div className="absolute bottom-2 left-2 text-[#8f6a33]/60 select-none pointer-events-none font-serif text-lg">
              ❧
            </div>
            <div className="absolute bottom-2 right-2 text-[#8f6a33]/60 select-none pointer-events-none font-serif text-lg">
              ❦
            </div>

            {/* Parchment Header */}
            <div className="text-center border-b-2 border-[#8f6a33]/30 pb-6 mb-7 relative">
              <div className="inline-flex items-center justify-center gap-2 mb-2">
                <span className="text-[#8f6a33] text-sm">✦ ✦ ✦</span>
                <span className="text-xs uppercase tracking-widest font-cinzel font-bold text-[#8f6a33]">
                  DIÁRIO DE ORAÇÃO & MEMORIAL
                </span>
                <span className="text-[#8f6a33] text-sm">✦ ✦ ✦</span>
              </div>

              <h1 className="font-cinzel text-xl sm:text-3xl font-extrabold tracking-wide text-[#2e1d0f] uppercase">
                Memorial Sagrado no Nome de Jesus
              </h1>

              <p className="font-serif italic text-xs sm:text-sm text-[#5d442d] max-w-xl mx-auto mt-2 leading-relaxed">
                "E tudo o que fizerdes, seja em palavra, seja em ação, fazei-o em nome do Senhor Jesus, dando por ele graças a Deus Pai."
                <span className="block font-sans font-bold text-xs text-[#7e5621] mt-0.5">
                  — Colossenses 3:17
                </span>
              </p>

              <div className="mt-3 flex items-center justify-center gap-4 text-xs font-serif text-[#6b4e34]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8f6a33]" />
                  Consagrado em: {todayFormatted}
                </span>
                <span>•</span>
                <span className="font-sans font-semibold text-[#8f6a33]">
                  WorshipScore: {stats.worshipScore || 0} pts
                </span>
              </div>
            </div>

            {/* Section 1: Weekly Prayer Entries */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 border-b border-[#8f6a33]/30 pb-1.5 mb-4">
                  <BookOpen className="w-4 h-4 text-[#8f6a33]" />
                  <h2 className="font-cinzel text-sm sm:text-base font-bold text-[#2e1d0f] tracking-wide uppercase">
                    I. Registros de Clamor & Intercessão
                  </h2>
                  <span className="text-xs font-sans text-[#7e5621] ml-auto">
                    {filteredEntries.length} {filteredEntries.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                {filteredEntries.length === 0 ? (
                  <p className="text-xs font-serif italic text-[#7e6044] text-center py-4">
                    Nenhum registro selecionado para este filtro.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredEntries.map((entry, idx) => (
                      <div
                        key={entry.id || idx}
                        className="bg-[#fefcf6]/80 border border-[#c4a673]/60 rounded-lg p-3.5 sm:p-4 text-xs sm:text-sm space-y-1.5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <h3 className="font-serif font-bold text-[#2d1b0d] text-sm sm:text-base">
                            {idx + 1}. {entry.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="px-2 py-0.5 rounded font-sans font-medium uppercase text-[10px] bg-[#ebd8b2] text-[#4d3319] border border-[#cfb586]">
                              {entry.category}
                            </span>
                            <span className="text-[#7e6044] font-serif">{entry.date}</span>
                          </div>
                        </div>

                        <p className="font-serif text-[#443020] leading-relaxed italic">
                          "{entry.description}"
                        </p>

                        {entry.scriptureRef && (
                          <p className="text-[11px] font-sans text-[#8f6a33] font-semibold">
                            Fundamento Bíblico: {entry.scriptureRef}
                          </p>
                        )}

                        {entry.isAnswered && (
                          <div className="mt-2 pt-2 border-t border-[#ebd8b2] bg-[#f5ede0] rounded p-2 text-xs flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-cinzel font-bold text-emerald-900 block">
                                Oração Respondida pelo Senhor:
                              </span>
                              <p className="font-serif italic text-emerald-950">
                                {entry.testimonyNote || 'Graça manifesta perante o Altar da Oração!'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Daily 3 Gratitudes (If applicable) */}
              {weeklyGratitudes.length > 0 && filterType !== 'intercessions' && (
                <div className="mt-7">
                  <div className="flex items-center gap-2 border-b border-[#8f6a33]/30 pb-1.5 mb-4">
                    <Heart className="w-4 h-4 text-[#8f6a33]" />
                    <h2 className="font-cinzel text-sm sm:text-base font-bold text-[#2e1d0f] tracking-wide uppercase">
                      II. Colheita Semanal de Gratidão (1 Tessalonicenses 5:18)
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {weeklyGratitudes.map((grat, idx) => (
                      <div
                        key={idx}
                        className="bg-[#fefcf6]/80 border border-[#c4a673]/60 rounded-lg p-3 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#7e6044] font-serif font-bold border-b border-[#ebd8b2] pb-1">
                          <span>{grat.formattedDate || grat.date}</span>
                          <span className="font-sans text-[#8f6a33]">3 Motivos</span>
                        </div>
                        <ul className="space-y-1 font-serif text-[#3b2a1a]">
                          {(grat.motivos || []).map((reason: string, rIdx: number) => (
                            <li key={rIdx} className="flex items-start gap-1.5">
                              <span className="text-[#8f6a33] font-bold">•</span>
                              <span className="italic">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parchment Footer: Spiritual Seal & Priestly Blessing */}
              <div className="mt-8 pt-6 border-t-2 border-[#8f6a33]/30 text-center space-y-4">
                {/* Royal Seal */}
                <div className="inline-flex items-center gap-3 bg-[#fdf5e2] border-2 border-[#8f6a33] rounded-full px-5 py-2 shadow-inner">
                  <Award className="w-5 h-5 text-[#8f6a33]" />
                  <span className="font-cinzel font-bold text-xs uppercase text-[#2e1d0f] tracking-wider">
                    Selo Sagrado de Fé & Oração em Nome de Jesus
                  </span>
                  <span className="text-xs text-[#7e5621] font-serif font-semibold">
                    Graça e Paz
                  </span>
                </div>

                {/* Priestly Blessing */}
                <div className="max-w-md mx-auto text-xs font-serif italic text-[#4e3621] leading-relaxed">
                  "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz."
                  <span className="block font-sans font-bold text-[11px] text-[#8f6a33] mt-0.5">
                    — Números 6:24-26
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
