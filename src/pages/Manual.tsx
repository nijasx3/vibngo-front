import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button, Field, Footer, Header, ListRow, PickerSheet, Sheet, StepBadge } from '../components/ui';
import { tripTemplate } from '../api/mockApi';
import { buildManualItinerary, emptyDays, uid } from '../lib/itinerary';
import { useStore } from '../state/store';
import { addDays, fmtLong, fmtRange, parseISO, iso, today } from '../lib/dates';

const BUDGETS = ['Moins de 500 €', 'Entre 500 € et 1 000 €', 'Entre 1 000 € et 2 000 €', 'Plus de 2 000 €'].map((v) => ({ label: v, value: v }));
const OUT = ['Avion · Depuis Paris CDG', 'Train · Depuis Paris', 'Voiture', 'Autocar', 'À décider'].map((v) => ({ label: v, value: v }));
const BACK = ['Rome · Ville d’arrivée', 'Autre ville · Exemple : Florence', 'À décider plus tard'].map((v) => ({ label: v, value: v }));
const LODGING = ['Hôtel · Centre-ville', 'Appartement', 'Auberge', 'À décider'].map((v) => ({ label: v, value: v }));

/** Étape 1 : destination, dates et budget. */
export function ManualForm() {
  const nav = useNavigate();
  const { draft, setDraft } = useStore();
  const [pick, setPick] = useState<null | 'budget' | 'out' | 'back' | 'lodging' | 'dates'>(null);
  const [dates, setDates] = useState({ s: draft.startDate, e: draft.endDate });
  const min = iso(today());
  const valid = dates.s >= min && dates.e >= dates.s;
  const applyDates = () => { setDraft({ startDate: dates.s, endDate: dates.e, days: emptyDays(dates.s, dates.e) }); setPick(null); };
  return (
    <>
      <Header title="Créer un voyage" subtitle="Destination, dates et budget" onBack={() => nav('/create')} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        <Field accent label="Destination" value={draft.destination} />
        <Field label="Dates" value={fmtRange(parseISO(draft.startDate), parseISO(draft.endDate))} onClick={() => { setDates({ s: draft.startDate, e: draft.endDate }); setPick('dates'); }} />
        <Field label="Budget" value={draft.budget} onClick={() => setPick('budget')} />
        <Field label="Transport aller" value={draft.transportOut} onClick={() => setPick('out')} />
        <Field label="Départ du retour" value={draft.transportBack} onClick={() => setPick('back')} />
        <Field label="Hébergement" value={draft.lodging} onClick={() => setPick('lodging')} />
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="continue" onClick={() => nav('/manual/program')}>Continuer</Button></Footer>
      <PickerSheet open={pick === 'budget'} onClose={() => setPick(null)} title="Budget" options={BUDGETS} value={draft.budget} onPick={(v) => setDraft({ budget: v })} />
      <PickerSheet open={pick === 'out'} onClose={() => setPick(null)} title="Transport aller" options={OUT} value={draft.transportOut} onPick={(v) => setDraft({ transportOut: v })} />
      <PickerSheet open={pick === 'back'} onClose={() => setPick(null)} title="Ville de retour" options={BACK} value={draft.transportBack} onPick={(v) => setDraft({ transportBack: v })} />
      <PickerSheet open={pick === 'lodging'} onClose={() => setPick(null)} title="Hébergement" options={LODGING} value={draft.lodging} onPick={(v) => setDraft({ lodging: v })} />
      <Sheet open={pick === 'dates'} onClose={() => setPick(null)} title="Dates du voyage">
        <div className="flex flex-col gap-2.5">
          <label className="block rounded-lg bg-sable px-4 py-3"><span className="t-label block">Départ</span><input type="date" min={min} value={dates.s} onChange={(e) => setDates({ s: e.target.value, e: e.target.value > dates.e ? e.target.value : dates.e })} aria-label="Date de départ" className="t-body mt-1 w-full bg-transparent focus:outline-none" /></label>
          <label className="block rounded-lg bg-sable px-4 py-3"><span className="t-label block">Retour</span><input type="date" min={dates.s || min} value={dates.e} onChange={(e) => setDates({ ...dates, e: e.target.value })} aria-label="Date de retour" className="t-body mt-1 w-full bg-transparent focus:outline-none" /></label>
          <Button disabled={!valid} onClick={applyDates}>Appliquer</Button>
        </div>
      </Sheet>
    </>
  );
}

/** Étape 2 : programme jour par jour. */
export function ManualProgram() {
  const nav = useNavigate();
  const { draft, saveItinerary, showToast } = useStore();
  const total = draft.days.reduce((n, d) => n + d.length, 0);
  const save = () => {
    if (total === 0) return showToast('Ajoute au moins une activité avant d’enregistrer.');
    saveItinerary(buildManualItinerary(draft));
    nav('/trip-saved');
  };
  return (
    <>
      <Header title="Mon itinéraire" subtitle={`${draft.destination} · ${fmtRange(parseISO(draft.startDate), parseISO(draft.endDate))}`} onBack={() => nav('/manual')} />
      <div className="flex flex-col gap-5 px-5 pb-4">
        {draft.days.map((stops, di) => (
          <section key={di} data-testid={`manual-day-${di + 1}`}>
            <h2 className="t-section text-[18px]">Jour {di + 1} · {fmtLong(addDays(parseISO(draft.startDate), di))}</h2>
            {stops.length === 0 && <p className="t-body mt-2 text-muted">Aucune activité prévue pour cette journée.</p>}
            <ol>{stops.map((s, i) => (
              <li key={s.id} data-testid="stop" className="flex items-start gap-3 border-b border-trait py-3"><StepBadge n={i + 1} /><span className="w-11 pt-0.5 text-[13px] font-bold">{s.time}</span><span className="min-w-0 flex-1"><span className="t-h3 block text-[15px]">{s.title}</span><span className="t-small block text-muted">{s.sub}</span></span></li>
            ))}</ol>
            <button data-testid={`add-activity-${di + 1}`} onClick={() => nav(`/manual/add?day=${di}`)} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sable text-[13px] font-bold"><Plus size={14} />Ajouter une activité</button>
          </section>
        ))}
      </div>
      <div className="flex-1" />
      <Footer>
        <Button onClick={() => nav('/manual/free?day=0')}>Ajouter du temps libre</Button>
        <Button data-testid="validate" onClick={save}>Enregistrer le voyage</Button>
      </Footer>
    </>
  );
}

/** Choix d'une activité à ajouter à une journée. */
export function ManualAdd() {
  const nav = useNavigate();
  const sp = useSearchParams()[0];
  const { draft } = useStore();
  const day = Math.min(Math.max(Number(sp.get('day') ?? 0) || 0, 0), draft.days.length - 1);
  const [q, setQ] = useState('');
  const list = tripTemplate.suggestions.filter(([n]) => n.toLowerCase().includes(q.toLowerCase()));
  const go = (name: string, sub: string) => nav(`/manual/form?day=${day}&name=${encodeURIComponent(name)}&sub=${encodeURIComponent(sub)}`);
  return (
    <>
      <Header title="Ajouter une activité" subtitle={`${draft.destination} · ${fmtLong(addDays(parseISO(draft.startDate), day))}`} onBack={() => nav('/manual/program')} />
      <div className="px-5 pb-6">
        <label className="flex min-h-11 items-center gap-2 rounded-lg bg-sable px-3"><Search size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une activité…" aria-label="Rechercher une activité" className="t-body flex-1 bg-transparent text-[15px] focus:outline-none" /></label>
        <h2 className="t-section mb-3 mt-5">Suggestions à Rome</h2>
        <div className="flex flex-col gap-2">
          {q.trim() && <ListRow title={`Ajouter « ${q.trim()} »`} sub="Activité personnalisée" onClick={() => go(q.trim(), 'Activité personnalisée')} />}
          {list.map(([name, sub, image]) => <ListRow key={name} testId="suggestion" src={image} title={name} sub={sub} onClick={() => go(name, sub)} />)}
        </div>
      </div>
    </>
  );
}

/** Heure, durée et note de l'activité choisie. */
export function ManualActivityForm() {
  const nav = useNavigate();
  const sp = useSearchParams()[0];
  const { draft, addDraftStop } = useStore();
  const name = sp.get('name') ?? '';
  const sub = sp.get('sub') ?? '';
  const [day, setDay] = useState(Math.min(Math.max(Number(sp.get('day') ?? 0) || 0, 0), draft.days.length - 1));
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('2 h');
  const [note, setNote] = useState('');
  const [pick, setPick] = useState(false);
  if (!name) return <Navigate to="/manual/program" replace />;
  const add = () => {
    addDraftStop(day, { id: uid(), time, title: name, sub: `${sub.split(' · ')[0]} · ${duration}${note.trim() ? ` · ${note.trim()}` : ''}` });
    nav('/manual/program', { replace: true });
  };
  return (
    <>
      <Header title="Ajouter une activité" subtitle={`${draft.destination} · ${fmtLong(addDays(parseISO(draft.startDate), day))}`} onBack={() => nav(-1)} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        <Field label="Activité" value={name} />
        <Field label="Jour" value={fmtLong(addDays(parseISO(draft.startDate), day))} onClick={() => setPick(true)} />
        <Field label="Heure"><input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Heure" className="t-body mt-0.5 block w-full bg-transparent focus:outline-none" /></Field>
        <Field label="Durée"><input value={duration} onChange={(e) => setDuration(e.target.value)} aria-label="Durée" className="t-body mt-0.5 block w-full bg-transparent focus:outline-none" /></Field>
        <Field label="Note facultative"><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Ajouter une note…" aria-label="Note facultative" className="t-body mt-0.5 block w-full resize-none bg-transparent focus:outline-none" /></Field>
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="add" disabled={!time} onClick={add}>Ajouter</Button></Footer>
      <PickerSheet open={pick} onClose={() => setPick(false)} title="Jour" options={draft.days.map((_, i) => ({ label: fmtLong(addDays(parseISO(draft.startDate), i)), value: String(i) }))} value={String(day)} onPick={(v) => setDay(Number(v))} />
    </>
  );
}

/** Temps libre : un créneau pour ses propres activités. */
export function ManualFree() {
  const nav = useNavigate();
  const sp = useSearchParams()[0];
  const { draft, addDraftStop } = useStore();
  const [day, setDay] = useState(Math.min(Math.max(Number(sp.get('day') ?? 0) || 0, 0), draft.days.length - 1));
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('12:00');
  const [end, setEnd] = useState('14:00');
  const [pick, setPick] = useState(false);
  const ok = !!start && !!end && end > start;
  return (
    <>
      <Header title="Ajouter du temps libre" subtitle="Un créneau pour tes propres activités" onBack={() => nav('/manual/program')} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        <Field label="Titre facultatif"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Déjeuner chez des amis" aria-label="Titre" className="t-body mt-0.5 block w-full bg-transparent focus:outline-none" /></Field>
        <Field label="Jour" value={fmtLong(addDays(parseISO(draft.startDate), day))} onClick={() => setPick(true)} />
        <Field label="Début"><input type="time" value={start} onChange={(e) => setStart(e.target.value)} aria-label="Début" className="t-body mt-0.5 block w-full bg-transparent focus:outline-none" /></Field>
        <Field label="Fin"><input type="time" value={end} onChange={(e) => setEnd(e.target.value)} aria-label="Fin" className="t-body mt-0.5 block w-full bg-transparent focus:outline-none" /></Field>
        {!ok && <p className="t-small text-rouille">L’heure de fin doit être après le début.</p>}
      </div>
      <div className="flex-1" />
      <Footer><Button disabled={!ok} onClick={() => { addDraftStop(day, { id: uid(), time: start, title: title.trim() || 'Temps libre', sub: `${start}–${end} · Temps libre` }); nav('/manual/program', { replace: true }); }}>Ajouter au programme</Button></Footer>
      <PickerSheet open={pick} onClose={() => setPick(false)} title="Jour" options={draft.days.map((_, i) => ({ label: fmtLong(addDays(parseISO(draft.startDate), i)), value: String(i) }))} value={String(day)} onPick={(v) => setDay(Number(v))} />
    </>
  );
}
