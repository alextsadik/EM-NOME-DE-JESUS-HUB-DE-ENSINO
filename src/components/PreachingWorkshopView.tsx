/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PREACHING_BLOCKS } from '../data/biblicalContent';
import { PreachingBlock, PlayerStats } from '../types/game';
import { soundService } from '../services/soundEffects';
import { Mic, BookOpen, Sparkles, CheckCircle2, RotateCcw, Volume2, Users, HeartHandshake } from 'lucide-react';

interface PreachingWorkshopViewProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
}

export const PreachingWorkshopView: React.FC<PreachingWorkshopViewProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [selectedFundamento, setSelectedFundamento] = useState<PreachingBlock>(
    PREACHING_BLOCKS.filter((b) => b.type === 'fundamento')[0]
  );
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<PreachingBlock>(
    PREACHING_BLOCKS.filter((b) => b.type === 'diagnostico')[0]
  );
  const [selectedGraca, setSelectedGraca] = useState<PreachingBlock>(
    PREACHING_BLOCKS.filter((b) => b.type === 'graca_cruz')[0]
  );
  const [selectedEnvio, setSelectedEnvio] = useState<PreachingBlock>(
    PREACHING_BLOCKS.filter((b) => b.type === 'envio_nome_jesus')[0]
  );

  const [hasPreached, setHasPreached] = useState<boolean>(false);
  const [isSpeakingSermon, setIsSpeakingSermon] = useState<boolean>(false);

  const fundamentos = PREACHING_BLOCKS.filter((b) => b.type === 'fundamento');
  const diagnosticos = PREACHING_BLOCKS.filter((b) => b.type === 'diagnostico');
  const gracas = PREACHING_BLOCKS.filter((b) => b.type === 'graca_cruz');
  const envios = PREACHING_BLOCKS.filter((b) => b.type === 'envio_nome_jesus');

  const fullSermonText = `Amados irmãos, ouçamos a Palavra de Deus: ${selectedFundamento.content} Contudo, sabemos a aflição do coração humano: ${selectedDiagnostico.content} Mas glória a Deus pelas Boas Novas da Cruz: ${selectedGraca.content} E por isso, a Palavra nos envia hoje: ${selectedEnvio.content} Tudo para a glória do Nome de Jesus Cristo, nossa fonte de vida e eterna esperança!`;

  const handleDeliverSermon = () => {
    soundService.playReconciliationChime();
    setHasPreached(true);

    onUpdateStats({
      ...stats,
      reconciledCount: stats.reconciledCount + 2,
      sermonsDeliveredCount: stats.sermonsDeliveredCount + 1,
      fruits: {
        ...stats.fruits,
        amor: stats.fruits.amor + 15,
        alegria: stats.fruits.alegria + 15,
        paz: stats.fruits.paz + 15,
      },
    });
  };

  const handleSpeakAloud = () => {
    if (isSpeakingSermon) {
      soundService.stopSpeaking();
      setIsSpeakingSermon(false);
    } else {
      setIsSpeakingSermon(true);
      soundService.speakText(fullSermonText, () => setIsSpeakingSermon(false));
    }
  };

  const handleResetSermon = () => {
    setHasPreached(false);
    soundService.playScriptureTone();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Workshop Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-1">
              Oficina de Homilética e Pregação Bíblica · Romanos 10:14-17
            </p>
            <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-white tracking-tight">
              A Mensagem do Evangelho da Graça
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-2 max-w-3xl">
              Como pregarão se não forem enviados? Monte mensagens bíblicas unindo o texto sagrado,
              o diagnóstico do homem, a Graça suficiente da Cruz e o chamado à obediência em Nome de Jesus.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400">Mensagens Proclamadas:</span>
            <span className="text-sm font-semibold text-amber-300 tabular-nums">
              {stats.sermonsDeliveredCount} Ministradas
            </span>
          </div>
        </div>
      </div>

      {/* Assembly Grid: 4 Steps of Preaching */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Fundamento Bíblico */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              1. Fundamento das Escrituras
            </span>
            <span className="text-xs text-slate-500">O Texto Sagrado</span>
          </div>

          <div className="space-y-2.5">
            {fundamentos.map((item) => {
              const isSelected = selectedFundamento.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedFundamento(item);
                    soundService.playScriptureTone();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-950 border-amber-400 ring-1 ring-amber-400/40 text-amber-200'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold text-amber-300 mb-1">
                    {item.title} ({item.scriptureRef})
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    "{item.content}"
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Diagnóstico do Coração */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              2. Diagnóstico do Coração Humano
            </span>
            <span className="text-xs text-slate-500">A Necessidade Real</span>
          </div>

          <div className="space-y-2.5">
            {diagnosticos.map((item) => {
              const isSelected = selectedDiagnostico.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedDiagnostico(item);
                    soundService.playScriptureTone();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-950 border-amber-400 ring-1 ring-amber-400/40 text-amber-200'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold text-amber-300 mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: A Resposta da Cruz e Graça */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              3. O Evangelho da Graça em Cristo
            </span>
            <span className="text-xs text-slate-500">A Solução Divina</span>
          </div>

          <div className="space-y-2.5">
            {gracas.map((item) => {
              const isSelected = selectedGraca.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedGraca(item);
                    soundService.playScriptureTone();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-950 border-amber-400 ring-1 ring-amber-400/40 text-amber-200'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold text-amber-300 mb-1">
                    {item.title} ({item.scriptureRef})
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: O Envio em Nome de Jesus */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              4. O Envio em Nome de Jesus
            </span>
            <span className="text-xs text-slate-500">Obediência Prática (Cl 3:17)</span>
          </div>

          <div className="space-y-2.5">
            {envios.map((item) => {
              const isSelected = selectedEnvio.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedEnvio(item);
                    soundService.playScriptureTone();
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-950 border-amber-400 ring-1 ring-amber-400/40 text-amber-200'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold text-amber-300 mb-1">
                    {item.title} ({item.scriptureRef})
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* The Pulpit / Sermon Delivery Stage */}
      <div className="bg-slate-900/90 rounded-2xl border border-amber-500/30 p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-white">
                O Púlpito da Graça: Mensagem Montada
              </h2>
              <p className="text-xs text-slate-400">
                Fidelidade às Escrituras · Cristocêntrica · Poder no Nome de Jesus
              </p>
            </div>
          </div>

          <button
            onClick={handleSpeakAloud}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isSpeakingSermon ? 'Parar Áudio' : 'Ouvir Pregação'}</span>
          </button>
        </div>

        {/* Full Proclamation Preview */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="space-y-4 text-slate-200 text-base md:text-lg leading-relaxed font-serif">
            <p>
              <strong className="text-amber-300 font-sans text-xs tracking-wider uppercase block mb-1">
                Fundamento:
              </strong>
              "{selectedFundamento.content}"
            </p>

            <p>
              <strong className="text-amber-300 font-sans text-xs tracking-wider uppercase block mb-1">
                O Dilema Humano:
              </strong>
              {selectedDiagnostico.content}
            </p>

            <p>
              <strong className="text-amber-300 font-sans text-xs tracking-wider uppercase block mb-1">
                A Glória da Graça em Cristo:
              </strong>
              {selectedGraca.content}
            </p>

            <p>
              <strong className="text-amber-300 font-sans text-xs tracking-wider uppercase block mb-1">
                O Chamado e Envio:
              </strong>
              {selectedEnvio.content}
            </p>
          </div>
        </div>

        {/* Preach Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            onClick={handleDeliverSermon}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 transition-all shadow-md active:scale-95"
          >
            <Mic className="w-5 h-5" />
            <span>Pregar Esta Mensagem à Congregação</span>
          </button>

          {hasPreached && (
            <button
              onClick={handleResetSermon}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Montar Nova Mensagem</span>
            </button>
          )}
        </div>

        {/* Congregation Reaction & Results */}
        {hasPreached && (
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-400" />
              <h3 className="font-cinzel text-lg font-bold text-emerald-300">
                A Palavra de Deus Produziu Fruto!
              </h3>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed">
              Ouvintes foram tocados pelo Evangelho da Graça. As amarras da autojustiça caíram por terra e vidas
              se reconciliaram com Deus e com o próximo, decidindo viver tudo em Nome do Senhor Jesus!
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="text-emerald-300 font-semibold">+2 Almas Reconciliadas</span>
              <span>·</span>
              <span>+15 Fruto do Amor</span>
              <span>·</span>
              <span>+15 Fruto da Alegria</span>
              <span>·</span>
              <span>+15 Fruto da Paz</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
