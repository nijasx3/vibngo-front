import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Field, Footer, Header, Sheet } from '../components/ui';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../state/store';
import { tripTemplate } from '../api/mockApi';
import { fmtDayMonth, fmtRange, iso, parseISO, today } from '../lib/dates';

const B = tripTemplate.bookings;
const fmtHour = (t: string) => { const [h, m] = t.split(':'); return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`; };
export const reminderText = (date: string, time: string) => `${fmtDayMonth(parseISO(date))} à ${fmtHour(time)}`;
const year = (d: string) => parseISO(d).getFullYear();

/** Réservations : vols, hébergement et activités à réserver sur place. */
export function Bookings() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  const reminders = useStore((s) => s.reminders);
  if (!it) return <Navigate to="/trips" replace />;
  const row = (testId: string, label: string, text: string, to?: string) => {
    const inner = <><span className="t-label block">{label}</span><span className="t-body mt-0.5 block">{text}</span></>;
    return to
      ? <button key={testId} data-testid={testId} onClick={() => nav(to)} className="relative block w-full rounded-lg bg-sable px-4 py-3 pr-9 text-left">{inner}<ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2" /></button>
      : <div key={testId} data-testid={testId} className="rounded-lg bg-sable px-4 py-3">{inner}</div>;
  };
  const todo = tripTemplate.toBook[0];
  const rem = reminders.find((r) => r.title === todo);
  return (
    <>
      <Header title="Mes réservations" subtitle={`${it.destination.split(',')[0]} · ${fmtRange(parseISO(it.startDate), parseISO(it.endDate))}`} onBack={() => nav('/trip')} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        {row('book-out', `${B.out.title} · Confirmé`, `${B.out.route} · ${B.out.flight}`, '/trip/flight')}
        {row('book-back', `${B.back.title} · Confirmé`, B.back.route)}
        {row('book-hotel', `${B.hotel.title} · Confirmé`, `${B.hotel.text} · ${fmtRange(parseISO(it.startDate), parseISO(it.endDate)).replace(/ \d{4}$/, '')}`)}
        {row('book-todo', 'À réserver sur place', rem ? `${todo} · Rappel ${reminderText(rem.date, rem.time)}` : todo)}
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="create-reminder" onClick={() => nav('/trip/reminder')}>{rem ? 'Modifier le rappel' : 'Créer un rappel'}</Button></Footer>
    </>
  );
}

/** Détail du vol aller. */
export function Flight() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  if (!it) return <Navigate to="/trips" replace />;
  const d = parseISO(it.startDate);
  return (
    <>
      <Header title="Détail du vol" onBack={() => nav('/trip/bookings')} />
      <div className="px-5 pb-4">
        <h2 className="t-section mb-3 text-[15px]">{B.out.route}</h2>
        <div className="flex flex-col gap-2.5">
          <Field label="Date" value={`${fmtDayMonth(d)} ${d.getFullYear()}`} />
          <Field label="Vol" value={B.out.flight} />
          <Field label="Référence de réservation" value={B.out.ref} />
        </div>
        <p className="t-body mt-4 text-muted">Conserve cette référence pour retrouver ta réservation auprès de la compagnie.</p>
      </div>
    </>
  );
}

/** Création d’un rappel pour l’activité à réserver sur place. */
export function ReminderForm() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  const reminders = useStore((s) => s.reminders);
  const addReminder = useStore((s) => s.addReminder);
  const title = tripTemplate.toBook[0];
  const existing = reminders.find((r) => r.title === title);
  const [date, setDate] = useState(existing?.date ?? it?.startDate ?? iso(today()));
  const [time, setTime] = useState(existing?.time ?? '12:00');
  const [open, setOpen] = useState<null | 'date' | 'time'>(null);
  if (!it) return <Navigate to="/trips" replace />;
  const min = iso(today()) > it.startDate ? iso(today()) : it.startDate;
  const valid = !!date && !!time && date >= min && date <= it.endDate;
  const save = () => { addReminder({ title, date, time }); nav('/trip/reminder-done', { replace: true }); };
  return (
    <>
      <Header title="Créer un rappel" onBack={() => nav('/trip/bookings')} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        <Field label="Activité" value={title} />
        <Field label="Date du rappel" value={`${fmtDayMonth(parseISO(date))} ${year(date)}`} onClick={() => setOpen('date')} />
        <Field label="Heure" value={time} onClick={() => setOpen('time')} />
        <p className="t-body mt-2 text-muted">Vibngo te rappellera de réserver cette visite.</p>
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="save-reminder" disabled={!valid} onClick={save}>Enregistrer</Button></Footer>
      <Sheet open={open === 'date'} onClose={() => setOpen(null)} title="Date du rappel">
        <input type="date" aria-label="Date du rappel" min={min} max={it.endDate} value={date} onChange={(e) => setDate(e.target.value)} className="t-body w-full rounded-lg bg-sable px-4 py-3 focus:outline-none" />
        <div className="mt-3"><Button onClick={() => setOpen(null)}>Valider</Button></div>
      </Sheet>
      <Sheet open={open === 'time'} onClose={() => setOpen(null)} title="Heure du rappel">
        <input type="time" aria-label="Heure du rappel" value={time} onChange={(e) => setTime(e.target.value)} className="t-body w-full rounded-lg bg-sable px-4 py-3 focus:outline-none" />
        <div className="mt-3"><Button onClick={() => setOpen(null)}>Valider</Button></div>
      </Sheet>
    </>
  );
}

/** Confirmation du rappel. */
export function ReminderDone() {
  const nav = useNavigate();
  const q = useSearchParams()[0];
  const title = tripTemplate.toBook[0];
  const rem = useStore((s) => s.reminders.find((r) => r.title === (q.get('t') ?? title)));
  if (!rem) return <Navigate to="/trip/bookings" replace />;
  return (
    <>
      <Header title="Rappel enregistré" back={false} />
      <div className="px-5 pb-4">
        <h2 className="t-section mb-2 text-[15px]">{rem.title}</h2>
        <p data-testid="reminder-text" className="t-body">Rappel prévu le {reminderText(rem.date, rem.time)}.</p>
      </div>
      <div className="flex-1" />
      <Footer><Button onClick={() => nav('/trip/bookings', { replace: true })}>Retour aux réservations</Button></Footer>
    </>
  );
}
