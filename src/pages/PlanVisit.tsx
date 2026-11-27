import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Empty, Field, Footer, Header, PhotoCard, PickerSheet, Sheet } from '../components/ui';
import { placeById, tripTemplate } from '../api/mockApi';
import { useStore } from '../state/store';
import { addStop, dayIndex, tripSub, uid } from '../lib/itinerary';
import { addDays, fmtLong, parseISO } from '../lib/dates';

const DURATIONS = tripTemplate.durations as string[];

/** Depuis une fiche lieu : choisir le voyage auquel ajouter l’étape (ou en créer un). */
export function ChooseTrip() {
  const nav = useNavigate();
  const id = useSearchParams()[0].get('place') ?? '';
  const place = placeById(id);
  const it = useStore((s) => s.user!.current_itinerary);
  if (!place) return <Navigate to="/explore" replace />;
  return (
    <>
      <Header title="Choisir un voyage" subtitle={place.name} />
      <div className="px-5 pb-4">
        {it
          ? <div data-testid="choose-trip"><PhotoCard src="rome.jpg" title={it.destination} sub={tripSub(it)} height="h-[130px]" onClick={() => nav(`/plan/visit?place=${id}&target=trip`)} /></div>
          : <Empty title="Aucun voyage enregistré" text="Crée un voyage pour y ajouter cette étape." />}
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="new-trip" onClick={() => nav(`/manual?place=${id}`)}>Créer un voyage</Button></Footer>
    </>
  );
}

/** Planifier la visite : jour, heure, durée et note, puis ajout au programme (voyage enregistré ou brouillon en cours de création). */
export function PlanVisit() {
  const nav = useNavigate();
  const q = useSearchParams()[0];
  const place = placeById(q.get('place') ?? '');
  const toDraft = q.get('target') === 'draft';
  const { user, draft, addDraftStop, updateItinerary, showToast } = useStore();
  const base = toDraft ? draft : user?.current_itinerary;
  const [day, setDay] = useState(() => (!toDraft && user?.current_itinerary ? Math.min(Math.max(dayIndex(user.current_itinerary), 0), user.current_itinerary.days.length - 1) : 0));
  const [time, setTime] = useState(toDraft ? '09:00' : '10:00');
  const [dur, setDur] = useState('2 h');
  const [note, setNote] = useState('');
  const [sheet, setSheet] = useState<null | 'day' | 'time' | 'dur'>(null);
  if (!place || !base) return <Navigate to={place ? `/plan?place=${place.id}` : '/explore'} replace />;
  const start = parseISO(base.startDate);
  const dayLabel = (i: number) => fmtLong(addDays(start, i));
  const add = () => {
    const stop = { id: uid(), time, title: place.name, sub: `${place.typeLabel} · ${dur}${note.trim() ? ` · ${note.trim()}` : ''}` };
    if (toDraft) { addDraftStop(day, stop); nav('/manual/program', { replace: true }); return; }
    updateItinerary((x) => addStop(x, day, stop));
    showToast(`${place.name} ajouté au ${dayLabel(day).toLowerCase()}`);
    nav(`/trip?day=${day}`, { replace: true });
  };
  return (
    <>
      <Header title="Planifier la visite" subtitle={`${base.destination} · ${dayLabel(0)}`} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        <Field label="Activité" value={place.name} />
        <Field label="Jour" value={dayLabel(day)} onClick={() => setSheet('day')} />
        <Field label="Heure" value={time} onClick={() => setSheet('time')} />
        <Field label="Durée" value={dur} onClick={() => setSheet('dur')} />
        <Field label="Note facultative"><textarea aria-label="Note facultative" data-testid="plan-note" rows={3} maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note…" className="t-body mt-0.5 block w-full resize-none bg-transparent placeholder:text-muted focus:outline-none" /></Field>
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="plan-add" disabled={!time} onClick={add}>Ajouter</Button></Footer>
      <PickerSheet open={sheet === 'day'} onClose={() => setSheet(null)} title="Jour" options={base.days.map((_, i) => ({ label: dayLabel(i), value: String(i) }))} value={String(day)} onPick={(v) => setDay(Number(v))} />
      <PickerSheet open={sheet === 'dur'} onClose={() => setSheet(null)} title="Durée" options={DURATIONS.map((d) => ({ label: d, value: d }))} value={dur} onPick={setDur} />
      <Sheet open={sheet === 'time'} onClose={() => setSheet(null)} title="Heure">
        <input type="time" aria-label="Heure" value={time} onChange={(e) => setTime(e.target.value)} className="t-body w-full rounded-lg bg-sable px-4 py-3 focus:outline-none" />
        <div className="mt-3"><Button onClick={() => setSheet(null)}>Valider</Button></div>
      </Sheet>
    </>
  );
}
