import { Navigate, useParams } from 'react-router-dom';
import { Button, Header, Photo } from '../components/ui';
import { eventById } from '../api/mockApi';
import { useStore } from '../state/store';
import { addDays, fmtLong, today } from '../lib/dates';

export default function Event() {
  const { id = '' } = useParams();
  const e = eventById(id);
  const { eventsJoined, toggleEvent } = useStore();
  if (!e) return <Navigate to="/explore?tab=Événements" replace />;
  const on = eventsJoined.includes(e.id);
  const d = addDays(today(), e.dayOffset);
  const seats = e.seats !== undefined ? e.seats - (on ? 1 : 0) : null;
  return (
    <>
      <Header lead={`ÉVÉNEMENT${e.category ? ' / ' + e.category : ''}`} />
      <div className="px-5">
        {e.image && <><Photo src={e.image} className="h-[170px] w-full rounded-xl" />{e.credit && <p className="t-small mt-1 text-[10px] text-muted">{e.credit}</p>}</>}
        <h1 className="t-title mt-3 text-[28px]">{e.title}</h1>
        <p className="t-body mt-1 text-muted">{e.city}{e.city === 'Rome' ? ', Italie' : ''}{e.organizer ? ` · Organisée par ${e.organizer}` : ''}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-sable p-3 text-center">
          <div><div className="t-label">Date</div><div className="t-small mt-0.5">{fmtLong(d).replace(/^(\S+)\s/, (_, a) => `${a.slice(0, 3)}. `)}</div></div>
          <div><div className="t-label">Heure</div><div className="t-small mt-0.5">{e.hour}</div></div>
          <div><div className="t-label">Places</div><div data-testid="seats" className="t-small mt-0.5">{seats !== null ? `${seats} disponibles` : '—'}</div></div>
        </div>
        {e.about && <section className="mt-5"><h2 className="t-section">À propos</h2><p className="t-body mt-1 text-muted">{e.about}</p></section>}
        {e.meeting && <section className="mt-5 rounded-lg border-l-[3px] border-orange bg-sable p-4"><div className="t-micro text-muted">Point de rendez-vous</div><div className="t-h3 mt-1">{e.meeting}</div><div className="t-small text-muted">{e.meetingAddress}</div><div className="t-small mt-1">{e.meetingNote}</div></section>}
        {e.practical && <section className="mt-5"><h2 className="t-section">Infos pratiques</h2><p className="t-body mt-1 text-muted">{e.practical}</p></section>}
      </div>
      <div className="flex-1" />
      <div className="px-5 pb-4 pt-5">{on
        ? <div className="flex flex-col gap-2"><div className="rounded-lg bg-vert py-3 text-center text-[14px] font-bold">Inscrit</div><Button variant="secondary" onClick={() => toggleEvent(e.id)}>Se désinscrire</Button></div>
        : <Button data-testid="event-join" onClick={() => toggleEvent(e.id)}>Inscription</Button>}</div>
    </>
  );
}
