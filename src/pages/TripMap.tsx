import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Footer, Header, StepBadge, cx } from '../components/ui';
import MiniMap from '../components/MiniMap';
import { rome } from '../api/mockApi';
import { useStore } from '../state/store';
import { addDays, fmtLong, parseISO } from '../lib/dates';
import { legText } from '../lib/itinerary';

/** Carte du voyage : plan schématique du jour, étapes et trajets. */
export default function TripMap() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  const q = useSearchParams()[0];
  const day = it ? Math.min(Math.max(Number(q.get('day')) || 0, 0), it.days.length - 1) : 0;
  const stops = it?.days[day] ?? [];
  const [sel, setSel] = useState(0);
  if (!it) return <Navigate to="/trips" replace />;
  const target = stops[Math.min(sel, stops.length - 1)];
  return (
    <>
      <Header title="Carte du voyage" onBack={() => nav(`/trip?day=${day}`)} />
      <div className="px-5 pb-4">
        <h2 className="t-section mb-3 text-[15px]">{it.destination.split(',')[0]} · {fmtLong(addDays(parseISO(it.startDate), day))}</h2>
        <MiniMap stops={stops.length} temp={rome.weather} friends={3} />
        <div className="mt-5 flex items-center justify-between">
          <h2 className="t-section">Étapes et trajets</h2>
          {target && <button data-testid="from-me" onClick={() => nav(`/trip/route?day=${day}&stop=${target.id}`)} className="rounded-md bg-sable px-3 py-1.5 text-[12px] font-bold">Depuis ma position</button>}
        </div>
        {stops.length === 0 && <p className="t-body mt-3 text-muted">Aucune étape pour cette journée.</p>}
        <ol className="mt-2">
          {stops.map((s, i) => {
            const leg = stops[i + 1] ? legText(it, s, stops[i + 1]) : null;
            return (
              <li key={s.id}>
                <button onClick={() => setSel(i)} aria-pressed={i === sel} className={cx('flex w-full items-start gap-3 border-t border-trait py-3 text-left', i === sel && 'bg-sable/50')}>
                  <StepBadge n={i + 1} /><span className="w-11 pt-0.5 text-[13px] font-bold">{s.time}</span>
                  <span className="min-w-0 flex-1"><span className="t-h3 block text-[15px]">{s.title}</span><span className="t-small block text-muted">{s.sub}</span></span>
                </button>
                {leg && <p className="t-small my-1 rounded-md bg-sable py-2 text-center text-[11px] font-medium">{leg}</p>}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex-1" />
      <Footer><Button onClick={() => nav('/trip/bookings')}>Voir les réservations</Button></Footer>
    </>
  );
}
