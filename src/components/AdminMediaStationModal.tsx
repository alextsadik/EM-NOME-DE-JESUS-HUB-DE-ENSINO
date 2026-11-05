/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Radio,
  Clock,
  Calendar,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Download,
  Upload,
  Tv,
  Headphones,
  Music,
  ArrowUp,
  ArrowDown,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  Target
} from 'lucide-react';
import {
  PraiseTrack24h,
  RadioMaintenanceConfig,
  CatalogStreamItem,
  ShiftPeriod,
  PraiseGenre,
  CatalogMediaType,
  DailySpiritualGoalsConfig,
  PlayerStats
} from '../types/game';
import {
  INITIAL_24H_PLAYLIST,
  DEFAULT_MAINTENANCE_CONFIG,
  INITIAL_STREAMS_CATALOG,
  DEFAULT_DAILY_GOALS_CONFIG
} from '../data/biblicalContent';
import { AdminDailyGoalsConfig } from './AdminDailyGoalsConfig';
import { soundService } from '../services/soundEffects';

interface AdminMediaStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist24h: PraiseTrack24h[];
  maintenanceConfig: RadioMaintenanceConfig;
  streamCatalog: CatalogStreamItem[];
  dailyGoalsConfig?: DailySpiritualGoalsConfig;
  onSavePlaylist: (tracks: PraiseTrack24h[]) => void;
  onSaveMaintenance: (config: RadioMaintenanceConfig) => void;
  onSaveCatalog: (catalog: CatalogStreamItem[]) => void;
  onSaveDailyGoals?: (config: DailySpiritualGoalsConfig) => void;
  onPlayTrackNow?: (track: PraiseTrack24h) => void;
  playerStats?: PlayerStats;
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export const AdminMediaStationModal: React.FC<AdminMediaStationModalProps> = ({
  isOpen,
  onClose,
  playlist24h,
  maintenanceConfig,
  streamCatalog,
  dailyGoalsConfig,
  onSavePlaylist,
  onSaveMaintenance,
  onSaveCatalog,
  onSaveDailyGoals,
  onPlayTrackNow,
  playerStats,
}) => {
  const [activeTab, setActiveTab] = useState<'playlist' | 'manutencao' | 'catalogo' | 'metas' | 'backup'>('playlist');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Local state copies
  const [tracks, setTracks] = useState<PraiseTrack24h[]>(playlist24h);
  const [maintenance, setMaintenance] = useState<RadioMaintenanceConfig>(maintenanceConfig);
  const [catalog, setCatalog] = useState<CatalogStreamItem[]>(streamCatalog);

  // Success message toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Track Form Modal / Drawer State
  const [isEditingTrack, setIsEditingTrack] = useState<boolean>(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackArtist, setTrackArtist] = useState<string>('');
  const [trackUrl, setTrackUrl] = useState<string>('');
  const [trackDuration, setTrackDuration] = useState<number>(240);
  const [trackShift, setTrackShift] = useState<ShiftPeriod>('todos');
  const [trackGenre, setTrackGenre] = useState<PraiseGenre>('adoracao');
  const [trackScripture, setTrackScripture] = useState<string>('');
  const [trackNote, setTrackNote] = useState<string>('');
  const [filterShift, setFilterShift] = useState<ShiftPeriod>('todos');

  // Preview Audio state
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // Catalog Form State
  const [isEditingCatalog, setIsEditingCatalog] = useState<boolean>(false);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [catTitle, setCatTitle] = useState<string>('');
  const [catAuthor, setCatAuthor] = useState<string>('');
  const [catType, setCatType] = useState<CatalogMediaType>('music_stream');
  const [catUrl, setCatUrl] = useState<string>('');
  const [catTag, setCatTag] = useState<string>('louvor_24h');
  const [catDescription, setCatDescription] = useState<string>('');
  const [catFrequency, setCatFrequency] = useState<string>('24 Horas Contínuo');
  const [catStatus, setCatStatus] = useState<'online' | 'ativo' | 'destaque'>('online');
  const [filterCatalogType, setFilterCatalogType] = useState<string>('todos');

  // Sync with props
  useEffect(() => {
    setTracks(playlist24h);
  }, [playlist24h]);

  useEffect(() => {
    setMaintenance(maintenanceConfig);
  }, [maintenanceConfig]);

  useEffect(() => {
    setCatalog(streamCatalog);
  }, [streamCatalog]);

  // Clean preview audio on unmount or close
  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [previewAudio]);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    soundService.playDecreeClick();
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  if (!isOpen) return null;

  // PIN validation
  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '777' || pinInput.trim() === '1234' || pinInput.trim() === '') {
      setIsUnlocked(true);
      setPinError('');
      soundService.playYokeBrokenSound();
    } else {
      setPinError('Código incorreto. Tente "777" ou clique em Desbloquear Acesso Livre.');
    }
  };

  // Convert YouTube link to embed link
  const normalizeEmbedUrl = (rawUrl: string): string => {
    try {
      const url = new URL(rawUrl);
      if (url.hostname.includes('youtube.com')) {
        const v = url.searchParams.get('v');
        if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      } else if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.slice(1);
        if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  // Track CRUD
  const handleOpenAddTrack = () => {
    setEditingTrackId(null);
    setTrackTitle('');
    setTrackArtist('');
    setTrackUrl('https://stream.zeno.fm/f3wvbbqmdg8uv');
    setTrackDuration(240);
    setTrackShift('todos');
    setTrackGenre('adoracao');
    setTrackScripture('Salmos 150:6');
    setTrackNote('Louvor dedicado à consagração contínua e edificação da alma.');
    setIsEditingTrack(true);
  };

  const handleOpenEditTrack = (t: PraiseTrack24h) => {
    setEditingTrackId(t.id);
    setTrackTitle(t.title);
    setTrackArtist(t.artistOrMinister);
    setTrackUrl(t.audioUrl);
    setTrackDuration(t.durationSeconds);
    setTrackShift(t.shiftPeriod);
    setTrackGenre(t.genre);
    setTrackScripture(t.scriptureReference || '');
    setTrackNote(t.thematicNote || '');
    setIsEditingTrack(true);
  };

  const handleSaveTrackForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim()) return;

    if (editingTrackId) {
      const updated = tracks.map((t) =>
        t.id === editingTrackId
          ? {
              ...t,
              title: trackTitle.trim(),
              artistOrMinister: trackArtist.trim() || 'Ministério de Louvor',
              audioUrl: trackUrl.trim(),
              durationSeconds: Number(trackDuration) || 240,
              shiftPeriod: trackShift,
              genre: trackGenre,
              scriptureReference: trackScripture.trim(),
              thematicNote: trackNote.trim(),
            }
          : t
      );
      setTracks(updated);
      onSavePlaylist(updated);
      showNotification('Louvor atualizado na Rádio 24h!');
    } else {
      const newTrack: PraiseTrack24h = {
        id: `track-${Date.now()}`,
        title: trackTitle.trim(),
        artistOrMinister: trackArtist.trim() || 'Ministério de Louvor',
        audioUrl: trackUrl.trim() || 'https://stream.zeno.fm/f3wvbbqmdg8uv',
        durationSeconds: Number(trackDuration) || 240,
        shiftPeriod: trackShift,
        genre: trackGenre,
        isActive: true,
        order: tracks.length + 1,
        scriptureReference: trackScripture.trim(),
        thematicNote: trackNote.trim(),
        addedAt: Date.now(),
      };
      const updated = [...tracks, newTrack];
      setTracks(updated);
      onSavePlaylist(updated);
      showNotification('Novo louvor acrescentado à programação contínua 24h!');
    }
    setIsEditingTrack(false);
  };

  const handleDeleteTrack = (id: string) => {
    const updated = tracks.filter((t) => t.id !== id);
    setTracks(updated);
    onSavePlaylist(updated);
    showNotification('Louvor removido da rotação 24h.');
  };

  const handleToggleTrackActive = (id: string) => {
    const updated = tracks.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t));
    setTracks(updated);
    onSavePlaylist(updated);
  };

  const handleMoveTrack = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === tracks.length - 1)) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newTracks = [...tracks];
    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIdx];
    newTracks[targetIdx] = temp;
    // recalculate orders
    const reordered = newTracks.map((t, idx) => ({ ...t, order: idx + 1 }));
    setTracks(reordered);
    onSavePlaylist(reordered);
  };

  const handleTogglePreview = (t: PraiseTrack24h) => {
    if (previewTrackId === t.id && previewAudio) {
      previewAudio.pause();
      setPreviewTrackId(null);
      setPreviewAudio(null);
    } else {
      if (previewAudio) {
        previewAudio.pause();
      }
      const audio = new Audio(t.audioUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // audio might be blocked or stream
      });
      setPreviewAudio(audio);
      setPreviewTrackId(t.id);
      audio.onended = () => {
        setPreviewTrackId(null);
        setPreviewAudio(null);
      };
    }
  };

  // Maintenance Config Handlers
  const handleSaveMaintenanceConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMaintenance(maintenance);
    showNotification('Configuração e alertas de manutenção salvos com sucesso!');
  };

  // Catalog CRUD
  const handleOpenAddCatalog = () => {
    setEditingCatalogId(null);
    setCatTitle('');
    setCatAuthor('');
    setCatType('music_stream');
    setCatUrl('https://listen.radionomy.com/worshipradio');
    setCatTag('louvor_24h');
    setCatDescription('');
    setCatFrequency('24 Horas Contínuo');
    setCatStatus('online');
    setIsEditingCatalog(true);
  };

  const handleOpenEditCatalog = (item: CatalogStreamItem) => {
    setEditingCatalogId(item.id);
    setCatTitle(item.title);
    setCatAuthor(item.authorOrMinistry);
    setCatType(item.mediaType);
    setCatUrl(item.streamUrl);
    setCatTag(item.categoryTag);
    setCatDescription(item.description);
    setCatFrequency(item.frequencyOrSchedule);
    setCatStatus(item.status);
    setIsEditingCatalog(true);
  };

  const handleSaveCatalogForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catTitle.trim() || !catUrl.trim()) return;

    const embedUrl = normalizeEmbedUrl(catUrl.trim());

    if (editingCatalogId) {
      const updated = catalog.map((item) =>
        item.id === editingCatalogId
          ? {
              ...item,
              title: catTitle.trim(),
              authorOrMinistry: catAuthor.trim() || 'Ministério Cristão',
              mediaType: catType,
              streamUrl: catUrl.trim(),
              embedUrl,
              categoryTag: catTag.trim() || 'geral',
              description: catDescription.trim(),
              frequencyOrSchedule: catFrequency.trim() || 'Contínuo',
              status: catStatus,
            }
          : item
      );
      setCatalog(updated);
      onSaveCatalog(updated);
      showNotification('Item atualizado no catálogo de transmissões!');
    } else {
      const newItem: CatalogStreamItem = {
        id: `stream-cat-${Date.now()}`,
        title: catTitle.trim(),
        authorOrMinistry: catAuthor.trim() || 'Ministério Cristão',
        mediaType: catType,
        streamUrl: catUrl.trim(),
        embedUrl,
        categoryTag: catTag.trim() || 'geral',
        description: catDescription.trim() || 'Transmissão consagrada para edificação.',
        frequencyOrSchedule: catFrequency.trim() || 'Contínuo',
        status: catStatus,
        isCustomAdded: true,
        addedAt: Date.now(),
      };
      const updated = [newItem, ...catalog];
      setCatalog(updated);
      onSaveCatalog(updated);
      showNotification('Novo stream adicionado ao catálogo oficial!');
    }
    setIsEditingCatalog(false);
  };

  const handleDeleteCatalog = (id: string) => {
    const updated = catalog.filter((c) => c.id !== id);
    setCatalog(updated);
    onSaveCatalog(updated);
    showNotification('Item removido do catálogo.');
  };

  // Backup & Restore
  const handleExportJson = () => {
    const data = {
      playlist24h: tracks,
      maintenanceConfig: maintenance,
      streamCatalog: catalog,
      dailyGoalsConfig: dailyGoalsConfig,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radio-24h-configuracao-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Configuração exportada com sucesso em formato JSON!');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.playlist24h && Array.isArray(parsed.playlist24h)) {
          setTracks(parsed.playlist24h);
          onSavePlaylist(parsed.playlist24h);
        }
        if (parsed.maintenanceConfig) {
          setMaintenance(parsed.maintenanceConfig);
          onSaveMaintenance(parsed.maintenanceConfig);
        }
        if (parsed.streamCatalog && Array.isArray(parsed.streamCatalog)) {
          setCatalog(parsed.streamCatalog);
          onSaveCatalog(parsed.streamCatalog);
        }
        if (parsed.dailyGoalsConfig && onSaveDailyGoals) {
          onSaveDailyGoals(parsed.dailyGoalsConfig);
        }
        showNotification('Dados importados e aplicados com sucesso!');
      } catch {
        alert('Erro ao processar arquivo JSON. Verifique se o formato é válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Tem certeza que deseja restaurar a lista de louvores 24h, regras de manutenção e catálogo para os padrões bíblicos originais?')) {
      setTracks(INITIAL_24H_PLAYLIST);
      onSavePlaylist(INITIAL_24H_PLAYLIST);
      setMaintenance(DEFAULT_MAINTENANCE_CONFIG);
      onSaveMaintenance(DEFAULT_MAINTENANCE_CONFIG);
      setCatalog(INITIAL_STREAMS_CATALOG);
      onSaveCatalog(INITIAL_STREAMS_CATALOG);
      showNotification('Configurações e catálogo restaurados para o padrão original!');
    }
  };

  // Calculated Stats
  const activeTracksCount = tracks.filter((t) => t.isActive).length;
  const totalSeconds = tracks
    .filter((t) => t.isActive)
    .reduce((sum, t) => sum + (t.durationSeconds || 240), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Filtered tracks
  const filteredTracks = filterShift === 'todos' 
    ? tracks 
    : tracks.filter((t) => t.shiftPeriod === filterShift || t.shiftPeriod === 'todos');

  // Filtered Catalog
  const filteredCatalog = filterCatalogType === 'todos'
    ? catalog
    : catalog.filter((c) => c.mediaType === filterCatalogType);

  // Check current maintenance active state for live status
  const currentDay = new Date().getDay();
  const currentHours = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const currentTimeVal = currentHours * 60 + currentMinutes;

  const [startH, startM] = maintenance.startHour.split(':').map(Number);
  const [endH, endM] = maintenance.endHour.split(':').map(Number);
  const startTimeVal = (startH || 0) * 60 + (startM || 0);
  const endTimeVal = (endH || 0) * 60 + (endM || 0);

  const isInScheduledMaintenance =
    currentDay === maintenance.maintenanceDayOfWeek &&
    currentTimeVal >= startTimeVal &&
    currentTimeVal <= endTimeVal;

  const isMaintenanceCurrentlyActive = maintenance.isManualMaintenance || isInScheduledMaintenance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold font-cinzel text-amber-300">
                  Painel de Administração da Rádio & Streams
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  24/7 BROADCAST
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestão da rotação contínua de louvores, agendamento de manutenção com alertas e catálogo geral de transmissões.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fechar painel administrativo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-300 text-xs px-4 py-2 flex items-center gap-2 justify-center font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* PIN Authentication Gate */}
        {!isUnlocked ? (
          <div className="p-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Acesso Administrativo Restrito</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Para acrescentar louvores à Rádio 24h, agendar períodos de manutenção ou atualizar o catálogo de transmissões, confirme seu acesso ministerial.
            </p>

            <form onSubmit={handleUnlockPin} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                placeholder="Código de Acesso (padrão: 777)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-center tracking-widest text-lg focus:border-amber-400 outline-none"
              />
              {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
              >
                Entrar no Painel
              </button>
              <button
                type="button"
                onClick={() => setIsUnlocked(true)}
                className="w-full py-2 text-xs text-slate-400 hover:text-amber-300 transition-colors"
              >
                Acesso Direto Liberado (Sem Senha)
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="px-5 pt-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-2 text-xs md:text-sm font-semibold">
              <button
                onClick={() => setActiveTab('playlist')}
                className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === 'playlist'
                    ? 'border-amber-400 text-amber-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Programação 24 Horas ({tracks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('manutencao')}
                className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === 'manutencao'
                    ? 'border-amber-400 text-amber-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Dia de Manutenção & Alertas</span>
                {isMaintenanceCurrentlyActive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('catalogo')}
                className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === 'catalogo'
                    ? 'border-amber-400 text-amber-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Catálogo de Streams ({catalog.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('metas')}
                className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === 'metas'
                    ? 'border-amber-400 text-amber-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Target className="w-4 h-4 text-amber-400" />
                <span>Metas Diárias do Jogador</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === 'backup'
                    ? 'border-amber-400 text-amber-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Backup & Exportação</span>
              </button>
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* ======================================================== */}
              {/* TAB 1: 24H PRAISE PLAYLIST MANAGER                       */}
              {/* ======================================================== */}
              {activeTab === 'playlist' && (
                <div className="space-y-5">
                  {/* Summary Metric Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Louvores Ativos</span>
                      <span className="text-xl font-bold text-amber-300">{activeTracksCount} / {tracks.length}</span>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Ciclo Contínuo</span>
                      <span className="text-xl font-bold text-slate-200">~{totalHours} horas</span>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Fluxo de Transmissão</span>
                      <span className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        24 Horas
                      </span>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                      <span className="text-[11px] text-slate-400 block font-medium">Dia de Manutenção</span>
                      <span className="text-sm font-bold text-amber-400">
                        {DAYS_OF_WEEK[maintenance.maintenanceDayOfWeek]}s ({maintenance.startHour}h)
                      </span>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Filtrar por Turno:</span>
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                        {(['todos', 'madrugada', 'manha', 'tarde', 'noite'] as ShiftPeriod[]).map((sp) => (
                          <button
                            key={sp}
                            onClick={() => setFilterShift(sp)}
                            className={`px-2.5 py-1 rounded capitalize transition-colors ${
                              filterShift === sp
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {sp}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleOpenAddTrack}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Acrescentar Louvor à Rádio</span>
                    </button>
                  </div>

                  {/* Track List */}
                  <div className="space-y-2.5">
                    {filteredTracks.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 text-slate-400">
                        Nenhum louvor cadastrado para este turno de transmissão. Clique no botão acima para adicionar!
                      </div>
                    ) : (
                      filteredTracks.map((track, idx) => {
                        const isCurrentPreview = previewTrackId === track.id;
                        return (
                          <div
                            key={track.id}
                            className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                              track.isActive
                                ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                                : 'bg-slate-950/30 border-slate-900 opacity-60'
                            }`}
                          >
                            {/* Track details */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className="text-xs font-mono font-bold text-slate-500 w-6 pt-1 text-center shrink-0">
                                #{idx + 1}
                              </span>

                              {/* Play preview button */}
                              <button
                                onClick={() => handleTogglePreview(track)}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isCurrentPreview
                                    ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse'
                                    : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700'
                                }`}
                                title={isCurrentPreview ? 'Pausar prévia' : 'Ouvir prévia do louvor'}
                              >
                                {isCurrentPreview ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h4 className="text-sm font-semibold text-slate-100 truncate">
                                    {track.title}
                                  </h4>
                                  <span className="px-2 py-0.5 text-[10px] rounded-md font-medium capitalize bg-slate-800 text-amber-300 border border-slate-700">
                                    Turno: {track.shiftPeriod}
                                  </span>
                                  <span className="px-2 py-0.5 text-[10px] rounded-md font-medium capitalize bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    {track.genre}
                                  </span>
                                  {track.scriptureReference && (
                                    <span className="text-[11px] text-slate-400 italic">
                                      ({track.scriptureReference})
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                                  <span>Ministério: {track.artistOrMinister}</span>
                                  <span>·</span>
                                  <span>Duração: {Math.floor(track.durationSeconds / 60)}m {track.durationSeconds % 60}s</span>
                                  {track.thematicNote && (
                                    <>
                                      <span>·</span>
                                      <span className="text-slate-500 truncate max-w-xs">{track.thematicNote}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                              {onPlayTrackNow && (
                                <button
                                  onClick={() => {
                                    onPlayTrackNow(track);
                                    showNotification(`Sintonizando "${track.title}" na estação!`);
                                  }}
                                  className="px-2.5 py-1 text-xs rounded bg-slate-900 hover:bg-amber-500/20 text-amber-400 border border-slate-700 hover:border-amber-500/30 transition-colors"
                                  title="Tocar este louvor agora no player principal"
                                >
                                  Tocar no Player
                                </button>
                              )}

                              {/* Reorder Buttons */}
                              <button
                                onClick={() => handleMoveTrack(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 text-slate-400 hover:text-slate-100 disabled:opacity-30 rounded hover:bg-slate-800"
                                title="Mover para cima"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveTrack(idx, 'down')}
                                disabled={idx === tracks.length - 1}
                                className="p-1.5 text-slate-400 hover:text-slate-100 disabled:opacity-30 rounded hover:bg-slate-800"
                                title="Mover para baixo"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Active */}
                              <button
                                onClick={() => handleToggleTrackActive(track.id)}
                                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                                  track.isActive
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                                title={track.isActive ? 'Desativar este louvor da rotação' : 'Ativar louvor'}
                              >
                                {track.isActive ? 'Ativo 24h' : 'Inativo'}
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEditTrack(track)}
                                className="p-1.5 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-800 transition-colors"
                                title="Editar detalhes do louvor"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteTrack(track.id)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40 transition-colors"
                                title="Excluir louvor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: MAINTENANCE DAY & ALERT WINDOW MANAGER            */}
              {/* ======================================================== */}
              {activeTab === 'manutencao' && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isMaintenanceCurrentlyActive
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isMaintenanceCurrentlyActive ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {isMaintenanceCurrentlyActive
                              ? 'RÁDIO EM PERÍODO DE MANUTENÇÃO ATIVO'
                              : 'Rádio Operando em Transmissão Contínua 24h'}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${
                            isMaintenanceCurrentlyActive ? 'bg-rose-500/30 text-rose-300' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {isMaintenanceCurrentlyActive ? 'Aviso Ativo no Player' : 'No Ar'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Próxima manutenção programada: toda <strong className="text-amber-300">{DAYS_OF_WEEK[maintenance.maintenanceDayOfWeek]}</strong>, das <strong className="text-amber-300">{maintenance.startHour} às {maintenance.endHour}</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Quick Manual Override Switch */}
                    <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <label className="text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-2">
                        <span>Forçar Manutenção Imediata:</span>
                        <input
                          type="checkbox"
                          checked={maintenance.isManualMaintenance}
                          onChange={(e) => {
                            const updated = { ...maintenance, isManualMaintenance: e.target.checked };
                            setMaintenance(updated);
                            onSaveMaintenance(updated);
                            showNotification(
                              e.target.checked
                                ? 'Modo de manutenção forçado ativado! Alerta exibido para ouvintes.'
                                : 'Modo de manutenção manual desativado. Rádio no ar!'
                            );
                          }}
                          className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Maintenance Configuration Form */}
                  <form onSubmit={handleSaveMaintenanceConfig} className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-5">
                    <h3 className="text-base font-bold text-amber-300 font-cinzel flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Programação do Dia de Manutenção da Rádio 24h
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Day of Week */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Dia da Semana Dedicado:
                        </label>
                        <select
                          value={maintenance.maintenanceDayOfWeek}
                          onChange={(e) => setMaintenance({ ...maintenance, maintenanceDayOfWeek: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-amber-400 outline-none"
                        >
                          {DAYS_OF_WEEK.map((dayName, idx) => (
                            <option key={idx} value={idx}>
                              {dayName}
                            </option>
                          ))}
                        </select>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Dia reservado para calibração de áudio e atualização da lista.
                        </span>
                      </div>

                      {/* Start Hour */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Horário de Início (HH:mm):
                        </label>
                        <input
                          type="time"
                          value={maintenance.startHour}
                          onChange={(e) => setMaintenance({ ...maintenance, startHour: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-amber-400 outline-none"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Início da suspensão temporária do fluxo contínuo.
                        </span>
                      </div>

                      {/* End Hour */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Horário de Término (HH:mm):
                        </label>
                        <input
                          type="time"
                          value={maintenance.endHour}
                          onChange={(e) => setMaintenance({ ...maintenance, endHour: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-amber-400 outline-none"
                        />
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Retorno automático da programação de louvores.
                        </span>
                      </div>
                    </div>

                    {/* Pre-alert minutes & Silence audio option */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Aviso Prévio aos Ouvintes (Minutos antes):
                        </label>
                        <select
                          value={maintenance.preAlertMinutes}
                          onChange={(e) => setMaintenance({ ...maintenance, preAlertMinutes: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-amber-400 outline-none"
                        >
                          <option value={15}>15 minutos antes</option>
                          <option value={30}>30 minutos antes (Recomendado)</option>
                          <option value={45}>45 minutos antes</option>
                          <option value={60}>1 hora antes</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer w-full">
                          <input
                            type="checkbox"
                            checked={maintenance.autoSilenceAudio}
                            onChange={(e) => setMaintenance({ ...maintenance, autoSilenceAudio: e.target.checked })}
                            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                          />
                          <div className="text-xs">
                            <span className="font-semibold text-slate-200 block">Pausar áudio automaticamente</span>
                            <span className="text-slate-400 text-[11px]">Durante a janela de manutenção técnica</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Custom Alert Message */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Mensagem de Alerta Personalizada (Exibida na Barra de Notificação e Player):
                      </label>
                      <textarea
                        rows={3}
                        value={maintenance.alertMessage}
                        onChange={(e) => setMaintenance({ ...maintenance, alertMessage: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-amber-400 outline-none resize-none"
                        placeholder="Ex: A Rádio Web 24h está em período de manutenção técnica preventiva..."
                      />
                    </div>

                    {/* Contact & Ministry Notice */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Linha de Assinatura do Ministério / Suporte:
                      </label>
                      <input
                        type="text"
                        value={maintenance.contactNotice}
                        onChange={(e) => setMaintenance({ ...maintenance, contactNotice: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:border-amber-400 outline-none"
                        placeholder="Equipe de Suporte & Transmissão · Em Nome de Jesus"
                      />
                    </div>

                    {/* Live Preview of Alert Card */}
                    <div className="pt-3 border-t border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 block mb-2">
                        Pré-visualização do Alerta para os Ouvintes:
                      </span>
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/40 text-amber-200 flex items-start gap-3 shadow-md">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-amber-300 font-bold uppercase tracking-wide">
                              Aviso de Manutenção Programada
                            </strong>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                              {DAYS_OF_WEEK[maintenance.maintenanceDayOfWeek]}s {maintenance.startHour} às {maintenance.endHour}
                            </span>
                          </div>
                          <p className="text-slate-200">{maintenance.alertMessage}</p>
                          <span className="text-[11px] text-amber-400/80 block italic">
                            — {maintenance.contactNotice}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-md transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Salvar Configuração e Ativar Alertas</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: STREAM CATALOG (MUSIC, VIDEOS, PODCASTS)          */}
              {/* ======================================================== */}
              {activeTab === 'catalogo' && (
                <div className="space-y-5">
                  {/* Filter & Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Categoria do Catálogo:</span>
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                        {[
                          { id: 'todos', label: 'Todos' },
                          { id: 'music_stream', label: 'Rádios & Músicas' },
                          { id: 'video', label: 'Vídeos & Pregações' },
                          { id: 'podcast', label: 'Podcasts' },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setFilterCatalogType(btn.id)}
                            className={`px-3 py-1 rounded transition-colors ${
                              filterCatalogType === btn.id
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleOpenAddCatalog}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Novo Stream / Mídia</span>
                    </button>
                  </div>

                  {/* Catalog Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCatalog.length === 0 ? (
                      <div className="col-span-2 p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 text-slate-400">
                        Nenhum item encontrado no catálogo com o filtro selecionado.
                      </div>
                    ) : (
                      filteredCatalog.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                item.mediaType === 'music_stream'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : item.mediaType === 'video'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}>
                                {item.mediaType === 'music_stream' ? 'Rádio / Música' : item.mediaType === 'video' ? 'Vídeo / Estudo' : 'Podcast'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  {item.frequencyOrSchedule}
                                </span>
                                {item.status === 'destaque' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                                    Destaque
                                  </span>
                                )}
                              </div>
                            </div>

                            <h4 className="text-sm font-semibold text-slate-100 mb-1 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-xs text-amber-400/90 font-medium mb-1.5">
                              {item.authorOrMinistry}
                            </p>
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          {/* Footer with URL & Actions */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                            <span className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]" title={item.streamUrl}>
                              {item.streamUrl}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={item.streamUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-800 transition-colors"
                                title="Abrir link original externamente"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleOpenEditCatalog(item)}
                                className="p-1.5 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-800 transition-colors"
                                title="Editar item do catálogo"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCatalog(item.id)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40 transition-colors"
                                title="Remover do catálogo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: BACKUP, EXPORT & RESTORE                          */}
              {/* ======================================================== */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-base font-bold text-amber-300 font-cinzel flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exportar Configuração e Listas
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Faça o download de toda a programação de louvores 24h, regras de agendamento de manutenção e catálogo de streams em um arquivo JSON para segurança e compartilhamento ministerial.
                    </p>
                    <button
                      onClick={handleExportJson}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar Arquivo JSON de Backup</span>
                    </button>
                  </div>

                  <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
                    <h3 className="text-base font-bold text-amber-300 font-cinzel flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Restaurar / Importar Backup
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Carregue um arquivo JSON gerado anteriormente para atualizar imediatamente os dados da rádio e streams.
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Selecionar Arquivo JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJson}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="bg-rose-950/30 p-5 rounded-xl border border-rose-500/30 space-y-3">
                    <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Redefinir para Padrões Bíblicos Originais
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Restaura todos os hinos da Harpa Cristã, agendamento de consagração e catálogo padrão da estação.
                    </p>
                    <button
                      onClick={handleResetDefaults}
                      className="px-4 py-2 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-500/40 text-xs font-semibold transition-colors"
                    >
                      Restaurar Padrão de Fábrica
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: METAS DIÁRIAS DO JOGADOR                          */}
              {/* ======================================================== */}
              {activeTab === 'metas' && (
                <AdminDailyGoalsConfig
                  currentConfig={dailyGoalsConfig || DEFAULT_DAILY_GOALS_CONFIG}
                  onSaveConfig={(newConfig) => {
                    if (onSaveDailyGoals) {
                      onSaveDailyGoals(newConfig);
                    }
                    showNotification('Metas diárias do jogador atualizadas com sucesso no Altar de Missões!');
                  }}
                  playerStats={playerStats}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Dados sincronizados localmente no navegador e ativos em tempo real na Rádio.</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
              >
                Concluir & Fechar
              </button>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* SUBMODAL: ADD / EDIT PRAISE TRACK FORM                   */}
        {/* ======================================================== */}
        {isEditingTrack && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-base text-amber-300 font-cinzel">
                  {editingTrackId ? 'Editar Louvor da Rádio 24h' : 'Acrescentar Novo Louvor à Rádio 24h'}
                </h3>
                <button
                  onClick={() => setIsEditingTrack(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTrackForm} className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Título do Cântico / Hino: *
                  </label>
                  <input
                    type="text"
                    required
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="Ex: Porque Ele Vive, Grandioso És Tu..."
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Ministério / Cantor(a):
                    </label>
                    <input
                      type="text"
                      value={trackArtist}
                      onChange={(e) => setTrackArtist(e.target.value)}
                      placeholder="Ex: Harpa Cristã, Coral..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Duração (Segundos):
                    </label>
                    <input
                      type="number"
                      min={30}
                      max={3600}
                      value={trackDuration}
                      onChange={(e) => setTrackDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Turno de Reprodução 24h:
                    </label>
                    <select
                      value={trackShift}
                      onChange={(e) => setTrackShift(e.target.value as ShiftPeriod)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    >
                      <option value="todos">Todos os Turnos (24h)</option>
                      <option value="madrugada">Madrugada (00h - 06h)</option>
                      <option value="manha">Manhã (06h - 12h)</option>
                      <option value="tarde">Tarde (12h - 18h)</option>
                      <option value="noite">Noite (18h - 00h)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Gênero Espiritual:
                    </label>
                    <select
                      value={trackGenre}
                      onChange={(e) => setTrackGenre(e.target.value as PraiseGenre)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    >
                      <option value="harpa">Harpa Cristã</option>
                      <option value="adoracao">Adoração Congregacional</option>
                      <option value="instrumental">Instrumental & Meditação</option>
                      <option value="jubilo">Júbilo & Vitória</option>
                      <option value="oracao">Oração & Intercessão</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    URL do Stream de Áudio / MP3: *
                  </label>
                  <input
                    type="url"
                    required
                    value={trackUrl}
                    onChange={(e) => setTrackUrl(e.target.value)}
                    placeholder="https://stream.exemplo.com/audio.mp3"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Caso a transmissão esteja offline, os tons acústicos celestiais são ativados como backup sem interrupção.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Referência Bíblica (Opcional):
                    </label>
                    <input
                      type="text"
                      value={trackScripture}
                      onChange={(e) => setTrackScripture(e.target.value)}
                      placeholder="Ex: Salmos 150:1-6"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Nota Temática:
                    </label>
                    <input
                      type="text"
                      value={trackNote}
                      onChange={(e) => setTrackNote(e.target.value)}
                      placeholder="Ex: Quebra de desalento..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingTrack(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-all active:scale-95"
                  >
                    Salvar Louvor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBMODAL: ADD / EDIT CATALOG ITEM FORM                   */}
        {/* ======================================================== */}
        {isEditingCatalog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-base text-amber-300 font-cinzel">
                  {editingCatalogId ? 'Editar Item do Catálogo' : 'Cadastrar Transmissão no Catálogo'}
                </h3>
                <button
                  onClick={() => setIsEditingCatalog(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCatalogForm} className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Título da Transmissão / Conteúdo: *
                  </label>
                  <input
                    type="text"
                    required
                    value={catTitle}
                    onChange={(e) => setCatTitle(e.target.value)}
                    placeholder="Ex: Rádio Web Harpa 24h, Exposição do Salmo 150..."
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Tipo de Mídia:
                    </label>
                    <select
                      value={catType}
                      onChange={(e) => setCatType(e.target.value as CatalogMediaType)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    >
                      <option value="music_stream">Rádio Web / Música 24h</option>
                      <option value="video">Vídeo / Pregação</option>
                      <option value="podcast">Podcast / Devocional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Ministério ou Autor:
                    </label>
                    <input
                      type="text"
                      value={catAuthor}
                      onChange={(e) => setCatAuthor(e.target.value)}
                      placeholder="Ex: Voz da Palavra..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Link do Stream ou Vídeo / Podcast: *
                  </label>
                  <input
                    type="url"
                    required
                    value={catUrl}
                    onChange={(e) => setCatUrl(e.target.value)}
                    placeholder="https://... (links do YouTube são convertidos para player automaticamente)"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Periodicidade / Horário:
                    </label>
                    <input
                      type="text"
                      value={catFrequency}
                      onChange={(e) => setCatFrequency(e.target.value)}
                      placeholder="Ex: 24 Horas Contínuo, Toda Terça 20h..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Destaque / Status:
                    </label>
                    <select
                      value={catStatus}
                      onChange={(e) => setCatStatus(e.target.value as 'online' | 'ativo' | 'destaque')}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none"
                    >
                      <option value="online">No Ar / Online</option>
                      <option value="destaque">Destaque Principal</option>
                      <option value="ativo">Ativo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Descrição Edificante:
                  </label>
                  <textarea
                    rows={2}
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    placeholder="Breve resumo da finalidade espiritual deste canal..."
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:border-amber-400 outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingCatalog(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition-all active:scale-95"
                  >
                    Salvar no Catálogo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
