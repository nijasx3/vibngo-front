import type { Draft, Itinerary, LegMode, Stop } from '../types';
import { tripTemplate, rome } from '../api/mockApi';
import { addDays, diffDays, fmtRange, iso, parseISO, today } from './dates';

let seq = 0;
export const uid = (p = 's') => `${p}-${Date.now().toString(36)}-${++seq}`;

const byTime = (a: Stop, b: Stop) => a.time.localeCompare(b.time);

/** Itinéraire proposé par Vibi (toujours Rome dans le prototype). */
export function buildVibiItinerary(startDate = iso(today())): Itinerary {
  const days = (tripTemplate.days as unknown as [string, string, string, string | null][][]).map((d) =>
    d.map(([time, title, sub, tag]) => ({ id: uid(), time, title, sub, tag: tag ?? undefined })));
  return {
    id: uid('it'), title: tripTemplate.title, destination: rome.title, startDate,
    endDate: iso(addDays(parseISO(startDate), tripTemplate.nights)), travelers: tripTemplate.travelers,
    budget: tripTemplate.budget, transportOut: 'Train · Paris → Rome Termini', transportBack: 'Train · Rome Termini → Paris',
    lodging: 'Hôtel Colosseum Palace · 7 nuits', days, saved: false, source: 'vibi', legModes: {},
  };
}

export const daysBetween = (start: string, end: string) =>
  Math.max(1, Math.round((parseISO(end).getTime() - parseISO(start).getTime()) / 86400000) + 1);

export const emptyDays = (start: string, end: string): Stop[][] => Array.from({ length: daysBetween(start, end) }, () => []);

export function buildManualItinerary(d: Draft): Itinerary {
  return {
    id: uid('it'), title: 'Voyage à Rome', destination: rome.title, startDate: d.startDate, endDate: d.endDate, travelers: 2,
    budget: d.budget, transportOut: d.transportOut, transportBack: d.transportBack, lodging: d.lodging,
    days: d.days.map((day) => day.slice().sort(byTime)), saved: false, source: 'manual', legModes: {},
  };
}

const mapDay = (it: Itinerary, di: number, fn: (s: Stop[]) => Stop[]): Itinerary => ({
  ...it, days: it.days.map((d, i) => (i === di ? fn(d) : d)),
});

/** Réordonne les étapes d'une journée en conservant les horaires de chaque emplacement. */
export function moveStop(it: Itinerary, di: number, from: number, to: number): Itinerary {
  return mapDay(it, di, (stops) => {
    if (to < 0 || to >= stops.length) return stops;
    const times = stops.map((s) => s.time);
    const next = stops.slice();
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    return next.map((s, i) => ({ ...s, time: times[i] }));
  });
}

export const addStop = (it: Itinerary, di: number, stop: Stop) => mapDay(it, di, (s) => [...s, stop].sort(byTime));

export const removeStop = (it: Itinerary, di: number, id: string) => mapDay(it, di, (s) => s.filter((x) => x.id !== id));

/** Retarder : +1 h (plafonné à 23 h). */
export const delayStop = (it: Itinerary, di: number, id: string) =>
  mapDay(it, di, (s) => s.map((x) => (x.id === id ? { ...x, time: `${String(Math.min(23, parseInt(x.time, 10) + 1)).padStart(2, '0')}${x.time.slice(2)}` } : x)).sort(byTime));

/** Reporter : déplace l'étape au lendemain (impossible le dernier jour). */
export function postponeStop(it: Itinerary, di: number, id: string): Itinerary | null {
  if (di >= it.days.length - 1) return null;
  const stop = it.days[di].find((x) => x.id === id);
  if (!stop) return null;
  const moved = { ...stop };
  return { ...it, days: it.days.map((d, i) => (i === di ? d.filter((x) => x.id !== id) : i === di + 1 ? [...d, moved].sort(byTime) : d)) };
}

/** Changer : passe à l'alternative suivante (en boucle) qui n'est pas déjà au programme ailleurs. */
export function replaceStop(it: Itinerary, di: number, id: string): Itinerary | null {
  const target = it.days[di]?.find((x) => x.id === id);
  if (!target) return null;
  const usedElsewhere = new Set(it.days.flat().filter((s) => s.id !== id).map((s) => s.title));
  const alts = tripTemplate.alternatives;
  const start = alts.findIndex(([t]) => t === target.title);
  for (let k = 1; k <= alts.length; k++) {
    const [title, sub] = alts[(start + k + alts.length) % alts.length];
    if (title !== target.title && !usedElsewhere.has(title)) {
      return mapDay(it, di, (s) => s.map((x) => (x.id === id ? { ...x, title, sub, tag: undefined } : x)));
    }
  }
  return null;
}

/** Indice du jour courant d'un voyage (borné), ou -1 / n si pas encore commencé / terminé. */
export const dayIndex = (it: Itinerary, now = today()) =>
  Math.round((now.getTime() - parseISO(it.startDate).getTime()) / 86400000);

export const LEG_LABEL: Record<LegMode, string> = { walk: 'À pied', bus: 'Bus', taxi: 'Taxi' };
export const LEG_MODES: LegMode[] = ['walk', 'bus', 'taxi'];
export const legKey = (a: Stop, b: Stop) => `${a.title}|${b.title}`;
export const shortName = (title: string) => (tripTemplate.short as Record<string, string>)[title] ?? title;

/** Distance et durée indicatives entre deux étapes consécutives, par mode (inconnues pour les paires hors modèle). */
export function legOptions(a: Stop, b: Stop): Record<LegMode, [string, string]> | null {
  return ((tripTemplate.legs as unknown as Record<string, Record<LegMode, [string, string]>>)[legKey(a, b)]) ?? null;
}
/** Texte du trajet affiché entre deux étapes : « À pied · 600 m · 8 min » (mode choisi, « À pied » par défaut). */
export function legText(it: Itinerary, a: Stop, b: Stop): string | null {
  const o = legOptions(a, b);
  if (!o) return null;
  const mode = it.legModes?.[legKey(a, b)] ?? 'walk';
  return `${LEG_LABEL[mode]} · ${o[mode][0]} · ${o[mode][1]}`;
}
export const setLegMode = (it: Itinerary, a: Stop, b: Stop, mode: LegMode): Itinerary => ({ ...it, legModes: { ...it.legModes, [legKey(a, b)]: mode } });

/** Durée affichée comme dans le design (« 4–11 juillet · 7 jours ») : nombre de nuits. */
export const tripNights = (it: Pick<Itinerary, 'startDate' | 'endDate'>) => diffDays(parseISO(it.endDate), parseISO(it.startDate));
/** « 4–11 juillet 2026 · 7 jours · 2 voyageurs » */
export const tripSub = (it: Pick<Itinerary, 'startDate' | 'endDate' | 'travelers'>) =>
  `${fmtRange(parseISO(it.startDate), parseISO(it.endDate))} · ${tripNights(it)} jours · ${it.travelers} voyageur${it.travelers > 1 ? 's' : ''}`;
