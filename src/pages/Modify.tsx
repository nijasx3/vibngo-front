import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, GripVertical, X } from 'lucide-react';
import { Button, Footer, Header, StepBadge } from '../components/ui';
import { useStore } from '../state/store';
import { moveStop, removeStop } from '../lib/itinerary';
import { addDays, fmtLong, parseISO } from '../lib/dates';

/** Modifier le programme d'une journée : réorganiser (boutons ↑ ↓) ou retirer des étapes. */
export default function Modify() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const from = sp.get('from') === 'trip' ? 'trip' : 'proposal';
  const { proposal, user, setProposal, updateItinerary, showToast } = useStore();
  const source = from === 'trip' ? user?.current_itinerary ?? null : proposal;
  const [work, setWork] = useState(source);
  const [note, setNote] = useState('');
  const di = Math.min(Math.max(Number(sp.get('day') ?? 0) || 0, 0), (source?.days.length ?? 1) - 1);
  if (!source || !work) return <Navigate to="/create" replace />;
  const stops = work.days[di];
  const back = from === 'trip' ? '/trip' : '/proposal';
  const move = (i: number, to: number) => {
    if (to < 0 || to >= stops.length) return;
    setWork(moveStop(work, di, i, to));
    setNote(`« ${stops[i].title} » passe ${to < i ? 'avant' : 'après'} « ${stops[to].title} ».`);
  };
  const apply = () => {
    if (from === 'trip') updateItinerary(() => work); else setProposal(work);
    showToast('Programme mis à jour');
    nav(back, { replace: true });
  };
  return (
    <>
      <Header title="Modifier le programme" subtitle={`${work.destination} · ${fmtLong(addDays(parseISO(work.startDate), di))}`} onBack={() => nav(back)} />
      <div className="px-5 pb-4">
        <h2 className="t-section">Réorganiser les étapes</h2>
        <p className="t-small mb-3 mt-0.5 text-muted">Utilise les flèches pour déplacer une étape ou la retirer.</p>
        {stops.length === 0 && <p className="t-body text-muted">Aucune étape à modifier.</p>}
        <ol className="flex flex-col gap-2">
          {stops.map((s, i) => (
            <li key={s.id} data-testid="mod-stop" className="flex items-center gap-2 rounded-lg bg-sable px-3 py-3">
              <GripVertical size={16} className="text-muted" aria-hidden /><StepBadge n={i + 1} /><span className="w-11 text-[13px] font-bold">{s.time}</span>
              <span className="min-w-0 flex-1"><span className="t-h3 block text-[14px] leading-tight">{s.title}</span><span className="t-small block text-muted">{s.sub}</span></span>
              <button aria-label={`Monter ${s.title}`} disabled={i === 0} onClick={() => move(i, i - 1)} className="p-1.5 disabled:opacity-25"><ArrowUp size={16} /></button>
              <button aria-label={`Descendre ${s.title}`} disabled={i === stops.length - 1} onClick={() => move(i, i + 1)} className="p-1.5 disabled:opacity-25"><ArrowDown size={16} /></button>
              <button aria-label={`Retirer ${s.title}`} onClick={() => { setWork(removeStop(work, di, s.id)); setNote(`« ${s.title} » retiré du programme.`); }} className="p-1.5"><X size={16} /></button>
            </li>
          ))}
        </ol>
        {note && <p role="status" className="t-small mt-3 rounded-lg border-l-[3px] border-orange bg-sable px-3 py-2">{note}</p>}
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="apply" onClick={apply}>Appliquer</Button></Footer>
    </>
  );
}
