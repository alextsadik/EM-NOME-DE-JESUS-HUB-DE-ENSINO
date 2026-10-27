/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MISSIONS } from '../data/biblicalContent';
import { NarrativeMission, DialogueChoice, PlayerStats } from '../types/game';
import { soundService } from '../services/soundEffects';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Volume2,
  Sparkles,
  MapPin,
  User,
  HeartHandshake,
  Eye,
  ShieldAlert,
  Flame,
  Clock,
  Compass,
} from 'lucide-react';
import { DailyPromiseCard } from './DailyPromiseCard';

interface MissionsViewProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onNavigateToDecree: (decreeId: string) => void;
  onNavigateToJournal?: () => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  stats,
  onUpdateStats,
  onNavigateToDecree,
  onNavigateToJournal,
}) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(MISSIONS[0].id);
  const currentMission = MISSIONS.find((m) => m.id === selectedMissionId) || MISSIONS[0];

  const [currentStepId, setCurrentStepId] = useState<string>(currentMission.initialStepId);
  const [feedbackHistory, setFeedbackHistory] = useState<
    { choiceText: string; feedback: string; isWise: boolean }[]
  >([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(
    stats.completedMissions.includes(currentMission.id)
  );

  // Spiritual Lens & Celestial Aid States
  const [ephesiansLensActive, setEphesiansLensActive] = useState<boolean>(false);
  const [kairosModalOpen, setKairosModalOpen] = useState<boolean>(false);
  const [angelicAidActive, setAngelicAidActive] = useState<boolean>(false);

  // Current step in dialogue
  const currentStep =
    currentMission.steps[currentStepId] || currentMission.steps[currentMission.initialStepId];

  const handleSelectMission = (mission: NarrativeMission) => {
    setSelectedMissionId(mission.id);
    setCurrentStepId(mission.initialStepId);
    setFeedbackHistory([]);
    setIsCompleted(stats.completedMissions.includes(mission.id));
    setAngelicAidActive(false);
    soundService.playScriptureTone();
  };

  const handleToggleEphesiansLens = () => {
    const nextState = !ephesiansLensActive;
    setEphesiansLensActive(nextState);
    if (nextState) {
      soundService.playSpiritualVisionTone();
      onUpdateStats({
        ...stats,
        spiritualVisionUsedCount: (stats.spiritualVisionUsedCount || 0) + 1,
      });
    } else {
      soundService.playScriptureTone();
    }
  };

  const handleInvokeAngelicAid = () => {
    soundService.playAngelicHarpChime();
    setAngelicAidActive(true);
    onUpdateStats({
      ...stats,
      angelicAidInvokedCount: (stats.angelicAidInvokedCount || 0) + 1,
      fruits: {
        ...stats.fruits,
        paz: stats.fruits.paz + 5,
        fidelidade: stats.fruits.fidelidade + 5,
      },
    });
  };

  const handleChoose = (choice: DialogueChoice) => {
    // Record feedback
    setFeedbackHistory((prev) => [
      ...prev,
      {
        choiceText: choice.text,
        feedback: choice.responseFeedback,
        isWise: choice.isBiblicallyWise,
      },
    ]);

    // Handle sound & fruits
    if (choice.isBiblicallyWise) {
      soundService.playScriptureTone();
      if (choice.fruitGain) {
        const updatedFruits = { ...stats.fruits };
        if (choice.fruitGain.fruit in updatedFruits) {
          (updatedFruits as any)[choice.fruitGain.fruit] += choice.fruitGain.amount;
        }
        onUpdateStats({
          ...stats,
          fruits: updatedFruits,
        });
      }
    }

    if (choice.triggerDecreeId) {
      soundService.playCelestialDecreeSound();
    }

    // Step navigation
    if (choice.nextStepId && currentMission.steps[choice.nextStepId]) {
      setCurrentStepId(choice.nextStepId);
      // Check if this step is victory
      if (choice.nextStepId.includes('victory')) {
        soundService.playReconciliationChime();
        if (!stats.completedMissions.includes(currentMission.id)) {
          const updatedCompleted = [...stats.completedMissions, currentMission.id];
          const updatedDecrees = stats.unlockedDecrees.includes(currentMission.decreeUnlockedId)
            ? stats.unlockedDecrees
            : [...stats.unlockedDecrees, currentMission.decreeUnlockedId];

          onUpdateStats({
            ...stats,
            reconciledCount: stats.reconciledCount + 1,
            completedMissions: updatedCompleted,
            unlockedDecrees: updatedDecrees,
          });
          setIsCompleted(true);
        }
      }
    } else {
      // Completed mission
      soundService.playReconciliationChime();
      setIsCompleted(true);
    }
  };

  const handleResetMission = () => {
    setCurrentStepId(currentMission.initialStepId);
    setFeedbackHistory([]);
    setIsCompleted(stats.completedMissions.includes(currentMission.id));
    setAngelicAidActive(false);
    soundService.playScriptureTone();
  };

  const isStepVictory = currentStepId.includes('victory');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Hero Banner with Generated Asset */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-slate-900 shadow-xl">
        <div className="h-48 md:h-64 w-full relative">
          <img
            src="/src/assets/images/hero_grace_light_1793049497946.jpg"
            alt="Luz da Graça e Reconciliação sobre os olivais"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-1">
                Jornada dos Embaixadores de Cristo · Efésios 6:12 & 2 Coríntios 5:18-20
              </p>
              <h1 className="font-cinzel text-2xl md:text-4xl font-bold text-white tracking-tight">
                Missões da Reconciliação e Combate da Fé
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-2 max-w-3xl">
                Nossa luta NÃO é contra a carne e o sangue, mas contra principados e potestades.
                Discerna o que o Pai está fazendo no Seu tempo Kairós e conte com a assistência dos anjos
                ministradores que obedecem à voz da Palavra de Deus (Sl 103:20).
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400">Progresso do Ministério:</span>
              <span className="text-sm font-semibold text-amber-300 tabular-nums">
                {stats.completedMissions.length} de {MISSIONS.length} Concluídos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Biblical Promise of Protection and Authority Component */}
      <DailyPromiseCard
        stats={stats}
        onUpdateStats={onUpdateStats}
        onNavigateToJournal={onNavigateToJournal}
      />

      {/* Chapter Selection Horizontal Strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Capítulos da Jornada Apostólica
          </h2>
          <span className="text-xs text-slate-500">Selecione um cenário bíblico</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MISSIONS.map((m) => {
            const isSelected = m.id === selectedMissionId;
            const isDone = stats.completedMissions.includes(m.id);

            return (
              <button
                key={m.id}
                onClick={() => handleSelectMission(m)}
                className={`p-4 rounded-xl text-left border transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-amber-400">
                    Capítulo {m.chapterNumber}
                  </span>
                  {isDone && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reconciliado
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-slate-100 line-clamp-1">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{m.location}</span>
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spiritual Tools Action Deck (Ephesians 6 Lens, Kairos Father Insight, Angelic Aid) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Ephesians 6:12 Lens Toggle */}
          <button
            onClick={handleToggleEphesiansLens}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              ephesiansLensActive
                ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300'
                : 'bg-slate-800 text-sky-300 hover:bg-slate-750 border border-sky-500/30'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>
              {ephesiansLensActive ? 'Lente Efésios 6:12: Ativa' : 'Ativar Lente de Efésios 6:12'}
            </span>
          </button>

          {/* 2. Angelic Aid Call */}
          <button
            onClick={handleInvokeAngelicAid}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              angelicAidActive
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-750 border border-amber-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {angelicAidActive ? 'Anjos Ministradores em Ação (Sl 103:20)' : 'Acionar Ajuda Angelical (Sl 103)'}
            </span>
          </button>

          {/* 3. Kairos Father Insight */}
          <button
            onClick={() => {
              setKairosModalOpen(!kairosModalOpen);
              soundService.playScriptureTone();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-750 border border-slate-700 transition-all"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Ver o Que o Pai Está Fazendo (Jo 5:19)</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          <span className="font-cinzel text-amber-300">Tempo Kairós</span> · O agir eterno de Deus
        </div>
      </div>

      {/* Ephesians 6 Spiritual Vision Banner when active */}
      {ephesiansLensActive && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-950 to-indigo-950/60 border border-sky-400/50 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-sky-300 font-cinzel font-bold text-sm md:text-base">
            <ShieldAlert className="w-5 h-5 text-sky-400" />
            <span>Discernimento Espiritual Bíblico (Efésios 6:12)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                O Ser Humano (Alvo da Graça e Reconciliação):
              </span>
              <p className="text-slate-200 font-medium">
                {currentMission.characterName} · {currentMission.characterTitle}
              </p>
              <p className="text-slate-400 text-xs">
                "Não temos que lutar contra carne e sangue." Não ataque, não julgue e não hostilize {currentMission.characterName}.
                Ele é ovelha resgatada pelo sangue do Cordeiro!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-1.5">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
                O Verdadeiro Inimigo Espiritual Revelado:
              </span>
              <p className="text-rose-200 font-bold">
                {currentMission.spiritualEnemy.name} ({currentMission.spiritualEnemy.category})
              </p>
              <p className="text-slate-300 text-xs leading-relaxed">
                {currentMission.spiritualEnemy.schemeDescription}
              </p>
              <p className="text-amber-300 text-xs font-semibold pt-1">
                Versículo de Vitória: {currentMission.spiritualEnemy.scriptureOfVictory}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kairos Father Insight Box when toggled */}
      {kairosModalOpen && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-400/40 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <h3 className="font-cinzel text-base font-bold text-amber-200">
                Sintonia com o Pai: O Gerúndio Divino (João 5:17-19)
              </h3>
            </div>
            <button
              onClick={() => setKairosModalOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fechar
            </button>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-slate-200 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <strong className="text-amber-300 block mb-1">
                O Que o Pai Está FAZENDO Agora no Tempo Kairós:
              </strong>
              <p className="italic text-slate-200 font-serif">
                "{currentMission.kairosInsight.fatherActionGerund}"
              </p>
            </div>

            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">O Padrão de Jesus:</strong> {currentMission.kairosInsight.jesusPrinciple}.
              Deus é o Eterno "EU SOU". Ele não está inerte; Ele está operando agora no coração desta pessoa!
            </p>
          </div>
        </div>
      )}

      {/* Angelic Aid Banner when active */}
      {angelicAidActive && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-400/40 flex items-center justify-between gap-4 text-xs text-slate-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300">
                Ajuda Celestial em Ação · {currentMission.angelicAssistance.psalm103Ref} & {currentMission.angelicAssistance.hebrewsRef}
              </p>
              <p className="text-slate-300">
                {currentMission.angelicAssistance.ministeringOperation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Mission Interactive Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Context, Scripture and Character Briefing (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mission Briefing Card */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-300">{currentMission.location}</span>
              </div>
              <span className="text-xs text-slate-400">Capítulo {currentMission.chapterNumber}</span>
            </div>

            <div>
              <h2 className="font-cinzel text-xl font-bold text-slate-100">
                {currentMission.title}
              </h2>
              <p className="text-xs text-amber-400/90 font-medium mt-1">
                {currentMission.biblicalTheme}
              </p>
            </div>

            {/* Character Info */}
            <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-sm text-slate-200">
                  {currentMission.characterName}
                </span>
              </div>
              <p className="text-xs text-amber-300/80 font-medium">
                {currentMission.characterTitle}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentMission.characterBio}
              </p>
            </div>

            {/* Biblical Key Scripture */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Espada do Espírito · {currentMission.keyScripture.reference}</span>
              </div>
              <blockquote className="text-xs italic text-slate-300 bg-slate-950/50 p-3 rounded-lg border-l-2 border-amber-400/60 leading-relaxed">
                "{currentMission.keyScripture.text}"
              </blockquote>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentMission.keyScripture.commentary}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetMission}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar Diálogo deste Capítulo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Dialogue & Decision Deck (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl">
            {/* Mission Stage Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Fase da Conversa:</span>
                <span className="font-medium text-slate-200">
                  {isStepVictory ? 'Reconciliação Alcançada' : 'Encontro & Discernimento'}
                </span>
              </div>

              <button
                onClick={() => soundService.speakText(currentStep.dialogueText)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                title="Ouvir leitura em voz alta"
              >
                <Volume2 className="w-4 h-4" />
                <span>Ouvir Voz</span>
              </button>
            </div>

            {/* Speaker Dialogue Bubble */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-amber-300">{currentStep.speaker}</span>
                <span>·</span>
                <span>{currentStep.role}</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 text-base md:text-lg leading-relaxed shadow-inner">
                "{currentStep.dialogueText}"
              </div>

              {currentStep.reflectionPrompt && (
                <p className="text-xs text-slate-400 italic pt-1">
                  Direção pastoral: {currentStep.reflectionPrompt}
                </p>
              )}
            </div>

            {/* Prior Dialogue Choice Feedback History */}
            {feedbackHistory.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Impacto da sua resposta anterior:
                </p>
                {feedbackHistory.slice(-1).map((item, index) => (
                  <div
                    key={index}
                    className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                      item.isWise
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    <p className="font-semibold mb-1">"{item.choiceText}"</p>
                    <p>{item.feedback}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Victory Card when mission is completed */}
            {isStepVictory && (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-950 border border-amber-500/40 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-lg font-bold text-amber-300">
                      Ministério da Reconciliação Cumprido!
                    </h3>
                    <p className="text-xs text-slate-300">
                      Esta alma foi acolhida na Graça e liberta em Nome de Jesus. Os anjos celebram nos céus!
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {currentMission.victoryMessage}
                </p>

                {/* Prayer of reconciliation */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  <p className="font-semibold text-amber-400">Oração de Consagração:</p>
                  <p className="text-slate-300 italic">{currentMission.prayerOfReconciliation}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigateToDecree(currentMission.decreeUnlockedId)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ver Decreto Desbloqueado no Altar</span>
                  </button>

                  <button
                    onClick={handleResetMission}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revisitar Diálogo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Decision Choices */}
            {!isStepVictory && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Como você orienta esta vida em Cristo?
                </p>

                <div className="space-y-3">
                  {currentStep.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoose(choice)}
                      className="w-full text-left p-4 md:p-5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/50 transition-all flex items-start justify-between gap-4 group"
                    >
                      <div className="space-y-1">
                        <p className="text-sm md:text-base text-slate-200 group-hover:text-amber-200 font-medium leading-relaxed">
                          {choice.text}
                        </p>
                        {choice.isBiblicallyWise && (
                          <span className="inline-block text-[11px] text-amber-400/80 font-normal">
                            Ministério da Graça e Reconciliação
                          </span>
                        )}
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-400 shrink-0 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
