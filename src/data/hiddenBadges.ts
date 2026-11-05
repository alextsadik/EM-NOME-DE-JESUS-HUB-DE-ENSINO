/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HiddenBadge, PlayerStats } from '../types/game';

export interface HiddenBadgeDefinition {
  id: string;
  title: string;
  secretHint: string;
  propheticRiddle: string;
  scriptureRef: string;
  scriptureText: string;
  revealedDescription: string;
  category: 'adoracao' | 'decretos' | 'vigilia' | 'intercessao' | 'missoes';
  iconName: 'sparkles' | 'flame' | 'shield' | 'moon' | 'music' | 'crown' | 'compass' | 'heart' | 'book';
  metricLabel: string;
  targetValue: number;
  evaluateCurrentValue: (stats: PlayerStats) => number;
  rewardFruit: keyof PlayerStats['fruits'];
  rewardFruitAmount: number;
  rewardGraceBonus: number;
}

export const HIDDEN_BADGES_DEFINITIONS: HiddenBadgeDefinition[] = [
  {
    id: 'badge-100-hours-worship',
    title: 'Sentinela das 100 Horas de Louvor',
    secretHint: 'Dica: Permaneça sintonizado nas correntes de águas vivas da Rádio até que o relógio celestial marque um século de minutos de adoração...',
    propheticRiddle: 'O profeta sussurra: "Aquele que habita no esconderijo do Altíssimo não conta as horas carnais, mas permanece no fluxo da adoração. Sintonize teu espírito nos mananciais incessantes de louvor até que o relógio celestial registre 100 horas (6.000 min) de permanência contínua perante o trono."',
    scriptureRef: 'Salmos 92:1-2',
    scriptureText: 'Bom é louvar ao Senhor, e cantar louvores ao teu nome, ó Altíssimo; para de manhã anunciar a tua benignidade, e todas as noites a tua fidelidade.',
    revealedDescription: 'Você acumulou 100 horas (ou 6.000 minutos) de permanência contínua na atmosfera de louvor e adoração da Rádio 24h!',
    category: 'adoracao',
    iconName: 'music',
    metricLabel: 'minutos na Rádio 24h',
    targetValue: 6000,
    evaluateCurrentValue: (stats: PlayerStats) => stats.radioListeningMinutes || 0,
    rewardFruit: 'paz',
    rewardFruitAmount: 100,
    rewardGraceBonus: 500,
  },
  {
    id: 'badge-10-decrees-single-day',
    title: 'Chuva de Decretos no Altar Diário',
    secretHint: 'Dica: Jó 22:28 fala sobre determinar algo para que a luz brilhe. Proclame uma dezena de decretos da Palavra em um só dia solar...',
    propheticRiddle: 'O profeta declara: "Determinando tu algum negócio, ser-te-á firme, e a luz brilhará em teus caminhos. Não deixes tua língua repousar em silêncio: ergue 10 decretos de autoridade apostólica antes que o sol de hoje decline."',
    scriptureRef: 'Jó 22:28',
    scriptureText: 'Determinando tu algum negócio, ser-te-á firme, e a luz brilhará em teus caminhos.',
    revealedDescription: 'Você proclamou 10 ou mais decretos de fé e autoridade apostólica no mesmo dia, estabelecendo a verdade de Deus na terra!',
    category: 'decretos',
    iconName: 'flame',
    metricLabel: 'decretos hoje',
    targetValue: 10,
    evaluateCurrentValue: (stats: PlayerStats) => {
      const todayDateStr = new Date().toISOString().slice(0, 10);
      if (stats.todaySpiritualStats && stats.todaySpiritualStats.date === todayDateStr) {
        return stats.todaySpiritualStats.decrees;
      }
      const todayProgress = stats.dailyProgress?.find((d) => d.day === 'Hoje')?.decretos;
      return todayProgress || Math.min(stats.proclaimedDecreesCount || 0, 10);
    },
    rewardFruit: 'alegria',
    rewardFruitAmount: 80,
    rewardGraceBonus: 400,
  },
  {
    id: 'badge-midnight-vigil',
    title: 'Vigília da Meia-Noite & Cadeias Quebradas',
    secretHint: 'Dica: Paulo e Silas estavam encarcerados na hora mais escura da noite quando entoaram cânticos que abalaram os alicerces...',
    propheticRiddle: 'O profeta avisa: "Perto da meia-noite, as portas de ferro se abrem onde a vigília persevera. Entra no santuário de oração e louvor nas vigílias da madrugada (entre 00:00 e 06:00) e vê os terremotos santos de libertação."',
    scriptureRef: 'Atos 16:25-26',
    scriptureText: 'E, perto da meia-noite, Paulo e Silas oravam e cantavam hinos a Deus, e os outros presos os escutavam. E de repente sobreveio um tão grande terremoto...',
    revealedDescription: 'Você adorou e manteve a vigília espiritual no turno da madrugada (entre 00:00 e 06:00), abrindo portas de libertação!',
    category: 'vigilia',
    iconName: 'moon',
    metricLabel: 'vigília da madrugada',
    targetValue: 1,
    evaluateCurrentValue: (stats: PlayerStats) => {
      const currentHour = new Date().getHours();
      const isMidnightShift = currentHour >= 0 && currentHour < 6;
      const alreadyLogged = stats.maranataProclaimedCount && stats.maranataProclaimedCount >= 3;
      return isMidnightShift || alreadyLogged ? 1 : 0;
    },
    rewardFruit: 'fidelidade',
    rewardFruitAmount: 70,
    rewardGraceBonus: 350,
  },
  {
    id: 'badge-davids-harp',
    title: 'Harpa de Davi & Salmos de Vitória',
    secretHint: 'Dica: Assim como o filho de Jessé dedilhava as cordas para afugentar espíritos aflitivos, responda a dez convocações de salmos...',
    propheticRiddle: 'O profeta entoa: "Quando o ungido toma a harpa e profetiza através dos salmos sagrados, todo espírito de aflição recua. Responde a 10 Desafios de Salmos e ativa os multiplicadores celestiais do Espírito."',
    scriptureRef: '1 Samuel 16:23',
    scriptureText: 'E sucedia que, quando o espírito mau da parte de Deus vinha sobre Saul, Davi tomava a harpa, e a tocava com a sua mão; então Saul achava alívio...',
    revealedDescription: 'Você completou 10 Desafios de Louvor baseados nos Salmos, ativando multiplicadores de júbilo e gratidão!',
    category: 'adoracao',
    iconName: 'sparkles',
    metricLabel: 'desafios de louvor',
    targetValue: 10,
    evaluateCurrentValue: (stats: PlayerStats) => stats.completedPraiseChallengesCount || 0,
    rewardFruit: 'alegria',
    rewardFruitAmount: 90,
    rewardGraceBonus: 450,
  },
  {
    id: 'badge-full-sanctuary',
    title: 'Santuário Pleno & Consagração Tripla',
    secretHint: 'Dica: A corda de três dobras não se rompe facilmente. Consagre o dia batendo as três metas do altar: oração, decretos e meditação...',
    propheticRiddle: 'O profeta ensina: "O cordão de três dobras não se rompe depressa. Aquele que no mesmo dia cumpre as três metas do altar — súplica sincera, leitura de decretos e silêncio contemplativo — estabelece um tabernáculo inabalável perante o Pai."',
    scriptureRef: 'Eclesiastes 4:12 & Colossenses 3:17',
    scriptureText: 'E, se alguém prevalecer contra um, os dois lhe resistirão; e o cordão de três dobras não se quebra tão depressa.',
    revealedDescription: 'Você atingiu 100% de todas as metas espirituais configuradas no dia, resgatando a recompensa celestial do Reino!',
    category: 'adoracao',
    iconName: 'crown',
    metricLabel: 'metas completadas',
    targetValue: 1,
    evaluateCurrentValue: (stats: PlayerStats) => {
      return stats.dailySpiritualGoalsClaimedDate ? 1 : 0;
    },
    rewardFruit: 'amor',
    rewardFruitAmount: 85,
    rewardGraceBonus: 420,
  },
  {
    id: 'badge-agape-intercessor',
    title: 'Intercessor Ágape das Nações',
    secretHint: 'Dica: O amor não busca seus próprios interesses. Inscreva sete súplicas fervorosas no Diário de Oração em favor do próximo...',
    propheticRiddle: 'O profeta clama: "Quem chora pelas dores do irmão e intercede pelas famílias enfermas receberá vestes de louvor. Inscreve pelo menos 7 clamores de intercessão no Diário de Oração em favor do próximo."',
    scriptureRef: '1 Timóteo 2:1-2',
    scriptureText: 'Admoesto-te, pois, antes de tudo, que se façam deprecações, orações, intercessões, e ações de graças, por todos os homens...',
    revealedDescription: 'Você cadastrou 7 ou mais pedidos de intercessão no Diário de Oração, clamando por famílias, enfermos e salvação de vidas!',
    category: 'intercessao',
    iconName: 'heart',
    metricLabel: 'intercessões no diário',
    targetValue: 7,
    evaluateCurrentValue: (stats: PlayerStats) => {
      const intercessions = stats.prayerEntries?.filter((p) => p.type === 'intercessao').length || 0;
      return intercessions;
    },
    rewardFruit: 'benignidade',
    rewardFruitAmount: 75,
    rewardGraceBonus: 380,
  },
  {
    id: 'badge-five-apostolic-chapters',
    title: 'Embaixador da Grande Reconciliação',
    secretHint: 'Dica: Conclua a jornada de todos os capítulos apostólicos sem jamais lutar contra carne e sangue, mas reconciliando almas...',
    propheticRiddle: 'O profeta proclama: "De sorte que somos embaixadores da parte de Cristo, confiando-nos a palavra da reconciliação. Não combatas a carne nem o sangue: percorra e conclua os 5 capítulos apostólicos das Missões para colher o fruto eterno."',
    scriptureRef: '2 Coríntios 5:20',
    scriptureText: 'De sorte que somos embaixadores de parte de Cristo, como se Deus por nós rogasse. Rogamo-vos, pois, da parte de Cristo, que vos reconcilieis com Deus.',
    revealedDescription: 'Você concluiu todos os 5 capítulos das Missões da Reconciliação, libertando almas pelo Evangelho da Graça!',
    category: 'missoes',
    iconName: 'compass',
    metricLabel: 'capítulos concluídos',
    targetValue: 5,
    evaluateCurrentValue: (stats: PlayerStats) => stats.completedMissions.length,
    rewardFruit: 'amor',
    rewardFruitAmount: 120,
    rewardGraceBonus: 600,
  },
  {
    id: 'badge-unshakeable-streak',
    title: 'Fogo Contínuo no Altar dos 7 Dias',
    secretHint: 'Dica: O fogo arderá continuamente sobre o altar; não se apagará. Mantenha uma sequência ininterrupta de comunhão por uma semana...',
    propheticRiddle: 'O profeta revela: "O fogo arderá continuamente sobre o altar; jamais se apagará. Coloca lenha na adoração dia após dia, sem quebrar o elo: sustenta uma sequência ininterrupta de 7 dias de comunhão constante."',
    scriptureRef: 'Levítico 6:13',
    scriptureText: 'O fogo arderá continuamente sobre o altar; não se apagará.',
    revealedDescription: 'Você sustentou uma sequência ininterrupta de 7 ou mais dias de oração e adoração constante ao Senhor Jesus!',
    category: 'vigilia',
    iconName: 'shield',
    metricLabel: 'dias de sequência',
    targetValue: 7,
    evaluateCurrentValue: (stats: PlayerStats) => stats.worshipStreakDays || 0,
    rewardFruit: 'dominioProprio',
    rewardFruitAmount: 90,
    rewardGraceBonus: 450,
  },
];

export function getHiddenBadgesProgress(stats: PlayerStats): HiddenBadge[] {
  return HIDDEN_BADGES_DEFINITIONS.map((def) => {
    const current = def.evaluateCurrentValue(stats);
    const isUnlocked = current >= def.targetValue || (stats.unlockedHiddenBadges?.includes(def.id) ?? false);

    return {
      id: def.id,
      title: def.title,
      secretHint: def.secretHint,
      propheticRiddle: def.propheticRiddle,
      scriptureRef: def.scriptureRef,
      scriptureText: def.scriptureText,
      revealedDescription: def.revealedDescription,
      category: def.category,
      iconName: def.iconName,
      metricLabel: def.metricLabel,
      targetValue: def.targetValue,
      currentValue: current,
      isUnlocked,
      rewardFruit: def.rewardFruit,
      rewardFruitAmount: def.rewardFruitAmount,
      rewardGraceBonus: def.rewardGraceBonus,
    };
  });
}
