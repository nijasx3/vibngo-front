import { create } from 'zustand';
import type { Collab, Draft, Itinerary, LegMode, Parameters, Reminder, Review, Souvenir, Stop, UserActivity } from '../types';
import { addDays, iso, today } from '../lib/dates';
import { buildManualItinerary, buildVibiItinerary, emptyDays, setLegMode as setLeg, uid } from '../lib/itinerary';
import { ACTIVITIES, communityData, userSeed } from '../api/mockApi';

/** Délai (ms) avant que l’ami invité « accepte » : simulation, il n’y a pas de back. */
export const COLLAB_ACCEPT_DELAY = 8000;
let collabTimer: ReturnType<typeof setTimeout> | undefined;

export interface User {
  name: string;
  lastName: string;
  city: string;
  bio: string;
  traveler_type: string | null; // id de profil, null = « Nouveau voyageur »
  current_itinerary: Itinerary | null;
  like: string[]; // ids des lieux / hôtels / destinations sauvegardés
  parameters: Parameters;
  friends: string[]; // ids
}

export const makeDraft = (): Draft => {
  const start = iso(today());
  const end = iso(addDays(today(), 7));
  return { destination: 'Rome, Italie', startDate: start, endDate: end, budget: 'Entre 1 000 € et 2 000 €', transportOut: 'Avion · Depuis Paris CDG', transportBack: 'Rome · Ville d’arrivée', lodging: 'Hôtel · Centre-ville', days: emptyDays(start, end) };
};

interface State {
  user: User | null;
  answers: string[];
  visited: string[];
  quizDate: string | null;
  /** Inscriptions (forme du Word : name, offered_by, subscriptions, date). */
  activities: UserActivity[];
  eventsJoined: string[];
  requested: string[];
  maybe: boolean;
  proposal: Itinerary | null;
  draft: Draft;
  reviews: Record<string, Review[]>;
  /** Carnet de voyage : souvenirs, visibilité (privé par défaut) */
  souvenirs: Souvenir[];
  carnetPublic: boolean;
  reminders: Reminder[];
  collab: Collab | null;
  toast: string | null;
  signup: (name: string) => void;
  setAnswers: (a: string[]) => void;
  setVisited: (v: string[]) => void;
  setProfile: (id: string | null) => void;
  updateProfile: (p: Partial<Pick<User, 'name' | 'lastName' | 'city' | 'bio'>>) => void;
  setParam: <K extends keyof Parameters>(k: K, v: Parameters[K]) => void;
  toggleLike: (id: string) => void;
  joinInvitation: () => void;
  leaveInvitation: () => void;
  setMaybe: (v: boolean) => void;
  toggleActivity: (id: string) => void;
  toggleEvent: (id: string) => void;
  requestViber: (id: string) => void;
  addReview: (placeId: string, r: Review) => void;
  setProposal: (it: Itinerary | null) => void;
  newProposal: () => Itinerary;
  setDraft: (d: Partial<Draft>) => void;
  resetDraft: () => void;
  addDraftStop: (day: number, s: Stop) => void;
  addSouvenir: (s: Omit<Souvenir, 'id'>) => Souvenir;
  updateSouvenir: (id: string, s: Omit<Souvenir, 'id'>) => void;
  removeSouvenir: (id: string) => void;
  setCarnetPublic: (v: boolean) => void;
  addReminder: (r: Omit<Reminder, 'id'>) => void;
  sendInvite: (friendId: string, name: string, access: Collab['access']) => void;
  acceptInvite: () => void;
  setLegMode: (a: Stop, b: Stop, mode: LegMode) => void;
  saveItinerary: (it: Itinerary) => void;
  updateItinerary: (fn: (it: Itinerary) => Itinerary | null, errorMsg?: string) => void;
  loadDemoItinerary: () => void;
  showToast: (msg: string) => void;
  hideToast: () => void;
  reset: () => void;
}

const initial = {
  user: null as User | null,
  answers: [] as string[],
  visited: [] as string[],
  quizDate: null as string | null,
  activities: [] as UserActivity[],
  eventsJoined: [] as string[],
  requested: [] as string[],
  maybe: false,
  proposal: null as Itinerary | null,
  draft: makeDraft(),
  reviews: {} as Record<string, Review[]>,
  souvenirs: [] as Souvenir[],
  carnetPublic: false,
  reminders: [] as Reminder[],
  collab: null as Collab | null,
  toast: null as string | null,
};

const INVITATION_ID = communityData.invitation.id;

export const useStore = create<State>()((set, get) => ({
  ...initial,
  signup: (name) => { clearTimeout(collabTimer); set({ ...structuredClone(initial), draft: makeDraft(), user: { ...structuredClone(userSeed), name: name.trim() } as User }); },
  setAnswers: (answers) => set({ answers }),
  setVisited: (visited) => set({ visited }),
  setProfile: (id) => set((s) => (s.user ? { user: { ...s.user, traveler_type: id }, quizDate: id ? iso(today()) : s.quizDate } : s)),
  updateProfile: (p) => set((s) => (s.user ? { user: { ...s.user, ...p } } : s)),
  setParam: (k, v) => set((s) => (s.user ? { user: { ...s.user, parameters: { ...s.user.parameters, [k]: v } } } : s)),
  toggleLike: (id) => set((s) => {
    if (!s.user) return s;
    const like = s.user.like.includes(id) ? s.user.like.filter((x) => x !== id) : [...s.user.like, id];
    return { user: { ...s.user, like } };
  }),
  // Invitation d'un ami (Communauté) : « Je participe » ajoute l'activité à user.activities
  joinInvitation: () => {
    if (get().activities.some((a) => a.id === INVITATION_ID)) return;
    const inv = communityData.invitation;
    const date = iso(addDays(today(), inv.dayOffset));
    set((s) => ({ maybe: false, activities: [...s.activities, { id: inv.id, name: inv.name, offered_by: inv.author, subscriptions: inv.registered + 1, date }] }));
  },
  leaveInvitation: () => set((s) => ({ activities: s.activities.filter((a) => a.id !== INVITATION_ID) })),
  setMaybe: (maybe) => set({ maybe }),
  // Activités de l'onglet Explorer : « S'inscrire » / « Inscrit »
  toggleActivity: (id) => {
    const a = ACTIVITIES.find((x) => x.id === id);
    if (!a) return;
    set((s) => {
      const on = s.activities.some((x) => x.id === id);
      const count = (a.interested ?? 0) + (on ? 0 : 1);
      return {
        activities: on ? s.activities.filter((x) => x.id !== id) : [...s.activities, { id, name: a.name, offered_by: 'Vibngo', subscriptions: count, date: iso(today()) }],
      };
    });
  },
  toggleEvent: (id) => set((s) => ({ eventsJoined: s.eventsJoined.includes(id) ? s.eventsJoined.filter((x) => x !== id) : [...s.eventsJoined, id] })),
  requestViber: (id) => set((s) => (s.requested.includes(id) ? s : { requested: [...s.requested, id] })),
  addReview: (placeId, r) => set((s) => ({ reviews: { ...s.reviews, [placeId]: [r, ...(s.reviews[placeId] ?? [])] } })),
  setProposal: (proposal) => set({ proposal }),
  newProposal: () => { const it = buildVibiItinerary(); set({ proposal: it }); return it; },
  setDraft: (d) => set((s) => ({ draft: { ...s.draft, ...d } })),
  resetDraft: () => set({ draft: makeDraft() }),
  addDraftStop: (day, stop) => set((s) => ({ draft: { ...s.draft, days: s.draft.days.map((d, i) => (i === day ? [...d, stop].sort((a, b) => a.time.localeCompare(b.time)) : d)) } })),
  addSouvenir: (s) => {
    const souv = { ...s, id: uid('sv') };
    set((st) => ({ souvenirs: [...st.souvenirs, souv].sort((a, b) => a.date.localeCompare(b.date)) }));
    return souv;
  },
  updateSouvenir: (id, s) => set((st) => ({ souvenirs: st.souvenirs.map((x) => (x.id === id ? { ...s, id } : x)).sort((a, b) => a.date.localeCompare(b.date)) })),
  removeSouvenir: (id) => set((st) => ({ souvenirs: st.souvenirs.filter((x) => x.id !== id) })),
  setCarnetPublic: (carnetPublic) => set({ carnetPublic }),
  addReminder: (r) => set((st) => ({ reminders: [...st.reminders.filter((x) => x.title !== r.title), { ...r, id: uid('rm') }] })),
  sendInvite: (friendId, name, access) => {
    clearTimeout(collabTimer);
    set({ collab: { friendId, name, access, status: 'pending' } });
    collabTimer = setTimeout(() => get().acceptInvite(), COLLAB_ACCEPT_DELAY);
  },
  acceptInvite: () => {
    const c = get().collab;
    if (!c || c.status !== 'pending') return;
    set({ collab: { ...c, status: 'accepted' }, toast: `${c.name.split(' ')[0]} a accepté ton invitation` });
  },
  setLegMode: (a, b, mode) => get().updateItinerary((it) => setLeg(it, a, b, mode)),
  saveItinerary: (it) => set((s) => (s.user ? { user: { ...s.user, current_itinerary: { ...it, saved: true } } } : s)),
  updateItinerary: (fn, errorMsg) => {
    const it = get().user?.current_itinerary;
    if (!it) return;
    const next = fn(it);
    if (!next) { if (errorMsg) set({ toast: errorMsg }); return; }
    set((s) => (s.user ? { user: { ...s.user, current_itinerary: next } } : s));
  },
  loadDemoItinerary: () => set((s) => (s.user ? { user: { ...s.user, current_itinerary: { ...buildVibiItinerary(), saved: true } } } : s)),
  showToast: (toast) => set({ toast }),
  hideToast: () => set({ toast: null }),
  reset: () => { clearTimeout(collabTimer); set({ ...structuredClone(initial), draft: makeDraft() }); },
}));

export { buildManualItinerary };
