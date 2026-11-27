import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button, Footer, Header, PhotoCard } from '../components/ui';
import DayProgram from '../components/DayProgram';
import { useStore } from '../state/store';
import { fmtRange, parseISO } from '../lib/dates';

/** « Ton itinéraire à Rome » proposé par Vibi, à modifier puis enregistrer. */
export default function Proposal() {
  const nav = useNavigate();
  const { proposal: it, saveItinerary } = useStore();
  const [day, setDay] = useState(0);
  if (!it) return <Navigate to="/create" replace />;
  const range = fmtRange(parseISO(it.startDate), parseISO(it.endDate));
  return (
    <>
      <Header title="Ton itinéraire à Rome" subtitle={`Proposé par Vibi · ${range}`} onBack={() => nav('/create')} />
      <div className="px-5 pb-4">
        <PhotoCard src="rome.jpg" title={it.destination} sub={`7 nuits · ${it.travelers} voyageurs`} height="h-[110px]" />
        <button onClick={() => nav('/transport')} className="mt-3 flex w-full items-center justify-between rounded-lg bg-sable px-4 py-3 text-left"><span><span className="t-small block text-muted">Budget estimé · {it.budget}</span><span className="t-h3 text-[14px]">Transport et séjour</span></span><ChevronRight size={18} /></button>
        <div className="mt-4"><DayProgram it={it} day={day} onDay={setDay} /></div>
        <button data-testid="modify-program" onClick={() => nav(`/modify?day=${day}&from=proposal`)} className="mt-3 flex w-full items-center justify-between rounded-lg bg-sable px-4 py-3 text-left text-[14px] font-bold">Modifier l’itinéraire<ChevronRight size={18} /></button>
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="validate" onClick={() => { saveItinerary(it); nav('/trip-saved'); }}>Enregistrer le voyage</Button></Footer>
    </>
  );
}
