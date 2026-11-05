/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AvatarFrameDefinition, PlayerStats } from '../types/game';
import { calculateWorshipScore } from './biblicalContent';

export const AVATAR_FRAMES: AvatarFrameDefinition[] = [
  {
    id: 'frame-base',
    name: 'Véu do Peregrino da Fé',
    epithet: 'Passos Guiados pela Palavra',
    minScore: 0,
    scriptureRef: 'Salmos 119:105',
    scriptureText: 'Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.',
    themeColor: 'slate',
    badgeSymbol: '🕊️',
    gradientClass: 'from-slate-600 via-slate-400 to-slate-700',
    innerBorderClass: 'border-slate-500/60 ring-1 ring-slate-400/30',
    cornerAccentClass: 'border-slate-400/50',
    auraGlow: 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 0%, rgba(100, 116, 139, 0.1) 60%, transparent 80%)',
    ringAnimation: '',
    accentTitle: 'Moldura Inicial de Fé',
    description: 'Borda sutil de aço e prata celestial concedida a todo servo que inicia sua caminhada no Reino.',
  },
  {
    id: 'frame-500',
    name: 'Cântico de Bronze & Águas Vivas',
    epithet: 'Ressonância do Louvor Sagrado',
    minScore: 500,
    scriptureRef: 'Salmos 96:1-2',
    scriptureText: 'Cantai ao Senhor um cântico novo, cantai ao Senhor todas as terras. Cantai ao Senhor, bendizei o seu nome; anunciai a sua salvação de dia em dia.',
    themeColor: 'emerald',
    badgeSymbol: '🌊',
    gradientClass: 'from-emerald-400 via-teal-300 to-cyan-500',
    innerBorderClass: 'border-emerald-400/70 ring-2 ring-emerald-500/40',
    cornerAccentClass: 'border-teal-300',
    auraGlow: 'radial-gradient(circle, rgba(52, 211, 153, 0.45) 0%, rgba(20, 184, 166, 0.2) 55%, transparent 85%)',
    ringAnimation: 'animate-frame-rotate',
    accentTitle: 'Marco dos 500 Pontos',
    description: 'Gradiente animado de águas vivas e filigranas de bronze sacerdotal, ativado ao romper 500 pontos de adoração.',
  },
  {
    id: 'frame-1000',
    name: 'Filigrana de Safira & Pavimento Celeste',
    epithet: 'Firmeza na Rocha e Glória do Trono',
    minScore: 1000,
    scriptureRef: 'Êxodo 24:10',
    scriptureText: 'E viram o Deus de Israel, e debaixo de seus pés havia como uma obra de pedra de safira, e como o aspecto do céu na sua claridade.',
    themeColor: 'blue',
    badgeSymbol: '💎',
    gradientClass: 'from-blue-500 via-indigo-400 to-sky-300',
    innerBorderClass: 'border-blue-400/80 ring-2 ring-indigo-500/50',
    cornerAccentClass: 'border-sky-300',
    auraGlow: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(99, 102, 241, 0.25) 60%, transparent 85%)',
    ringAnimation: 'animate-frame-rotate-reverse',
    accentTitle: 'Marco dos 1.000 Pontos',
    description: 'Anel celestial de safira viva e cobalto cintilante com rotação solene, espelhando a claridade da abóbada celeste.',
  },
  {
    id: 'frame-2000',
    name: 'Resplendor Dourado do Altar & Shofar do Rei',
    epithet: 'Consagração Levítica e Fogo Sagrado',
    minScore: 2000,
    scriptureRef: '1 Crônicas 16:4 & Levítico 6:13',
    scriptureText: 'E pôs diante da arca do Senhor alguns dos levitas para ministrarem... O fogo arderá continuamente sobre o altar; não se apagará.',
    themeColor: 'amber',
    badgeSymbol: '🎺',
    gradientClass: 'from-amber-400 via-yellow-200 to-amber-600',
    innerBorderClass: 'border-amber-400 ring-2 ring-yellow-400/60',
    cornerAccentClass: 'border-amber-300',
    auraGlow: 'radial-gradient(circle, rgba(245, 158, 11, 0.55) 0%, rgba(251, 191, 36, 0.3) 55%, transparent 88%)',
    ringAnimation: 'animate-frame-rotate',
    accentTitle: 'Marco dos 2.000 Pontos',
    description: 'Ouro fundido resplandecente com rotação de luz de glória e insígnias do shofar, honrando a permanência fiel perante o altar.',
  },
  {
    id: 'frame-5000',
    name: 'Diadema Celestial de Ametista & Chama da Glória',
    epithet: 'Coluna Inabalável no Templo do Pai',
    minScore: 5000,
    scriptureRef: 'Apocalipse 3:12',
    scriptureText: 'A quem vencer, eu o farei coluna no templo do meu Deus, e dele nunca sairá; e escreverei sobre ele o nome do meu Deus...',
    themeColor: 'purple',
    badgeSymbol: '👑',
    gradientClass: 'from-purple-500 via-fuchsia-400 to-amber-300',
    innerBorderClass: 'border-purple-400 ring-2 ring-fuchsia-400/70',
    cornerAccentClass: 'border-amber-300',
    auraGlow: 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, rgba(217, 70, 239, 0.35) 50%, rgba(245, 158, 11, 0.2) 75%, transparent 95%)',
    ringAnimation: 'animate-frame-rotate-fast',
    accentTitle: 'Marco Supremo dos 5.000 Pontos',
    description: 'Gradiente animado de ametista imperial e ouro incorruptível com rotação veloz e coroa cintilante, concedido aos generais de adoração.',
  },
];

export const AVAILABLE_AVATAR_ICONS = [
  { symbol: '🕊️', name: 'Pomba da Graça', ref: 'Lucas 3:22' },
  { symbol: '🎺', name: 'Shofar da Vitória', ref: 'Salmos 98:6' },
  { symbol: '👑', name: 'Coroa da Vida', ref: 'Tiago 1:12' },
  { symbol: '🛡️', name: 'Escudo da Fé', ref: 'Efésios 6:16' },
  { symbol: '📜', name: 'Rolo da Palavra', ref: 'Apocalipse 10:9' },
  { symbol: '✝️', name: 'Cruz da Redenção', ref: 'Colossenses 2:14' },
  { symbol: '🌟', name: 'Estrela da Alva', ref: 'Apocalipse 22:16' },
  { symbol: '🔥', name: 'Fogo do Altar', ref: 'Levítico 6:13' },
  { symbol: '🌊', name: 'Águas Vivas', ref: 'João 7:38' },
  { symbol: '💎', name: 'Pedra de Safira', ref: 'Êxodo 24:10' },
  { symbol: '⚓', name: 'Âncora da Alma', ref: 'Hebreus 6:19' },
  { symbol: '🪔', name: 'Lâmpada Acesa', ref: 'Salmos 119:105' },
];

export function getAvatarFramesWithStatus(stats: PlayerStats) {
  const currentScore = calculateWorshipScore(stats);
  const equippedId = stats.equippedAvatarFrameId || getHighestUnlockedFrameId(currentScore);

  return AVATAR_FRAMES.map((frame) => {
    const isUnlocked = currentScore >= frame.minScore;
    const isEquipped = frame.id === equippedId;
    const progressPercent = isUnlocked
      ? 100
      : Math.min(100, Math.max(0, Math.round((currentScore / frame.minScore) * 100)));
    const pointsNeeded = Math.max(0, frame.minScore - currentScore);

    return {
      ...frame,
      isUnlocked,
      isEquipped,
      progressPercent,
      pointsNeeded,
      currentScore,
    };
  });
}

export function getHighestUnlockedFrame(worshipScore: number): AvatarFrameDefinition {
  const unlocked = AVATAR_FRAMES.filter((f) => worshipScore >= f.minScore);
  return unlocked[unlocked.length - 1] || AVATAR_FRAMES[0];
}

export function getHighestUnlockedFrameId(worshipScore: number): string {
  return getHighestUnlockedFrame(worshipScore).id;
}

export function getEquippedFrame(stats: PlayerStats): AvatarFrameDefinition {
  const currentScore = calculateWorshipScore(stats);
  if (stats.equippedAvatarFrameId) {
    const found = AVATAR_FRAMES.find((f) => f.id === stats.equippedAvatarFrameId);
    if (found && currentScore >= found.minScore) {
      return found;
    }
  }
  return getHighestUnlockedFrame(currentScore);
}

export function getNextFrameUnlock(worshipScore: number): {
  nextFrame: AvatarFrameDefinition | null;
  pointsToUnlock: number;
  progressPercent: number;
} {
  const next = AVATAR_FRAMES.find((f) => f.minScore > worshipScore);
  if (!next) {
    return {
      nextFrame: null,
      pointsToUnlock: 0,
      progressPercent: 100,
    };
  }

  const prevMin = AVATAR_FRAMES.reduce((acc, f) => (f.minScore <= worshipScore && f.minScore > acc ? f.minScore : acc), 0);
  const progressPercent = Math.min(100, Math.max(0, Math.round(((worshipScore - prevMin) / (next.minScore - prevMin)) * 100)));

  return {
    nextFrame: next,
    pointsToUnlock: next.minScore - worshipScore,
    progressPercent,
  };
}
