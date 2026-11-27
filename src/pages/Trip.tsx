import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button, Header, PhotoCard } from '../components/ui';
import DayProgram from '../components/DayProgram';
import { useStore } from '../state/store';
import { dayIndex } from '../lib/itinerary';
import { fmtRange, parseISO } from '../lib/dates';

/** Voyage enregistré : consultation du programme jour par jour. */
export default function Trip() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  const [day, setDay] = useState(() => (it ? Math.min(Math.max(dayIndex(it), 0), it.days.length - 1) : 0));
  if (!it) return <Navigate to="/trips" replace />;
  const ongoing = dayIndex(it) >= 0;
  return (
    <>
      <Header title={`Voyage à ${it.destination.split(',')[0]}`} onBack={() => nav('/profile')} />
      <div className="px-5 pb-4">
        <PhotoCard src="rome.jpg" title={it.destination} sub={`${fmtRange(parseISO(it.startDate), parseISO(it.endDate))} · ${it.days.length} jours · ${it.travelers} voyageurs`} height="h-[110px]" />
        <p className="mt-3"><span data-testid="trip-status" className="rounded bg-sable px-2.5 py-1 text-[11px] font-bold">{ongoing ? 'En cours' : 'À venir'}</span></p>
        <div className="mt-4 flex items-center justify-between"><h2 className="t-label text-[12px]">Programme</h2>
          <button data-testid="edit-program" onClick={() => nav(`/modify?day=${day}&from=trip`)} className="rounded-md bg-sable px-3 py-1.5 text-[12px] font-bold">Modifier</button></div>
        <div className="mt-2"><DayProgram it={it} day={day} onDay={setDay} /></div>
        <button onClick={() => nav('/transport?from=trip')} className="mt-4 flex w-full items-center justify-between rounded-lg bg-sable px-4 py-3 text-left"><span className="t-h3 text-[14px]">Transport et séjour</span><ChevronRight size={18} /></button>
      </div>
      <div className="flex-1" />
      <div className="px-5 pb-4"><Button variant="light" stripe={false} onClick={() => nav('/create')}>Créer un autre itinéraire</Button></div>
    </>
  );
}
