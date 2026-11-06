import type { Itinerary, ItineraryItem } from '../types';
import { itineraryTemplate } from '../api/mockApi';

const alt = itineraryTemplate.alternatives as Record<string, string[]>;
const byTime = (a: ItineraryItem, b: ItineraryItem) => a.time.localeCompare(b.time);
const map = (it: Itinerary, fn: (items: ItineraryItem[], day: number) => ItineraryItem[]): Itinerary => ({
  ...it,
  days: it.days.map((d, i) => ({ ...d, items: fn(d.items, i).slice().sort(byTime) })),
});

export const removeItem = (it: Itinerary, id: string) => map(it, (items) => items.filter((x) => x.id !== id));

/** Remplace par la première alternative du même type non déjà présente dans l'itinéraire. */
export function replaceItem(it: Itinerary, id: string): Itinerary | null {
  const used = new Set(it.days.flatMap((d) => d.items.map((x) => x.ref)));
  const target = it.days.flatMap((d) => d.items).find((x) => x.id === id);
  if (!target) return null;
  const next = (alt[target.kind] ?? []).find((r) => !used.has(r));
  if (!next) return null;
  return map(it, (items) => items.map((x) => (x.id === id ? { ...x, ref: next, paid: false } : x)));
}

export const delayItem = (it: Itinerary, id: string) =>
  map(it, (items) => items.map((x) => {
    if (x.id !== id) return x;
    const h = Math.min(23, parseInt(x.time.slice(0, 2), 10) + 1);
    return { ...x, time: `${String(h).padStart(2, '0')}${x.time.slice(2)}` };
  }));

export function postponeItem(it: Itinerary, id: string): Itinerary | null {
  const di = it.days.findIndex((d) => d.items.some((x) => x.id === id));
  if (di < 0 || di >= it.days.length - 1) return null;
  const item = it.days[di].items.find((x) => x.id === id)!;
  return map(it, (items, i) => (i === di ? items.filter((x) => x.id !== id) : i === di + 1 ? [...items, item] : items));
}
