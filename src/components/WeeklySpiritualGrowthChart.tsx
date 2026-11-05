/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Flame,
  Heart,
  Sparkles,
  Calendar,
  CheckCircle2,
  Award,
  Filter,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { PlayerStats, MinistryDayActivity } from '../types/game';
import { soundService } from '../services/soundEffects';

interface WeeklySpiritualGrowthChartProps {
  stats: PlayerStats;
  className?: string;
}

type FilterViewMode = 'todos' | 'oracoes' | 'decretos';

const DEFAULT_WEEKLY_DATA: MinistryDayActivity[] = [
  { day: 'Seg', oracoes: 4, decretos: 5, jugosQuebrados: 2 },
  { day: 'Ter', oracoes: 6, decretos: 7, jugosQuebrados: 4 },
  { day: 'Qua', oracoes: 5, decretos: 6, jugosQuebrados: 3 },
  { day: 'Qui', oracoes: 8, decretos: 9, jugosQuebrados: 6 },
  { day: 'Sex', oracoes: 7, decretos: 8, jugosQuebrados: 5 },
  { day: 'Sáb', oracoes: 9, decretos: 11, jugosQuebrados: 7 },
  { day: 'Hoje', oracoes: 6, decretos: 8, jugosQuebrados: 5 },
];

export const WeeklySpiritualGrowthChart: React.FC<WeeklySpiritualGrowthChartProps> = ({
  stats,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<FilterViewMode>('todos');

  // Chart data sourced from playerStats or fallback
  const rawData: MinistryDayActivity[] =
    stats.dailyProgress && stats.dailyProgress.length > 0
      ? stats.dailyProgress
      : DEFAULT_WEEKLY_DATA;

  // Enrich with totals for calculation
  const chartData = rawData.map((d) => ({
    ...d,
    total: d.oracoes + d.decretos,
  }));

  // Weekly aggregates
  const totalOracoes = chartData.reduce((acc, curr) => acc + curr.oracoes, 0);
  const totalDecretos = chartData.reduce((acc, curr) => acc + curr.decretos, 0);
  const totalActs = totalOracoes + totalDecretos;
  const avgDaily = Math.round((totalActs / chartData.length) * 10) / 10;

  // Peak day of devotion
  const peakDay = [...chartData].sort((a, b) => b.total - a.total)[0] || chartData[0];

  const handleFilterClick = (mode: FilterViewMode) => {
    soundService.playScriptureTone();
    setViewMode(mode);
  };

  // Custom Biblical Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dayData = payload[0].payload as MinistryDayActivity & { total: number };
      return (
        <div className="bg-slate-950/95 border border-amber-500/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 z-50 min-w-44">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-cinzel font-bold text-amber-300 text-sm">
              Dia: {label === 'Hoje' ? 'Hoje (Consagração)' : label}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {dayData.total} atos
            </span>
          </div>

          <div className="space-y-1 font-sans">
            {(viewMode === 'todos' || viewMode === 'oracoes') && (
              <div className="flex items-center justify-between text-sky-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                  <span>Orações:</span>
                </span>
                <strong className="font-mono">{dayData.oracoes}</strong>
              </div>
            )}

            {(viewMode === 'todos' || viewMode === 'decretos') && (
              <div className="flex items-center justify-between text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span>Decretos:</span>
                </span>
                <strong className="font-mono">{dayData.decretos}</strong>
              </div>
            )}

            <div className="flex items-center justify-between text-emerald-400 pt-1 border-t border-slate-800/80 text-[11px]">
              <span>Jugos Rompidos:</span>
              <strong className="font-mono">{dayData.jugosQuebrados}</strong>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/60 leading-tight">
            "Perseverai em oração, vigiando nela com ações de graças."
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950 border border-amber-500/20 p-5 md:p-6 shadow-xl space-y-5 ${className}`}
    >
      {/* 1. Header with Title & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-cinzel text-base md:text-lg font-bold text-amber-200 tracking-wide flex items-center gap-2">
                <span>Crescimento Espiritual Semanal</span>
                <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                  7 Dias
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Frequência de orações e decretos apostólicos ministrados perante o altar
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => handleFilterClick('todos')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'todos'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas as Práticas
          </button>
          <button
            type="button"
            onClick={() => handleFilterClick('oracoes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
              viewMode === 'oracoes'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Orações</span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterClick('decretos')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
              viewMode === 'decretos'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Decretos</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Highlight Metrics (3 Pillars of Devotion) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Orações na Semana</span>
            <Heart className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl md:text-2xl font-cinzel font-bold text-sky-300 tabular-nums">
            {totalOracoes}
          </div>
          <p className="text-[10px] text-slate-500">Súplicas e intercessões</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Decretos Proclamados</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-cinzel font-bold text-amber-300 tabular-nums">
            {totalDecretos}
          </div>
          <p className="text-[10px] text-slate-500">Autoridade da Palavra</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total de Atos de Fé</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-cinzel font-bold text-emerald-300 tabular-nums">
            {totalActs}
          </div>
          <p className="text-[10px] text-slate-500">Média de {avgDaily} / dia</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ápice Espiritual</span>
            <Award className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-xl md:text-2xl font-cinzel font-bold text-amber-200">
            {peakDay.day}
          </div>
          <p className="text-[10px] text-slate-500">
            {peakDay.total} ministrações santas
          </p>
        </div>
      </div>

      {/* 3. Recharts BarChart Interactive Canvas */}
      <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 pt-6">
        <div className="w-full h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.35}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                formatter={(value: string) => (
                  <span className="text-slate-300 font-medium">{value}</span>
                )}
              />

              {(viewMode === 'todos' || viewMode === 'oracoes') && (
                <Bar
                  dataKey="oracoes"
                  name="Orações"
                  fill="#38bdf8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              )}

              {(viewMode === 'todos' || viewMode === 'decretos') && (
                <Bar
                  dataKey="decretos"
                  name="Decretos"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Biblical Growth Encouragement Footer */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Colossenses 4:2:</strong> "Perseverai em oração, vigiando nela com ações de graças."
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[11px] border border-amber-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Constância Ativa no Reino
          </span>
        </div>
      </div>
    </div>
  );
};
