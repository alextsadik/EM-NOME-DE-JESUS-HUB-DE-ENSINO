import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tv, 
  PlusCircle, 
  BookOpen, 
  Play, 
  Trash2, 
  Sparkles, 
  Volume2, 
  ExternalLink,
  Film,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { MediaItem } from '../types/game';
import { DEFAULT_MEDIA_ITEMS, WORSHIP_THEOLOGY_PRINCIPLES } from '../data/biblicalContent';
import { soundService } from '../services/soundEffects';

interface MediaChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MediaChamberModal: React.FC<MediaChamberModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'playlist' | 'custom' | 'theology'>('playlist');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // New media form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'louvor' | 'ensino' | 'salmos' | 'adoracao'>('salmos');
  const [newDescription, setNewDescription] = useState('');
  const [formMessage, setFormMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [speakingPrincipleId, setSpeakingPrincipleId] = useState<string | null>(null);

  // Load custom media items and streams catalog from localStorage
  useEffect(() => {
    if (!isOpen) return;

    try {
      const stored = localStorage.getItem('man_of_god_custom_media');
      const customItems: MediaItem[] = stored ? JSON.parse(stored) : [];

      // Also incorporate video and podcast entries from the unified stream catalog
      const streamCatalogRaw = localStorage.getItem('em_nome_de_jesus_stream_catalog');
      const streamCatalogItems = streamCatalogRaw ? JSON.parse(streamCatalogRaw) : [];
      const catalogAsMedia: MediaItem[] = streamCatalogItems
        .filter((sc: { mediaType: string }) => sc.mediaType === 'video' || sc.mediaType === 'podcast')
        .map((sc: {
          id: string;
          title: string;
          authorOrMinistry: string;
          mediaType: string;
          streamUrl: string;
          embedUrl?: string;
          description: string;
          categoryTag: string;
        }) => ({
          id: sc.id,
          title: sc.title,
          author: sc.authorOrMinistry,
          type: sc.mediaType === 'podcast' ? 'podcast' : 'youtube',
          url: sc.streamUrl,
          embedUrl: sc.embedUrl || parseEmbedUrl(sc.streamUrl),
          description: sc.description,
          category: (sc.categoryTag === 'louvor_24h' || sc.categoryTag === 'harpa' ? 'louvor' : sc.categoryTag === 'estudo_biblico' || sc.categoryTag === 'pregacao' ? 'ensino' : 'adoracao') as MediaItem['category'],
          isCustom: true,
        }));

      // Deduplicate by id
      const seen = new Set<string>();
      const combined: MediaItem[] = [];
      [...catalogAsMedia, ...customItems, ...DEFAULT_MEDIA_ITEMS].forEach((item) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      });

      setMediaList(combined);
      if (combined.length > 0 && !selectedMedia) {
        setSelectedMedia(combined[0]);
      }
    } catch {
      setMediaList(DEFAULT_MEDIA_ITEMS);
      if (!selectedMedia) {
        setSelectedMedia(DEFAULT_MEDIA_ITEMS[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Convert generic YouTube URL to embed URL
  const parseEmbedUrl = (rawUrl: string): string => {
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

  const handleAddCustomMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      setFormMessage({ text: 'Por favor, informe ao menos o título e o link do vídeo/podcast.', isError: true });
      return;
    }

    const embedUrl = parseEmbedUrl(newUrl.trim());
    const newItem: MediaItem = {
      id: `custom-media-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Usuário / Canal Adicionado',
      type: newUrl.includes('youtube') || newUrl.includes('youtu.be') ? 'youtube' : 'video',
      url: newUrl.trim(),
      embedUrl,
      description: newDescription.trim() || 'Mídia cristã adicionada para edificação espiritual.',
      category: newCategory,
      isCustom: true,
      addedAt: Date.now(),
    };

    try {
      const stored = localStorage.getItem('man_of_god_custom_media');
      const customItems: MediaItem[] = stored ? JSON.parse(stored) : [];
      const updatedCustom = [newItem, ...customItems];
      localStorage.setItem('man_of_god_custom_media', JSON.stringify(updatedCustom));

      const updatedAll = [newItem, ...mediaList];
      setMediaList(updatedAll);
      setSelectedMedia(newItem);
      setFormMessage({ text: 'Mídia adicionada com sucesso à sua galeria!', isError: false });

      // Reset form
      setNewTitle('');
      setNewAuthor('');
      setNewUrl('');
      setNewDescription('');
      soundService.playVictoryChime();

      setTimeout(() => {
        setFormMessage(null);
        setActiveTab('playlist');
      }, 1500);
    } catch {
      setFormMessage({ text: 'Erro ao salvar no armazenamento local.', isError: true });
    }
  };

  const handleDeleteCustomMedia = (id: string) => {
    try {
      const stored = localStorage.getItem('man_of_god_custom_media');
      const customItems: MediaItem[] = stored ? JSON.parse(stored) : [];
      const filtered = customItems.filter((item) => item.id !== id);
      localStorage.setItem('man_of_god_custom_media', JSON.stringify(filtered));

      const updatedAll = mediaList.filter((item) => item.id !== id);
      setMediaList(updatedAll);
      if (selectedMedia?.id === id) {
        setSelectedMedia(updatedAll[0] || null);
      }
      soundService.playDecreeClick();
    } catch {
      // ignore
    }
  };

  // Text-to-Speech for Theology of Worship
  const proclaimPrinciple = (principle: typeof WORSHIP_THEOLOGY_PRINCIPLES[0]) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      `${principle.title}. ${principle.principle} ${principle.insight}`
    );
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;

    setSpeakingPrincipleId(principle.id);
    utterance.onend = () => setSpeakingPrincipleId(null);
    utterance.onerror = () => setSpeakingPrincipleId(null);

    window.speechSynthesis.speak(utterance);
    soundService.playDecreeClick();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-chamber-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 id="media-chamber-title" className="text-lg font-bold text-slate-100">
                Central de Multimídia, Podcasts & Adoração
              </h2>
              <p className="text-xs text-slate-400">
                Edificação em áudio, vídeo e ensinos bíblicos sobre o privilégio de louvar ao Criador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar central de mídia"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('playlist')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'playlist'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Vídeos & Podcasts</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'custom'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Adicionar Link Próprio</span>
          </button>

          <button
            onClick={() => setActiveTab('theology')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'theology'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>O Privilégio de Adorar (Salmos)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: Playlist & Player */}
          {activeTab === 'playlist' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Player Display */}
              <div className="lg:col-span-2 space-y-4">
                {selectedMedia ? (
                  <div className="space-y-3">
                    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-800 shadow-lg relative">
                      {selectedMedia.type === 'youtube' ? (
                        <iframe
                          src={selectedMedia.embedUrl}
                          title={selectedMedia.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20">
                          <Radio className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
                          <h4 className="text-base font-semibold text-slate-100">{selectedMedia.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{selectedMedia.author}</p>
                          <a
                            href={selectedMedia.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors"
                          >
                            <span>Abrir Transmissão Original</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Commentary */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                          {selectedMedia.category}
                        </span>
                        {selectedMedia.isCustom && (
                          <span className="text-[11px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Adicionado por você
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-1">
                        {selectedMedia.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Por {selectedMedia.author}
                      </p>
                      <p className="text-xs text-slate-300 mt-3 leading-relaxed border-t border-slate-800/60 pt-2.5">
                        {selectedMedia.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-slate-950 rounded-xl flex items-center justify-center text-slate-500 text-sm">
                    Selecione um vídeo ou podcast na lista ao lado
                  </div>
                )}
              </div>

              {/* Sidebar Playlist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Galeria de Mídias ({mediaList.length})
                  </h4>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Novo link</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {mediaList.map((item) => {
                    const isSelected = selectedMedia?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedMedia(item)}
                        className={`group p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                            : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Play className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                            <span className="text-xs font-semibold line-clamp-1">
                              {item.title}
                            </span>
                          </div>
                          {item.isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomMedia(item.id);
                              }}
                              title="Remover vídeo personalizado"
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 pl-5">
                          {item.author} · {item.category}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Add Custom Video/Podcast Form */}
          {activeTab === 'custom' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Cadastrar Novo Vídeo ou Podcast</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adicione mensagens do YouTube, transmissões ao vivo ou podcasts que alimentam sua fé. Seus links ficam salvos com segurança no seu navegador.
                </p>
              </div>

              {formMessage && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  formMessage.isError 
                    ? 'bg-red-900/40 text-red-200 border border-red-500/30' 
                    : 'bg-emerald-900/40 text-emerald-200 border border-emerald-500/30'
                }`}>
                  {formMessage.isError ? <X className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{formMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleAddCustomMedia} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título da Mensagem / Estudo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Estudo Bíblico do Salmo 91 - Refúgio Inabalável"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Canal / Pregador / Autor
                    </label>
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="Ex: Pastor ou Ministério"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Categoria Temática
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="salmos">Salmos & Cânticos</option>
                      <option value="louvor">Louvor Congregacional</option>
                      <option value="adoracao">Adoração Profética</option>
                      <option value="ensino">Ensino & Batalha da Fé</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link do YouTube ou Áudio (URL) *
                  </label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="Ex: https://www.youtube.com/watch?v=k1Bnez3X78U"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dica: Suporta links normais do YouTube (youtube.com ou youtu.be). Eles são formatados automaticamente.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descrição / Ponto Teológico Chave
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Resuma por que esse vídeo edifica sua comunhão com Deus..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('playlist')}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Voltar à Galeria
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow transition-colors"
                  >
                    Salvar na Central de Mídia
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Theology of Worship & Creation Purpose */}
          {activeTab === 'theology' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>A Finalidade da Criação: "Tudo o que tem fôlego louve ao SENHOR"</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  O Privilégio Real de Adorar como Filhos e Criaturas
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Não fomos criados para o desespero nem para a derrota do pecado. Em Cristo, fomos reconciliados com o Pai para sermos adoradores em espírito e em verdade. Descubra os 4 pilares eternos da adoração como autoridade espiritual:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WORSHIP_THEOLOGY_PRINCIPLES.map((principle) => {
                  const isSpeaking = speakingPrincipleId === principle.id;
                  return (
                    <div 
                      key={principle.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-amber-400">
                            {principle.scriptureRef}
                          </span>
                          <button
                            onClick={() => proclaimPrinciple(principle)}
                            aria-label={`Ouvir proclamação de ${principle.title}`}
                            className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                              isSpeaking 
                                ? 'bg-amber-500 text-slate-950 font-bold animate-pulse' 
                                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Ouvir</span>
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 mt-1">
                          {principle.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {principle.principle}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-amber-300/80 italic">
                        "{principle.insight}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>"A alegria do SENHOR é a vossa força!" — Neemias 8:10</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
};
