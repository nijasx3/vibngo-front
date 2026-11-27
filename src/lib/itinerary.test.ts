import { describe, expect, it } from 'vitest';
import { addStop, buildVibiItinerary, delayStop, emptyDays, moveStop, postponeStop, removeStop, replaceStop } from './itinerary';

const titles = (t: ReturnType<typeof buildVibiItinerary>, d = 0) => t.days[d].map((s) => s.title);

describe('itinéraire proposé par Vibi', () => {
  const trip = buildVibiItinerary('2026-07-04');
  it('couvre 8 jours (7 nuits), le jour 1 reprend le design', () => {
    expect(trip.days).toHaveLength(8);
    expect(trip.endDate).toBe('2026-07-11');
    expect(titles(trip)[0]).toBe('Colisée de Rome');
    expect(trip.days[0]).toHaveLength(7);
  });
  it('réorganiser garde les horaires par emplacement et retire les trajets à pied', () => {
    const moved = moveStop(trip, 0, 1, 2); // Travertino ↔ Forum
    expect(titles(moved).slice(0, 3)).toEqual(['Colisée de Rome', 'Forum Romain', 'Travertino Restaurant']);
    expect(moved.days[0].map((s) => s.time).slice(0, 3)).toEqual(['09:00', '12:30', '15:00']);
    expect(moved.days[0][1].walk).toBeUndefined();
    expect(trip.days[0][1].title).toBe('Travertino Restaurant'); // l'original n'est pas muté
  });
  it('retarde de 1 h, plafonné à 23 h', () => {
    const id = trip.days[0][0].id;
    expect(delayStop(trip, 0, id).days[0].find((s) => s.id === id)!.time).toBe('10:00');
    const late = addStop(trip, 0, { id: 'x', time: '23:30', title: 'Nuit', sub: '' });
    expect(delayStop(late, 0, 'x').days[0].find((s) => s.id === 'x')!.time).toBe('23:30');
  });
  it('reporte au lendemain, mais pas le dernier jour', () => {
    const id = trip.days[0][0].id;
    const next = postponeStop(trip, 0, id)!;
    expect(next.days[0].some((s) => s.id === id)).toBe(false);
    expect(next.days[1].some((s) => s.id === id)).toBe(true);
    expect(postponeStop(trip, trip.days.length - 1, trip.days[trip.days.length - 1][0].id)).toBeNull();
  });
  it('remplace par les alternatives en boucle, sans doublon avec le reste du programme', () => {
    let cur = trip; const id = trip.days[0][0].id;
    const seen: string[] = [];
    for (let i = 0; i < 5; i++) { const n = replaceStop(cur, 0, id); expect(n).not.toBeNull(); cur = n!; seen.push(cur.days[0].find((s) => s.id === id)!.title); }
    expect(new Set(seen.slice(0, 4)).size).toBe(4);
    expect(seen[4]).toBe(seen[0]);
    expect(replaceStop(cur, 0, 'inconnu')).toBeNull();
  });
  it('retire une étape', () => {
    expect(titles(removeStop(trip, 0, trip.days[0][0].id))[0]).toBe('Travertino Restaurant');
  });
});

describe('brouillon manuel', () => {
  it('crée un jour par date, bornes incluses', () => {
    expect(emptyDays('2026-07-04', '2026-07-04')).toHaveLength(1);
    expect(emptyDays('2026-07-04', '2026-07-07')).toHaveLength(4);
  });
  it('trie les étapes ajoutées par horaire', () => {
    let t = buildVibiItinerary('2026-07-04');
    t = addStop(t, 1, { id: 'a', time: '08:00', title: 'Tôt', sub: '' });
    expect(t.days[1][0].title).toBe('Tôt');
  });
});
