import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, FileText, ShieldCheck, Smartphone } from 'lucide-react';
import { Header, PhotoCard, StepBadge } from '../components/ui';
import { useStore } from '../state/store';
import { tripTemplate } from '../api/mockApi';
import { upcomingTrips } from './Trips';
import { fmtDayMonth, fmtRange, parseISO } from '../lib/dates';

const ICONS = [FileText, ShieldCheck, Smartphone];

/** Voyage à venir d’exemple (Tokyo) : préparatifs et premier jour. Données du design, non modifiables. */
export default function Upcoming() {
  const nav = useNavigate();
  const { id } = useParams();
  const it = useStore((s) => s.user!.current_itinerary);
  const showToast = useStore((s) => s.showToast);
  const trip = it ? upcomingTrips(it.startDate).find((u) => u.id === id && u.detail) : undefined;
  if (!trip) return <Navigate to="/trips" replace />;
  const T = tripTemplate.tokyo;
  return (
    <>
      <Header title={`Voyage à ${trip.title.split(',')[0]}`} onBack={() => nav('/trips')} />
      <div className="px-5 pb-6">
        <PhotoCard src={trip.image} title={trip.title} sub={fmtRange(parseISO(trip.start), parseISO(trip.end))} height="h-[110px]" />
        <p className="mt-3"><span className="rounded bg-sable px-2.5 py-1 text-[11px] font-bold">À VENIR</span></p>
        <h2 className="t-section mt-5">Avant le départ</h2>
        <ul className="mt-1">{T.before.map(([a, b], i) => {
          const Icon = ICONS[i];
          return <li key={a}><button onClick={() => showToast('Disponible dans une prochaine version du prototype')} className="flex w-full items-center gap-3 border-t border-trait py-3 text-left"><Icon size={18} /><span className="flex-1 text-[14px] font-bold">{a}</span><span className="t-small flex items-center gap-1 text-muted">{b}<ChevronRight size={14} /></span></button></li>;
        })}</ul>
        <div className="mt-5 flex items-baseline justify-between"><h2 className="t-section">Programme du {fmtDayMonth(parseISO(trip.start))}</h2><span className="t-small text-muted">{T.program.length} étapes</span></div>
        <ol className="mt-2">{T.program.map(([time, title, sub], i) => (
          <li key={title} className="flex items-start gap-3 border-t border-trait py-3"><StepBadge n={i + 1} /><span className="w-11 pt-0.5 text-[13px] font-bold">{time}</span><span className="min-w-0 flex-1"><span className="t-h3 block text-[15px]">{title}</span><span className="t-small block text-muted">{sub}</span></span></li>
        ))}</ol>
      </div>
    </>
  );
}
