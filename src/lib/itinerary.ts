import type { Draft, Itinerary, Stop } from '../types';
import { tripTemplate, rome } from '../api/mockApi';
import { addDays, iso, parseISO, today } from './dates';

let seq = 0;
export const uid = (p = 's') => `${p}-${Date.now().toString(36)}-${++seq}`;

const byTime = (a: Stop, b: Stop) => a.time.localeCompare(b.time);

/** Itinéraire proposé par Vibi (toujours Rome dans le prototype). */
export function buildVibiItinerary(startDate = iso(today())): Itinerary {
  const days = (tripTemplate.days as unknown as [string, string, string, string | null, string | null][][]).map((d) =>
    d.map(([time, title, sub, walk, tag]) => ({ id: uid(), time, title, sub, walk: walk ?? undefined, tag: tag ?? undefined })));
  return {
    id: uid('it'), title: tripTemplate.title, destination: rome.title, startDate,
    endDate: iso(addDays(parseISO(startDate), tripTemplate.nights)), travelers: tripTemplate.travelers,
    budget: tripTemplate.budget, transportOut: 'Train · Paris → Rome Termini', transportBack: 'Train · Rome Termini → Paris',
    lodging: 'Hôtel Colosseum Palace · 7 nuits', days, saved: false, source: 'vibi',
  };
}

export const daysBetween = (start: string, end: string) =>
  Math.max(1, Math.round((parseISO(end).getTime() - parseISO(start).getTime()) / 86400000) + 1);

export const emptyDays = (start: string, end: string): Stop[][] => Array.from({ length: daysBetween(start, end) }, () => []);

export function buildManualItinerary(d: Draft): Itinerary {
  return {
    id: uid('it'), title: 'Voyage à Rome', destination: rome.title, startDate: d.startDate, endDate: d.endDate, travelers: 2,
    budget: d.budget, transportOut: d.transportOut, transportBack: d.transportBack, lodging: d.lodging,
    days: d.days.map((day) => day.slice().sort(byTime)), saved: false, source: 'manual',
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
    // trajets à pied recalculés côté back : on les retire quand l'ordre change
    return next.map((s, i) => ({ ...s, time: times[i], walk: undefined }));
  });
}

export const addStop = (it: Itinerary, di: number, stop: Stop) => mapDay(it, di, (s) => [...s, stop].sort(byTime));

export const removeStop = (it: Itinerary, di: number, id: string) => mapDay(it, di, (s) => s.filter((x) => x.id !== id));

/** Retarder : +1 h (plafonné à 23 h). */
export const delayStop = (it: Itinerary, di: number, id: string) =>
  mapDay(it, di, (s) => s.map((x) => (x.id === id ? { ...x, time: `${String(Math.min(23, parseInt(x.time, 10) + 1)).padStart(2, '0')}${x.time.slice(2)}`, walk: undefined } : x)).sort(byTime));

/** Reporter : déplace l'étape au lendemain (impossible le dernier jour). */
export function postponeStop(it: Itinerary, di: number, id: string): Itinerary | null {
  if (di >= it.days.length - 1) return null;
  const stop = it.days[di].find((x) => x.id === id);
  if (!stop) return null;
  const moved = { ...stop, walk: undefined };
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
      return mapDay(it, di, (s) => s.map((x) => (x.id === id ? { ...x, title, sub, tag: undefined, walk: undefined } : x)));
    }
  }
  return null;
}

/** Indice du jour courant d'un voyage (borné), ou -1 / n si pas encore commencé / terminé. */
export const dayIndex = (it: Itinerary, now = today()) =>
  Math.round((now.getTime() - parseISO(it.startDate).getTime()) / 86400000);
