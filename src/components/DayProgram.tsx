import { Footprints } from 'lucide-react';
import { StepBadge, cx } from './ui';
import type { Itinerary, Stop } from '../types';
import { addDays, fmtLong, parseISO } from '../lib/dates';
import { legText } from '../lib/itinerary';

/**
 * Sélecteur de jour + liste des étapes, avec le trajet entre deux étapes quand il est connu.
 * Si `onLeg` est fourni, le trajet est cliquable (choix du mode de déplacement).
 */
export default function DayProgram({ it, day, onDay, onLeg }: { it: Itinerary; day: number; onDay: (d: number) => void; onLeg?: (a: Stop, b: Stop) => void }) {
  const stops = it.days[day] ?? [];
  const date = addDays(parseISO(it.startDate), day);
  return (
    <section>
      <div role="tablist" aria-label="Jours du voyage" className="scroll-area -mx-5 flex shrink-0 gap-2 overflow-x-auto px-5 pb-3">
        {it.days.map((_, i) => (
          <button key={i} role="tab" aria-selected={i === day} onClick={() => onDay(i)} data-testid={`day-${i + 1}`}
            className={cx('shrink-0 rounded-md px-3 py-1.5 text-[12px] font-bold', i === day ? 'bg-brun text-white' : 'bg-sable')}>Jour {i + 1}</button>
        ))}
      </div>
      <div className="flex items-baseline justify-between"><h2 data-testid="day-title" className="t-section">{fmtLong(date)}</h2><span className="t-small text-muted">{stops.length} étape{stops.length > 1 ? 's' : ''}</span></div>
      {stops.length === 0 && <p className="t-body mt-3 text-muted">Aucune activité prévue pour cette journée.</p>}
      <ol className="mt-2">
        {stops.map((s, i) => {
          const next = stops[i + 1];
          const leg = next ? legText(it, s, next) : null;
          const body = <><Footprints size={13} />{leg}</>;
          const cls = 'my-1 flex w-full items-center justify-center gap-1.5 rounded-md bg-sable py-2 text-[11px] font-medium';
          return (
            <li key={s.id} data-testid="stop">
              <div className="flex items-start gap-3 border-t border-trait py-3">
                <StepBadge n={i + 1} /><span className="w-11 pt-0.5 text-[13px] font-bold">{s.time}</span>
                <span className="min-w-0 flex-1"><span className="t-h3 block text-[15px]">{s.title}</span><span className="t-small block text-muted">{s.sub}</span></span>
                {s.tag && <span className="rounded bg-vert px-2 py-0.5 text-[10px] font-bold">{s.tag}</span>}
              </div>
              {leg && next && (onLeg
                ? <button data-testid="leg" aria-label={`Trajet : ${leg}. Changer le mode de déplacement`} onClick={() => onLeg(s, next)} className={cls}>{body}</button>
                : <p data-testid="leg" className={cls}>{body}</p>)}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
