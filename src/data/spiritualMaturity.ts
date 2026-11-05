/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MaturityTierId, SpiritualMaturityTier } from '../types/game';

export const SPIRITUAL_MATURITY_TIERS: SpiritualMaturityTier[] = [
  {
    id: 'vigia',
    levelNumber: 1,
    title: 'Vigia da Madrugada',
    spiritualEpithet: 'Aquele que Aguarda a Aurora da Graça',
    minScore: 0,
    maxScore: 499,
    scriptureRef: 'Salmos 130:6',
    scriptureText: 'A minha alma anseia pelo Senhor mais do que os guardas pelo romper da manhã; sim, mais do que os guardas pela manhã.',
    theologicalPrivilege: 'Discernimento dos tempos de oração e entrada reverente no Átrio Exterior.',
    badgeSymbol: '🌙',
    frameStyle: {
      borderClass: 'border-sky-400/40 ring-1 ring-sky-400/30',
      glowClass: 'shadow-sky-500/20 shadow-md',
      auraStyle: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.05) 70%, transparent 100%)',
      bannerGradient: 'from-sky-950/70 via-slate-900 to-slate-950',
      ribbonColor: 'text-sky-300 bg-sky-500/10 border-sky-400/30',
    },
    unlockedPrivileges: [
      'Moldura de Prata Celulóide no Perfil',
      'Acesso ao Diário de Oração & Lembretes Cl 3:17',
      'Selo de Vigia em todas as sessões de oração',
    ],
  },
  {
    id: 'cantor',
    levelNumber: 2,
    title: 'Cantor do Santuário',
    spiritualEpithet: 'Voz Consagrada de Júbilo e Ações de Graças',
    minScore: 500,
    maxScore: 1499,
    scriptureRef: 'Salmos 100:1-2',
    scriptureText: 'Celebrai com júbilo ao Senhor, todas as terras. Servi ao Senhor com alegria, apresentai-vos a ele com cânticos.',
    theologicalPrivilege: 'Quebra de atmosferas pesadas com cânticos de adoração e hinos de gratidão.',
    badgeSymbol: '🎵',
    frameStyle: {
      borderClass: 'border-emerald-400/50 ring-2 ring-emerald-400/30',
      glowClass: 'shadow-emerald-500/25 shadow-lg',
      auraStyle: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, rgba(16, 185, 129, 0.08) 70%, transparent 100%)',
      bannerGradient: 'from-emerald-950/70 via-slate-900 to-slate-950',
      ribbonColor: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
    },
    unlockedPrivileges: [
      'Moldura de Bronze Polido com Notas Musicais',
      'Desbloqueio de Cânticos Especiais na Rádio 24h',
      'Bônus passivo de +5% de Fruto da Alegria em desafios de louvor',
    ],
  },
  {
    id: 'levita',
    levelNumber: 3,
    title: 'Levita Fiel do Altar',
    spiritualEpithet: 'Separado para Ministrar Perante a Arca da Aliança',
    minScore: 1500,
    maxScore: 2999,
    scriptureRef: '1 Crônicas 16:4',
    scriptureText: 'E pôs diante da arca do Senhor alguns dos levitas para ministrem, e para recordarem, e louvarem ao Senhor Deus de Israel.',
    theologicalPrivilege: 'Autoridade para proclamar decretos apostólicos com peso sacerdotal e perseverança.',
    badgeSymbol: '🎺',
    frameStyle: {
      borderClass: 'border-amber-400/70 ring-2 ring-amber-400/50',
      glowClass: 'shadow-amber-500/35 shadow-xl',
      auraStyle: 'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.1) 70%, transparent 100%)',
      bannerGradient: 'from-amber-950/70 via-slate-900 to-slate-950',
      ribbonColor: 'text-amber-300 bg-amber-500/15 border-amber-400/40',
    },
    unlockedPrivileges: [
      'Moldura Dourada Clássica com Insígnia do Shofar',
      'Multiplicador de Graça Celestial x1.25 ativo',
      'Aura dourada sutil nos comentários e decretos',
    ],
  },
  {
    id: 'salmista',
    levelNumber: 4,
    title: 'Salmista da Graça',
    spiritualEpithet: 'Língua de Escritor Inspirado pelo Espírito Santo',
    minScore: 3000,
    maxScore: 4999,
    scriptureRef: 'Salmos 45:1',
    scriptureText: 'O meu coração ferve com palavras boas; falo do que fiz no tocante ao Rei. A minha língua é a pena de um destemido escritor.',
    theologicalPrivilege: 'Transbordamento profético e revelação da soberania de Cristo sobre potestades.',
    badgeSymbol: '📜',
    frameStyle: {
      borderClass: 'border-purple-400/80 ring-2 ring-purple-400/50',
      glowClass: 'shadow-purple-500/35 shadow-xl',
      auraStyle: 'radial-gradient(circle, rgba(192, 132, 252, 0.4) 0%, rgba(168, 85, 247, 0.12) 70%, transparent 100%)',
      bannerGradient: 'from-purple-950/70 via-slate-900 to-slate-950',
      ribbonColor: 'text-purple-300 bg-purple-500/15 border-purple-400/40',
    },
    unlockedPrivileges: [
      'Moldura Real de Ametista com Filigranas de Harpa',
      'Multiplicador de Fruto da Paz e Longanimidade',
      'Efeito visual de pergaminho sagrado ao proclamar decretos',
    ],
  },
  {
    id: 'coluna',
    levelNumber: 5,
    title: 'Coluna no Templo de Deus',
    spiritualEpithet: 'Sustentador Inabalável da Comunhão dos Santos',
    minScore: 5000,
    maxScore: 7999,
    scriptureRef: 'Apocalipse 3:12',
    scriptureText: 'A quem vencer, eu o farei coluna no templo do meu Deus, e dele nunca sairá; e escreverei sobre ele o nome do meu Deus.',
    theologicalPrivilege: 'Firmeza de fé inquebrantável e escudo protetor sobre intercessões familiares e ministeriais.',
    badgeSymbol: '🏛️',
    frameStyle: {
      borderClass: 'border-rose-400/80 ring-2 ring-rose-400/60',
      glowClass: 'shadow-rose-500/40 shadow-2xl',
      auraStyle: 'radial-gradient(circle, rgba(251, 113, 133, 0.45) 0%, rgba(244, 63, 94, 0.15) 70%, transparent 100%)',
      bannerGradient: 'from-rose-950/70 via-slate-900 to-slate-950',
      ribbonColor: 'text-rose-300 bg-rose-500/15 border-rose-400/40',
    },
    unlockedPrivileges: [
      'Moldura de Safira e Rubi das Colunas Celestiais',
      'Desbloqueio de Vigílias Avançadas de Maranata',
      'Aura pulsante de intercessão com partículas divinas',
    ],
  },
  {
    id: 'adorador_eterno',
    levelNumber: 6,
    title: 'Adorador em Espírito e em Verdade',
    spiritualEpithet: 'Vida Transformada em Contínuo Incenso Suave a Deus',
    minScore: 8000,
    maxScore: Infinity,
    scriptureRef: 'João 4:23-24',
    scriptureText: 'Mas a hora vem, e agora é, em que os verdadeiros adoradores adorarão o Pai em espírito e em verdade; porque o Pai procura a tais que assim o adorem.',
    theologicalPrivilege: 'Acesso pleno ao Lugar Santíssimo com ousadia pelo sangue de Jesus (Hb 10:19).',
    badgeSymbol: '👑',
    frameStyle: {
      borderClass: 'border-amber-300 ring-4 ring-yellow-400/70',
      glowClass: 'shadow-amber-400/60 shadow-2xl animate-pulse',
      auraStyle: 'radial-gradient(circle, rgba(253, 224, 71, 0.55) 0%, rgba(245, 158, 11, 0.25) 50%, transparent 100%)',
      bannerGradient: 'from-amber-900/80 via-yellow-950/60 to-slate-950',
      ribbonColor: 'text-yellow-200 bg-yellow-500/25 border-yellow-300/60 shadow-lg',
    },
    unlockedPrivileges: [
      'Coroa de Ouro Puro com Halo e Partículas Radiantes',
      'Título de Embaixador de Cristo em Espírito e Verdade',
      'Bênção contínua de Frutos do Espírito com resgate ampliado',
      'Insígnia Dourada Suprema visível em todos os ranks e cabeçalho',
    ],
  },
];

export function getSpiritualMaturity(score: number): SpiritualMaturityTier {
  for (let i = SPIRITUAL_MATURITY_TIERS.length - 1; i >= 0; i--) {
    if (score >= SPIRITUAL_MATURITY_TIERS[i].minScore) {
      return SPIRITUAL_MATURITY_TIERS[i];
    }
  }
  return SPIRITUAL_MATURITY_TIERS[0];
}

export function getNextMaturityTier(currentTierId: MaturityTierId): SpiritualMaturityTier | null {
  const currentIndex = SPIRITUAL_MATURITY_TIERS.findIndex((t) => t.id === currentTierId);
  if (currentIndex === -1 || currentIndex >= SPIRITUAL_MATURITY_TIERS.length - 1) {
    return null;
  }
  return SPIRITUAL_MATURITY_TIERS[currentIndex + 1];
}

export function getMaturityProgress(score: number): {
  currentTier: SpiritualMaturityTier;
  nextTier: SpiritualMaturityTier | null;
  progressPercent: number;
  pointsToNext: number;
} {
  const currentTier = getSpiritualMaturity(score);
  const nextTier = getNextMaturityTier(currentTier.id);

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      pointsToNext: 0,
    };
  }

  const range = nextTier.minScore - currentTier.minScore;
  const earned = Math.max(0, score - currentTier.minScore);
  const progressPercent = Math.min(100, Math.round((earned / range) * 100));
  const pointsToNext = Math.max(0, nextTier.minScore - score);

  return {
    currentTier,
    nextTier,
    progressPercent,
    pointsToNext,
  };
}
