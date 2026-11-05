import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  Send,
  Plus,
  Sparkles,
  Check,
  Shield,
  HeartPulse,
  BookOpen,
  Flame,
  CheckCircle2,
  Database,
  Cloud,
  Clock,
  UserCheck
} from 'lucide-react';
import { PlayerStats } from '../types/game';
import { db, ensureAuthUser } from '../services/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { soundService } from '../services/soundEffects';

export interface SharedPrayerRequest {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  category: string;
  prayedCount: number;
  prayedUserIds: string[];
  createdAt: string;
  isAnswered: boolean;
  recentIntercessors?: string[];
}

interface SharedIntercessionMuralProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats | ((prev: PlayerStats) => PlayerStats)) => void;
}

const INITIAL_COMMUNITY_REQUESTS: SharedPrayerRequest[] = [
  {
    id: 'req_seed_1',
    authorId: 'saint_barnabe',
    authorName: 'Irmão Barnabé',
    title: 'Edificação e Unidade dos Jovens e Crianças',
    description: 'Intercedamos para que a nova geração seja guardada do secularismo e se apaixone pela Palavra da Graça e pelo Nome de Jesus.',
    category: 'espiritual',
    prayedCount: 24,
    prayedUserIds: ['saint_ester', 'saint_filipe'],
    createdAt: 'Hoje às 06:30',
    isAnswered: false,
    recentIntercessors: ['Serva Ester', 'Diácono Filipe', 'Intercessora Ana']
  },
  {
    id: 'req_seed_2',
    authorId: 'saint_ester',
    authorName: 'Serva Ester de Susa',
    title: 'Restauração da Saúde e Paz no Lar da Família Silva',
    description: 'Clamo em Nome de Jesus por cura divina das enfermidades físicas e que a paz de Cristo exceda todo entendimento.',
    category: 'cura',
    prayedCount: 38,
    prayedUserIds: ['saint_barnabe'],
    createdAt: 'Ontem às 21:15',
    isAnswered: false,
    recentIntercessors: ['Presbítero Lucas', 'Irmão Silas']
  },
  {
    id: 'req_seed_3',
    authorId: 'saint_filipe',
    authorName: 'Diácono Filipe',
    title: 'Portas Abertas de Emprego e Provisão Sagrada',
    description: 'Que o Senhor Jesus, o Bom Pastor, supra ricamente cada necessidade conforme as Suas riquezas em glória aos desempregados.',
    category: 'familia',
    prayedCount: 19,
    prayedUserIds: [],
    createdAt: 'Hoje às 08:00',
    isAnswered: false,
    recentIntercessors: ['Irmã Dorcas']
  }
];

const SIMULATED_SAINTS = [
  'Irmão Barnabé',
  'Serva Ester',
  'Diácono Filipe',
  'Intercessora Ana',
  'Presbítero Lucas',
  'Irmã Dorcas',
  'Irmão Silas',
  'Serva Débora'
];

export const SharedIntercessionMural: React.FC<SharedIntercessionMuralProps> = ({
  stats,
  onUpdateStats
}) => {
  const [requests, setRequests] = useState<SharedPrayerRequest[]>(() => {
    try {
      const saved = localStorage.getItem('shared_intercession_mural');
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_REQUESTS;
    } catch {
      return INITIAL_COMMUNITY_REQUESTS;
    }
  });

  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('espiritual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [activeUserUid, setActiveUserUid] = useState<string>('local_player');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shared_intercession_mural', JSON.stringify(requests));
    } catch {
      // storage full or disabled
    }
  }, [requests]);

  // Connect to Firebase and fetch live prayer requests
  useEffect(() => {
    let isMounted = true;

    async function initFirestoreRequests() {
      try {
        const user = await ensureAuthUser();
        if (user && isMounted) {
          setActiveUserUid(user.uid);
        }

        // Fetch requests from Firestore
        const q = query(collection(db, 'prayer_requests'), limit(25));
        const querySnapshot = await getDocs(q);

        if (isMounted) {
          if (!querySnapshot.empty) {
            const liveData: SharedPrayerRequest[] = [];
            querySnapshot.forEach((docSnap) => {
              liveData.push(docSnap.data() as SharedPrayerRequest);
            });
            // Merge with local seed requests so community always feels rich
            const map = new Map<string, SharedPrayerRequest>();
            liveData.forEach(r => map.set(r.id, r));
            requests.forEach(r => {
              if (!map.has(r.id)) map.set(r.id, r);
            });
            setRequests(Array.from(map.values()));
            setIsDbSynced(true);
          } else {
            // Seed initial requests into Firestore if empty
            for (const item of INITIAL_COMMUNITY_REQUESTS) {
              await setDoc(doc(db, 'prayer_requests', item.id), item).catch(() => {});
            }
            setIsDbSynced(true);
          }
        }
      } catch (err) {
        console.warn('[Mural] Firestore sync operating in local cached mode:', err);
        if (isMounted) setIsDbSynced(false);
      }
    }

    initFirestoreRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const awardPoints = (points: number, reason: string) => {
    onUpdateStats((prev) => ({
      ...prev,
      worshipScore: (prev.worshipScore || 0) + points,
      fruits: {
        ...prev.fruits,
        amor: prev.fruits.amor + 4,
        paz: prev.fruits.paz + 4,
        fidelidade: prev.fruits.fidelidade + 4,
      }
    }));
    soundService.playAngelicHarpChime();
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReq: SharedPrayerRequest = {
      id,
      authorId: activeUserUid,
      authorName: 'Você (Adorador em Cristo)',
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      prayedCount: 0,
      prayedUserIds: [],
      createdAt: 'Agora mesmo',
      isAnswered: false,
      recentIntercessors: []
    };

    // Update local state immediately
    setRequests((prev) => [newReq, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setIsFormOpen(false);
    setIsSubmitting(false);

    awardPoints(20, 'Clamor no Mural Comunitário');
    triggerToast('Pedido apresentado no Altar! +20 WorshipScore. Irmãos foram chamados para orar.');

    // Save to Firestore
    try {
      await setDoc(doc(db, 'prayer_requests', id), {
        ...newReq,
        createdAt: new Date().toISOString()
      });
      setIsDbSynced(true);
    } catch (err) {
      console.warn('[Mural] Error writing to Firestore:', err);
    }

    // Simulate saint intercession after 6 seconds
    setTimeout(() => {
      const saint = SIMULATED_SAINTS[Math.floor(Math.random() * SIMULATED_SAINTS.length)];
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            const updatedRecent = [saint, ...(r.recentIntercessors || [])].slice(0, 3);
            return {
              ...r,
              prayedCount: r.prayedCount + 1,
              recentIntercessors: updatedRecent
            };
          }
          return r;
        })
      );
      awardPoints(15, `${saint} intercedeu por você`);
      triggerToast(`Glória a Deus! ${saint} acabou de orar pelo seu pedido! (+15 WorshipScore)`);
    }, 6000);
  };

  const handleIntercede = async (request: SharedPrayerRequest) => {
    // Check if user already prayed
    if (request.prayedUserIds.includes(activeUserUid)) {
      triggerToast('Você já selou sua intercessão por este clamor.');
      return;
    }

    const updatedUsers = [...request.prayedUserIds, activeUserUid];
    const newCount = request.prayedCount + 1;
    const updatedRecent = ['Você (Adorador)', ...(request.recentIntercessors || [])].slice(0, 3);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? { ...r, prayedCount: newCount, prayedUserIds: updatedUsers, recentIntercessors: updatedRecent }
          : r
      )
    );

    awardPoints(15, `Intercessão por: ${request.title}`);
    triggerToast(`Sua intercessão subiu ao Trono da Graça! +15 WorshipScore concedidos.`);

    // Update in Firestore
    try {
      const reqRef = doc(db, 'prayer_requests', request.id);
      await updateDoc(reqRef, {
        prayedCount: newCount,
        prayedUserIds: updatedUsers
      });
    } catch (err) {
      console.warn('[Mural] Error updating prayer count in Firestore:', err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterCategory === 'todos') return true;
    if (filterCategory === 'meus') return r.authorId === activeUserUid;
    return r.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-sky-500/30 p-5 md:p-7 space-y-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Background celestial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-xl md:text-2xl font-bold text-amber-200">
                Mural de Intercessão Compartilhada
              </h2>
              {isDbSynced ? (
                <span className="flex items-center gap-1 text-[11px] font-sans font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <Database className="w-3 h-3" />
                  Firestore Ativo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-sans text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <Cloud className="w-3 h-3" />
                  Sincronização Local
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-serif italic">
              "Confessai as vossas culpas uns aos outros e orai uns pelos outros para serdes curados. A oração feita por um justo pode muito em seus efeitos." (Tiago 5:16)
            </p>
          </div>
        </div>

        {/* New Prayer Request Button */}
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-900/30 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? 'Recolher Formulário' : 'Novo Pedido Comunitário'}</span>
        </button>
      </div>

      {/* Expandable Form for New Request */}
      {isFormOpen && (
        <form
          onSubmit={handleCreateRequest}
          className="bg-slate-950/70 border border-sky-500/40 rounded-xl p-5 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-sky-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Apresentar Clamor à Comunidade dos Santos
            </h3>
            <span className="text-xs text-amber-300 font-sans font-medium">
              Recompensa: +20 WorshipScore ao compartilhar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-400">Título do Pedido de Oração</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Cura e libertação na família, paz no ministério..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Categoria</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
              >
                <option value="espiritual">Crescimento Espiritual</option>
                <option value="cura">Cura & Saúde</option>
                <option value="familia">Família & Relacionamentos</option>
                <option value="libertacao">Libertação & Vitória</option>
                <option value="gratidao">Gratidão & Louvor</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400">Descrição do Clamor e Versículo de Apoio</label>
            <textarea
              required
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descreva o motivo de oração para que os santos orem com entendimento e autoridade no Nome de Jesus..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar no Mural</span>
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 scrollbar-none">
        {[
          { id: 'todos', label: 'Todos os Clamores' },
          { id: 'espiritual', label: 'Espiritual' },
          { id: 'cura', label: 'Cura Divina' },
          { id: 'familia', label: 'Família' },
          { id: 'libertacao', label: 'Libertação' },
          { id: 'meus', label: 'Meus Clamores' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              filterCategory === cat.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50 font-bold'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-sky-500/20 border border-sky-400/40 rounded-xl p-2.5 text-center text-xs text-sky-200 font-serif flex items-center justify-center gap-2 animate-fade-in shadow-lg">
          <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Prayer Request Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((req) => {
          const userAlreadyPrayed = req.prayedUserIds.includes(activeUserUid);

          return (
            <div
              key={req.id}
              className="bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/40 rounded-xl p-4 flex flex-col justify-between transition-all group shadow-sm hover:shadow-sky-950/50"
            >
              <div className="space-y-2.5">
                {/* Card Top: Author & Category */}
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="font-medium text-slate-300 flex items-center gap-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    {req.authorName}
                  </span>
                  <span className="px-2 py-0.5 rounded uppercase font-semibold text-[10px] tracking-wider bg-slate-900 border border-slate-700/60 text-amber-300 shrink-0">
                    {req.category}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-serif font-bold text-sm text-slate-100 group-hover:text-sky-200 transition-colors leading-snug">
                  {req.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                  {req.description}
                </p>

                {/* Recent Intercessors indicator */}
                {req.recentIntercessors && req.recentIntercessors.length > 0 && (
                  <div className="text-[11px] text-sky-300/80 bg-sky-950/30 border border-sky-500/20 rounded p-1.5 flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">
                      Intercessores: {req.recentIntercessors.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer: Prayer count & Action */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs text-amber-300 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{req.prayedCount}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {req.prayedCount === 1 ? 'oração' : 'orações'}
                  </span>
                </div>

                <button
                  onClick={() => handleIntercede(req)}
                  disabled={userAlreadyPrayed}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userAlreadyPrayed
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md active:scale-95'
                  }`}
                  title={userAlreadyPrayed ? 'Você já orou por este pedido' : 'Orar e interceder agora (+15 WorshipScore)'}
                >
                  {userAlreadyPrayed ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Já orei ✓</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5 text-rose-300" />
                      <span>Já orei por isso (+15)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
