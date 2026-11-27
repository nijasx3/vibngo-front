import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Footer, Header } from '../components/ui';
import { useStore } from '../state/store';
import { fmtDayMonth, parseISO } from '../lib/dates';

export default function Transport() {
  const nav = useNavigate();
  const from = useSearchParams()[0].get('from') === 'trip' ? 'trip' : 'proposal';
  const { proposal, user } = useStore();
  const it = from === 'trip' ? user?.current_itinerary : proposal;
  if (!it) return <Navigate to="/create" replace />;
  const block = (label: string, value: string) => <div className="rounded-lg bg-sable px-4 py-3"><div className="t-label">{label}</div><div className="t-body mt-0.5 text-muted">{value}</div></div>;
  return (
    <>
      <Header title="Transport et séjour" subtitle={it.source === 'vibi' ? `Proposé par Vibi · ${fmtDayMonth(parseISO(it.startDate))} → ${fmtDayMonth(parseISO(it.endDate))}` : undefined} onBack={() => nav(from === 'trip' ? '/trip' : '/proposal')} />
      <div className="flex flex-col gap-2 px-5 pb-4">
        <h2 className="t-section mt-1">Transport aller-retour</h2>
        {block(`Aller · ${fmtDayMonth(parseISO(it.startDate))}`, it.transportOut)}
        {block(`Retour · ${fmtDayMonth(parseISO(it.endDate))}`, it.transportBack)}
        <h2 className="t-section mt-4">Hébergement</h2>
        {block('À proximité du programme', it.lodging)}
        <h2 className="t-section mt-4">Restauration</h2>
        {block('Sur ton parcours · Jour 1', it.days[0]?.find((s) => s.sub.startsWith('Déjeuner'))?.title ? `Déjeuner chez ${it.days[0].find((s) => s.sub.startsWith('Déjeuner'))!.title.replace(' Restaurant', '')}` : 'À organiser')}
      </div>
      <div className="flex-1" />
      <Footer><Button onClick={() => nav(from === 'trip' ? '/trip' : '/proposal')}>Retour au programme</Button></Footer>
    </>
  );
}
