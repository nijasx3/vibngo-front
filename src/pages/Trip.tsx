import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button, Footer, Header, PhotoCard, cx } from '../components/ui';
import DayProgram from '../components/DayProgram';
import { useStore } from '../state/store';
import { dayIndex, tripSub } from '../lib/itinerary';
import { addDays, fmtDayMonth, parseISO } from '../lib/dates';

/** Pastilles de navigation d’un voyage : statut puis Carte / Réservations / Collaborer. */
export function TripTabs({ ongoing, day = 0 }: { ongoing: boolean; day?: number }) {
  const nav = useNavigate();
  const pill = 'rounded-md bg-sable px-3 py-1.5 text-[13px] font-bold';
  return (
    <div className="mt-3 flex items-center gap-2">
      <span data-testid="trip-status" className={cx('mr-1 rounded px-2.5 py-1 text-[11px] font-bold', ongoing ? 'bg-vert' : 'bg-sable')}>{ongoing ? 'EN COURS' : 'À VENIR'}</span>
      <button className={pill} onClick={() => nav(`/trip/map?day=${day}`)}>Carte</button>
      <button className={pill} onClick={() => nav('/trip/bookings')}>Réservations</button>
      <button className={pill} onClick={() => nav('/trip/collaborate')}>Collaborer</button>
    </div>
  );
}

/** Voyage enregistré : consultation du programme jour par jour. */
export default function Trip() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  const q = useSearchParams()[0];
  const [day, setDay] = useState(() => {
    const d = Number(q.get('day'));
    if (it && q.has('day') && Number.isInteger(d)) return Math.min(Math.max(d, 0), it.days.length - 1);
    return it ? Math.min(Math.max(dayIndex(it), 0), it.days.length - 1) : 0;
  });
  if (!it) return <Navigate to="/trips" replace />;
  const ongoing = dayIndex(it) >= 0;
  return (
    <>
      <Header title={`Voyage à ${it.destination.split(',')[0]}`} onBack={() => nav('/trips')} />
      <div className="px-5 pb-4">
        <PhotoCard src="rome.jpg" title={it.destination} sub={tripSub(it)} height="h-[110px]" />
        <TripTabs ongoing={ongoing} day={day} />
        <div className="mt-4 flex items-center justify-between"><h2 className="t-label text-[12px]">Programme · {fmtDayMonth(addDays(parseISO(it.startDate), day))}</h2>
          <button data-testid="edit-program" onClick={() => nav(`/modify?day=${day}&from=trip`)} className="rounded-md bg-sable px-3 py-1.5 text-[12px] font-bold">Modifier</button></div>
        <div className="mt-2"><DayProgram it={it} day={day} onDay={setDay} onLeg={(a, b) => nav(`/leg?day=${day}&a=${a.id}&b=${b.id}`)} /></div>
        <button onClick={() => nav('/transport?from=trip')} className="mt-4 flex w-full items-center justify-between rounded-lg bg-sable px-4 py-3 text-left"><span className="t-h3 text-[14px]">Transport et séjour</span><ChevronRight size={18} /></button>
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="open-carnet" onClick={() => nav('/carnet')}>Ouvrir le carnet</Button></Footer>
    </>
  );
}
