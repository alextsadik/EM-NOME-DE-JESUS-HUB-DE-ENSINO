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
  unlockedHiddenBadges?: string[];
  claimedHiddenBadges?: string[];
  prayerEntries?: PrayerEntry[];
  radioListeningMinutes?: number;
  completedPraiseChallengesCount?: number;
  meditationMinutes?: number;
  worshipScore?: number;
  worshipStreakDays?: number;
  dailySpiritualGoalsClaimedDate?: string;
  todaySpiritualStats?: {
    date: string;
    prayers: number;
    decrees: number;
    meditationMinutes: number;
  };
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
  equippedAvatarFrameId?: string;
  avatarPhotoUrl?: string;
  avatarIconSymbol?: string;
}

export interface AvatarFrameDefinition {
  id: string;
  name: string;
  epithet: string;
  minScore: number;
  scriptureRef: string;
  scriptureText: string;
  themeColor: string;
  badgeSymbol: string;
  gradientClass: string;
  innerBorderClass: string;
  cornerAccentClass: string;
  auraGlow: string;
  ringAnimation: string;
  accentTitle: string;
  description: string;
}

export interface DailyGratitudeEntry {
  date: string; // YYYY-MM-DD
  formattedDate: string;
  motivos: [string, string, string];
  completedCount: number;
  consecrated: boolean;
  consecratedAt?: number;
  scriptureRef: string;
  scriptureText: string;
}

export type MaturityTierId = 
  | 'vigia'
  | 'cantor'
  | 'levita'
  | 'salmista'
  | 'coluna'
  | 'adorador_eterno';

export interface SpiritualMaturityTier {
  id: MaturityTierId;
  levelNumber: number;
  title: string;
  spiritualEpithet: string;
  minScore: number;
  maxScore: number;
  scriptureRef: string;
  scriptureText: string;
  theologicalPrivilege: string;
  badgeSymbol: string;
  frameStyle: {
    borderClass: string;
    glowClass: string;
    auraStyle: string;
    bannerGradient: string;
    ribbonColor: string;
  };
  unlockedPrivileges: string[];
}

export interface HiddenBadge {
  id: string;
  title: string;
  secretHint: string;
  scriptureRef: string;
  scriptureText: string;
  revealedDescription: string;
  category: 'adoracao' | 'decretos' | 'vigilia' | 'intercessao' | 'missoes';
  iconName: 'sparkles' | 'flame' | 'shield' | 'moon' | 'music' | 'crown' | 'compass' | 'heart' | 'book';
  metricLabel: string;
  targetValue: number;
  currentValue: number;
  isUnlocked: boolean;
  rewardFruit: keyof PlayerStats['fruits'];
  rewardFruitAmount: number;
  rewardGraceBonus: number;
  propheticRiddle?: string;
}

export interface DailySpiritualGoalsConfig {
  prayerTargetCount: number;         // Target prayer count per day (e.g., 3 or 5)
  prayerMinutesTarget?: number;      // Target prayer/intercession minutes
  decreesTargetCount: number;        // Target decrees read/proclaimed per day (e.g., 5)
  meditationMinutesTarget: number;   // Target biblical meditation minutes (e.g., 15)
  rewardFruit: keyof PlayerStats['fruits'];
  rewardFruitAmount: number;
  rewardGraceBonus: number;
  bannerNote?: string;
  updatedAt?: number;
}

export interface DailyGoalsProgress {
  date: string;
  prayersCompleted: number;
  decreesCompleted: number;
  meditationMinutesCompleted: number;
  isPrayerGoalMet: boolean;
  isDecreesGoalMet: boolean;
  isMeditationGoalMet: boolean;
  isAllGoalsMet: boolean;
  isClaimedToday: boolean;
  claimedDate?: string;
}

export type BiblicalRegion = 
  | 'galileia' 
  | 'samaria' 
  | 'judeia' 
  | 'siria' 
  | 'asia_menor' 
  | 'macedonia' 
  | 'grecia' 
  | 'italia' 
  | 'mediterraneo';

export interface MinistryLocationNode {
  id: string;
  name: string;
  biblicalTitle: string;
  region: BiblicalRegion;
  regionLabel: string;
  x: number; // 0 to 100% horizontal coordinate
  y: number; // 0 to 100% vertical coordinate
  biblicalEvent: string;
  scriptureRef: string;
  keyVerse: string;
  missionId?: string;
  missionChapter?: number;
  missionTitle?: string;
  associatedDecreeId?: string;
  decreeTitle?: string;
  theologicalTruth: string;
  territoryMilestone: string;
  spiritualHarvest: string;
  bonusReward?: {
    fruit: keyof PlayerStats['fruits'];
    amount: number;
    gracePoints: number;
  };
}

export interface MinistryMapPath {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  title: string;
  biblicalJourney: string;
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

export interface AudioStreamChannel {
  id: string;
  title: string;
  genre: 'lofi' | 'webradio' | 'meditacao';
  genreLabel: string;
  description: string;
  streamUrl: string;
  synthTone: 'peace' | 'harp' | 'celestial';
  iconName: 'music' | 'radio' | 'sparkles';
}

export interface MediaItem {
  id: string;
  title: string;
  author: string;
  type: 'youtube' | 'podcast' | 'video';
  url: string;
  embedUrl: string;
  description: string;
  category: 'louvor' | 'ensino' | 'salmos' | 'adoracao';
  isCustom?: boolean;
  addedAt?: number;
}

export interface PraiseChallenge {
  id: string;
  psalmRef: string;
  title: string;
  verseText: string;
  theologicalContext: string;
  proclamationDeclaration: string;
  fruitRewardType: keyof PlayerStats['fruits'];
  fruitAmount: number;
  multiplierBoost: number;
  durationMinutes: number;
  theme: 'gratidao' | 'criacao' | 'vitoria' | 'alegria';
}

export interface ActivePraiseMultiplier {
  multiplier: number;
  expiresAt: number;
  challengeTitle: string;
  psalmRef: string;
  fruitRewardType: keyof PlayerStats['fruits'];
}

export type ShiftPeriod = 'todos' | 'madrugada' | 'manha' | 'tarde' | 'noite';
export type PraiseGenre = 'harpa' | 'adoracao' | 'instrumental' | 'jubilo' | 'oracao';

export interface PraiseTrack24h {
  id: string;
  title: string;
  artistOrMinister: string;
  audioUrl: string;
  durationSeconds: number;
  shiftPeriod: ShiftPeriod;
  genre: PraiseGenre;
  isActive: boolean;
  order: number;
  scriptureReference?: string;
  thematicNote?: string;
  addedAt: number;
}

export interface RadioMaintenanceConfig {
  isManualMaintenance: boolean;
  maintenanceDayOfWeek: number; // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
  startHour: string; // e.g. "02:00"
  endHour: string; // e.g. "05:00"
  alertMessage: string;
  contactNotice: string;
  preAlertMinutes: number; // e.g. 30
  autoSilenceAudio: boolean;
}

export type CatalogMediaType = 'music_stream' | 'video' | 'podcast';

export interface CatalogStreamItem {
  id: string;
  title: string;
  authorOrMinistry: string;
  mediaType: CatalogMediaType;
  streamUrl: string;
  embedUrl?: string;
  categoryTag: string;
  description: string;
  status: 'online' | 'ativo' | 'destaque';
  frequencyOrSchedule: string;
  isCustomAdded?: boolean;
  addedAt: number;
}

export type PrayerReminderPeriod = 'manha' | 'meio_dia' | 'tarde' | 'noite' | 'personalizado';

export interface PrayerReminder {
  id: string;
  time: string; // "HH:mm" e.g. "06:00", "12:00", "18:00"
  title: string;
  period: PrayerReminderPeriod;
  scriptureRef: string; // e.g. "Colossenses 3:17"
  verseText: string;
  adorationPrompt: string;
  practicalAction: string;
  enabled: boolean;
  soundEnabled: boolean;
  isPreset?: boolean;
  createdTimestamp?: number;
}

export interface PrayerReminderSettings {
  reminders: PrayerReminder[];
  browserNotificationsEnabled: boolean;
  soundAlertsEnabled: boolean;
  lastTriggeredKey?: string; // e.g. "YYYY-MM-DD-HH:mm"
}

export type WorshiperTier = 
  | 'vigia' 
  | 'cantor' 
  | 'levita' 
  | 'salmista' 
  | 'coluna' 
  | 'adorador_eterno';

export type WorshipTimeframeFilter = 'geral' | 'semanal' | 'mensal';

export interface WorshipRankEntry {
  id: string;
  name: string;
  title: string;
  avatarInitial: string;
  radioMinutes: number;
  challengesCompleted: number;
  meditationMinutes: number;
  totalPoints: number;
  streakDays: number;
  isCurrentUser?: boolean;
  recentActivity: string;
  favoritePsalm: string;
  badge: string;
  tier: WorshiperTier;
}

export interface WorshipLeaderboardData {
  timeframe: WorshipTimeframeFilter;
  weekTheme: string;
  scriptureAnchor: {
    reference: string;
    text: string;
  };
  entries: WorshipRankEntry[];
}

