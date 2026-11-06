import { create } from 'zustand';
import type { Draft, Itinerary, Parameters, UserActivity } from '../types';
import { addDays, iso, parseISO, today } from '../lib/dates';
import { community_, itineraryTemplate, userSeed } from '../api/mockApi';

export interface User {
  name: string;
  traveler_type: string | null; // id de profil
  current_itinerary: Itinerary | null;
  like: string[]; // ids des lieux / hôtels sauvegardés
  parameters: Parameters;
  friends: string[]; // ids
}

interface State {
  user: User | null;
  answers: string[];
  activities: UserActivity[];
  offered: Record<string, number>; // id activité proposée -> nombre d'inscrits courant
  joined: string[];
  draft: Draft;
  toast: string | null;
  signup: (name: string) => void;
  setAnswers: (a: string[]) => void;
  setProfile: (id: string) => void;
  setParam: <K extends keyof Parameters>(k: K, v: Parameters[K]) => void;
  toggleLike: (id: string) => void;
  join: (id: string) => void;
  leave: (id: string) => void;
  setDraft: (d: Partial<Draft>) => void;
  resetDraft: (destination?: string) => void;
  saveItinerary: (it: Itinerary) => void;
  updateItinerary: (fn: (it: Itinerary) => Itinerary | null, errorMsg?: string) => void;
  loadDemoItinerary: () => void;
  showToast: (msg: string) => void;
  hideToast: () => void;
  reset: () => void;
}


export const makeDraft = (destination = ''): Draft => ({
  destination,
  startDate: iso(today()),
  endDate: iso(addDays(today(), 2)),
  budget: '800 €',
  constraints: '',
  transportOut: 'Avion',
  transportBack: 'Avion',
  lodging: 'Hôtel',
  travelers: 1,
  interests: ['Histoire', 'Gastronomie'],
  invited: [],
});

const initial = {
  user: null as User | null,
  answers: [] as string[],
  activities: [] as UserActivity[],
  offered: Object.fromEntries(community_.offeredActivities.map((a) => [a.id, a.subscriptions])) as Record<string, number>,
  joined: [] as string[],
  draft: makeDraft(),
  toast: null as string | null,
};

export const buildItinerary = (destination: string, d: Draft): Itinerary => ({
  id: 'it-' + Date.now(),
  title: itineraryTemplate.title,
  destination: destination || 'Rome',
  startDate: d.startDate,
  endDate: iso(addDays(parseISO(d.startDate), itineraryTemplate.days.length - 1)),
  travelers: d.travelers,
  days: itineraryTemplate.days.map((day) => ({ label: day.label, items: day.items.map((i) => ({ ...i, kind: i.kind as 'poi' | 'activity' | 'resto' })) })),
  validated: false,
});

export const useStore = create<State>()((set, get) => ({
      ...initial,
      signup: (name) =>
        set({
          user: { ...structuredClone(userSeed), name: name.trim() } as User,
        }),
      setAnswers: (answers) => set({ answers }),
      setProfile: (id) => set((s) => (s.user ? { user: { ...s.user, traveler_type: id } } : s)),
      setParam: (k, v) => set((s) => (s.user ? { user: { ...s.user, parameters: { ...s.user.parameters, [k]: v } } } : s)),
      toggleLike: (id) =>
        set((s) => {
          if (!s.user) return s;
          const like = s.user.like.includes(id) ? s.user.like.filter((x) => x !== id) : [...s.user.like, id];
          return { user: { ...s.user, like } };
        }),
      join: (id) => {
        const a = community_.offeredActivities.find((x) => x.id === id);
        if (!a || get().joined.includes(id)) return;
        const date = iso(addDays(today(), a.dayOffset));
        set((s) => ({
          joined: [...s.joined, id],
          offered: { ...s.offered, [id]: (s.offered[id] ?? a.subscriptions) + 1 },
          activities: [...s.activities, { id, name: a.name, offered_by: a.offered_by, subscriptions: (s.offered[id] ?? a.subscriptions) + 1, date }],
        }));
      },
      leave: (id) =>
        set((s) => ({
          joined: s.joined.filter((x) => x !== id),
          offered: { ...s.offered, [id]: Math.max(0, (s.offered[id] ?? 1) - 1) },
          activities: s.activities.filter((a) => a.id !== id),
        })),
      setDraft: (d) => set((s) => ({ draft: { ...s.draft, ...d } })),
      resetDraft: (destination = '') => set({ draft: makeDraft(destination) }),
      saveItinerary: (it) => set((s) => (s.user ? { user: { ...s.user, current_itinerary: it } } : s)),
      updateItinerary: (fn, errorMsg) => {
        const it = get().user?.current_itinerary;
        if (!it) return;
        const next = fn(it);
        if (!next) { if (errorMsg) set({ toast: errorMsg }); return; }
        set((s) => (s.user ? { user: { ...s.user, current_itinerary: next } } : s));
      },
      loadDemoItinerary: () =>
        set((s) => (s.user ? { user: { ...s.user, current_itinerary: { ...buildItinerary('Rome', makeDraft('Rome')), validated: true } } } : s)),
      showToast: (toast) => set({ toast }),
      hideToast: () => set({ toast: null }),
      reset: () => set({ ...initial, draft: makeDraft(), offered: { ...initial.offered } }),
    }));
