/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EVERYDAY_SCENARIOS } from '../data/biblicalContent';
import { EverydayDeedScenario, PlayerStats } from '../types/game';
import { soundService } from '../services/soundEffects';
import { HeartHandshake, CheckCircle2, AlertCircle, Sparkles, BookOpen, RotateCcw } from 'lucide-react';

interface ColossiansPracticeViewProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
}

export const ColossiansPracticeView: React.FC<ColossiansPracticeViewProps> = ({
  stats,
  onUpdateStats,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(EVERYDAY_SCENARIOS[0].id);
  const [answeredScenarios, setAnsweredScenarios] = useState<
    Record<string, { choiceId: string; isCorrect: boolean; explanation: string }>
  >({});

  const currentScenario =
    EVERYDAY_SCENARIOS.find((s) => s.id === selectedScenarioId) || EVERYDAY_SCENARIOS[0];
  const currentAnswer = answeredScenarios[currentScenario.id];

  const handleSelectChoice = (choiceId: string) => {
    const choice = currentScenario.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    if (choice.isColossians317) {
      soundService.playReconciliationChime();
      onUpdateStats({
        ...stats,
        fruits: {
          ...stats.fruits,
          amor: stats.fruits.amor + 10,
          paz: stats.fruits.paz + 10,
          fidelidade: stats.fruits.fidelidade + 10,
          dominioProprio: stats.fruits.dominioProprio + 10,
        },
      });
    } else {
      soundService.playScriptureTone();
    }

    setAnsweredScenarios((prev) => ({
      ...prev,
      [currentScenario.id]: {
        choiceId,
        isCorrect: choice.isColossians317,
        explanation: choice.explanation,
      },
    }));
  };

  const handleResetScenario = () => {
    setAnsweredScenarios((prev) => {
      const copy = { ...prev };
      delete copy[currentScenario.id];
      return copy;
    });
    soundService.playScriptureTone();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 shadow-xl space-y-4">
        <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-1">
          A Prática da Obediência · Colossenses 3:17
        </p>
        <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-white tracking-tight">
          Tudo Quanto Fizerdes: A Vida em Nome de Jesus
        </h1>
        <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
          "E tudo quanto fizerdes por palavras ou por obras, fazei-o em nome do Senhor Jesus, dando por ele graças a Deus Pai."
          A fé verdadeira se manifesta nas pequenas e grandes decisões do dia a dia.
        </p>
      </div>

      {/* Scenarios Grid & Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {EVERYDAY_SCENARIOS.map((sc, idx) => {
          const isSelected = sc.id === selectedScenarioId;
          const answer = answeredScenarios[sc.id];

          return (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenarioId(sc.id);
                soundService.playScriptureTone();
              }}
              className={`p-4 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400/40 shadow-md'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-amber-400">
                  Dilema 0{idx + 1}
                </span>
                {answer && (
                  <span
                    className={`text-[11px] font-medium ${
                      answer.isCorrect ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {answer.isCorrect ? 'Honrou a Cristo' : 'Aprendeu'}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm text-slate-100 line-clamp-2">
                {sc.title}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Active Dilemma Playground */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-semibold">{currentScenario.scriptureGuide}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Decisão Diária</span>
          </div>

          {currentAnswer && (
            <button
              onClick={handleResetScenario}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>
          )}
        </div>

        <div>
          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-white">
            {currentScenario.title}
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {currentScenario.context}
          </p>
        </div>

        {/* The Dilemma Box */}
        <div className="p-4 md:p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs md:text-sm text-amber-200 leading-relaxed">
          <strong className="text-amber-400 block mb-1">O Conflito Interior:</strong>
          {currentScenario.dilemma}
        </div>

        {/* Choice buttons */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Como você age para honrar o Nome de Jesus Cristo?
          </p>

          <div className="space-y-3">
            {currentScenario.choices.map((choice) => {
              const isSelected = currentAnswer?.choiceId === choice.id;

              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelectChoice(choice.id)}
                  disabled={!!currentAnswer}
                  className={`w-full text-left p-4 md:p-5 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? choice.isColossians317
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100 ring-1 ring-emerald-400/40'
                        : 'bg-rose-950/30 border-rose-500/50 text-rose-100 ring-1 ring-rose-400/40'
                      : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 hover:border-amber-400/50 text-slate-200'
                  }`}
                >
                  <div className="pt-0.5">
                    {isSelected ? (
                      choice.isColossians317 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-600 shrink-0" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm md:text-base font-medium leading-relaxed">
                      {choice.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Biblical Result & Explanation */}
        {currentAnswer && (
          <div
            className={`p-5 rounded-xl border space-y-2 ${
              currentAnswer.isCorrect
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>
                {currentAnswer.isCorrect
                  ? 'Atitude aprovada em Nome de Jesus!'
                  : 'Reflexão Bíblica para Crescimento'}
              </span>
            </div>
            <p className="text-xs md:text-sm leading-relaxed text-slate-200">
              {currentAnswer.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
