/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Scripture {
  id: string;
  reference: string;
  text: string;
  theme: 'grace' | 'name_of_jesus' | 'reconciliation' | 'obedience' | 'eternal_hope' | 'faith' | 'spiritual_warfare' | 'angelic_aid' | 'escatologia';
  commentary: string;
}

export interface Decree {
  id: string;
  title: string;
  subtitle: string;
  scriptureRef: string;
  proclamationText: string;
  theologicalTruth: string;
  category: 'graça' | 'reconciliação' | 'autoridade' | 'cura' | 'obediência' | 'esperança' | 'batalha_espiritual' | 'anjos_ministradores';
  actionPrompt: string;
  angelicResponseNote?: string;
}

export interface DialogueChoice {
  id: string;
  text: string;
  approach: 'graca_verdade' | 'lei_acusacao' | 'omissao_humana';
  responseFeedback: string;
  isBiblicallyWise: boolean;
  scriptureApplied?: string;
  fruitGain?: {
    fruit: 'amor' | 'alegria' | 'paz' | 'longanimidade' | 'benignidade' | 'bondade' | 'fidelidade' | 'mansidao' | 'dominioProprio';
    amount: number;
  };
  nextStepId?: string;
  triggerDecreeId?: string;
}

export interface DialogueStep {
  id: string;
  speaker: string;
  role: string;
  dialogueText: string;
  reflectionPrompt?: string;
  choices: DialogueChoice[];
}

export interface SpiritualEnemy {
  name: string;
  category: 'principados' | 'potestades' | 'príncipes_das_trevas' | 'hostes_da_maldade';
  schemeDescription: string;
  scriptureOfVictory: string;
  truthToOvercome: string;
}

export interface KairosFatherInsight {
  fatherActionGerund: string;
  jesusPrinciple: string;
  spiritualTimingPrompt: string;
}

export interface AngelicAidInfo {
  psalm103Ref: string;
  hebrewsRef: string;
  ministeringOperation: string;
}

export interface NarrativeMission {
  id: string;
  chapterNumber: number;
  title: string;
  location: string;
  characterName: string;
  characterTitle: string;
  characterBio: string;
  biblicalTheme: string;
  keyScripture: Scripture;
  summary: string;
  spiritualEnemy: SpiritualEnemy;
  kairosInsight: KairosFatherInsight;
  angelicAssistance: AngelicAidInfo;
  initialStepId: string;
  steps: Record<string, DialogueStep>;
  victoryMessage: string;
  prayerOfReconciliation: string;
  decreeUnlockedId: string;
}

export interface SpiritualCommand {
  id: string;
  title: string;
  actionVerb: 'amarrar' | 'encarcerar' | 'desarmar' | 'amordaçar' | 'uncao_quebra_jugo' | 'executar_juizo';
  scriptureRef: string;
  commandText: string;
  angelicMission: string;
  biblicalFoundation: string;
  effectMessage: string;
}

export interface VigilanceTopic {
  id: string;
  title: string;
  scriptureRef: string;
  alertContext: string;
  spiritualWarning: string;
  maranataPrayer: string;
  mercyForMan: string;
  judgmentForDarkness: string;
}

export interface PreachingBlock {
  id: string;
  type: 'fundamento' | 'diagnostico' | 'graca_cruz' | 'envio_nome_jesus';
  title: string;
  content: string;
  scriptureRef: string;
  soundDoctrineScore: number;
  theologicalNote: string;
}

export interface EverydayDeedScenario {
  id: string;
  title: string;
  context: string;
  dilemma: string;
  scriptureGuide: string;
  choices: {
    id: string;
    text: string;
    isColossians317: boolean;
    explanation: string;
  }[];
}

export interface PlayerStats {
  reconciledCount: number;
  proclaimedDecreesCount: number;
  sermonsDeliveredCount: number;
  completedMissions: string[];
  unlockedDecrees: string[];
  angelicAidInvokedCount: number;
  spiritualVisionUsedCount: number;
  strongmanBoundCount: number;
  maranataProclaimedCount: number;
  dailyProgress?: MinistryDayActivity[];
  claimedMedals?: string[];
  prayerEntries?: PrayerEntry[];
  fruits: {
    amor: number;
    alegria: number;
    paz: number;
    longanimidade: number;
    benignidade: number;
    bondade: number;
    fidelidade: number;
    mansidao: number;
    dominioProprio: number;
  };
}

export type PrayerType = 'gratidao' | 'intercessao';
export type PrayerCategory = 'familia' | 'cura' | 'reconciliacao' | 'evangelho' | 'trabalho' | 'espiritual';

export interface PrayerEntry {
  id: string;
  type: PrayerType;
  category: PrayerCategory;
  title: string;
  description: string;
  scriptureRef?: string;
  date: string;
  isAnswered?: boolean;
  answeredDate?: string;
  testimonyNote?: string;
}

export interface MinistryDayActivity {
  day: string;
  oracoes: number;
  decretos: number;
  jugosQuebrados: number;
}

export interface AuthorityScriptureGuide {
  id: string;
  title: string;
  sphere: 'autoridade_delegada' | 'chaves_reino' | 'sangue_cruz' | 'armadura' | 'guarda_angelical' | 'resistencia';
  scriptureRef: string;
  text: string;
  combatInstruction: string;
  proclamationDeclaration: string;
}

export interface ReconciliationMedal {
  id: string;
  title: string;
  subtitle: string;
  category: 'graça' | 'autoridade' | 'reconciliação' | 'vigília' | 'obediência';
  scriptureRef: string;
  scriptureText: string;
  theologicalReward: string;
  iconName: 'shield' | 'flame' | 'heart' | 'sparkles' | 'award' | 'book' | 'compass' | 'crown';
  targetCount: number;
  currentValue: number;
  isUnlocked: boolean;
  unitLabel: string;
}
export interface TrainingScenario {
  id: string;
  principalityName: string;
  category: 'principados' | 'potestades' | 'príncipes_das_trevas' | 'hostes_da_maldade';
  schemeTitle: string;
  schemeDescription: string;
  oppressionSign: string;
  scriptureTarget: string;
  recommendedWeaponId: string;
  recommendedCommandId: string;
  theologicalInsight: string;
  victoryDeclaration: string;
}

export interface BiblicalWeapon {
  id: string;
  name: string;
  scriptureRef: string;
  typeLabel: string;
  spiritualPower: string;
  iconName: 'cross' | 'sword' | 'shield' | 'crown' | 'armor' | 'flame';
  effectiveAgainst: string;
}

export interface TrainingSimulationRecord {
  id: string;
  scenarioId: string;
  weaponId: string;
  commandId: string;
  date: string;
  synergyLevel: 'perfeita' | 'forte' | 'biblica';
  verdictTitle: string;
}

export interface BiblicalProtectionPromise {
  id: string;
  reference: string;
  text: string;
  theme: 'protecao_divina' | 'autoridade_espiritual' | 'guarda_angelical' | 'triunfo_cruz' | 'refugio_inabalavel';
  themeLabel: string;
  contextCommentary: string;
  confessionOfFaith: string;
}
