import { useState } from 'react';
import { Camera, Download } from 'lucide-react';
import { Accordion, Button, Header, Visual } from '../components/ui';
import { catalog } from '../api/mockApi';
import { useStore } from '../state/store';
import { addDays, fmtLong, parseISO } from '../lib/dates';

export default function Notebook() {
  const { user, showToast } = useStore();
  const it = user?.current_itinerary;
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  if (!it) return <div><Header title="Carnet de voyage" back /><p className="t-body px-6 pt-10 text-center text-anthracite/80">Créez un itinéraire pour démarrer votre carnet.</p></div>;
  const start = parseISO(it.startDate);
  return (
    <div className="fade-up pb-4">
      <Header title="Carnet de voyage" back />
      <div className="flex flex-col gap-4 px-4">
        <Visual tone="brun" className="h-36 rounded-3xl !items-end !justify-start p-4" label="Couverture">
          <div className="relative text-white"><p className="t-hero">{it.title}</p><p className="t-body">{it.destination} · {it.days.length} jours</p></div>
        </Visual>
        {it.days.map((d, i) => (
          <Accordion key={d.label} title={`${d.label}`} defaultOpen={i === 0} right={<span className="t-caption text-anthracite/60">{fmtLong(addDays(start, i))}</span>}>
            <ul className="flex flex-col gap-2">
              {d.items.map((x) => <li key={x.id} className="flex gap-3"><span className="t-body-s w-11 shrink-0 text-brun">{x.time}</span><span className="t-body-m text-anthracite">{catalog.byId(x.ref)?.name}</span></li>)}
              {d.items.length === 0 && <li className="t-body text-anthracite/60">Journée libre.</li>}
            </ul>
          </Accordion>
        ))}
        <section className="flex flex-col gap-2 rounded-2xl border border-dashed border-brun/40 p-4">
          <h2 className="t-section text-brun">Ajouter un souvenir</h2>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Votre commentaire…" className="t-body-m rounded-xl border border-line bg-white p-3 focus:border-orange focus:outline-none" />
          <div className="flex gap-2">
            <Button variant="outline" className="!min-h-10" onClick={() => showToast('Ajout de photo : fonctionnalité simulée')}><Camera size={16} />Photo</Button>
            <Button className="!min-h-10" disabled={!note.trim()} onClick={() => { setNotes([...notes, note.trim()]); setNote(''); showToast('Souvenir enregistré'); }}>Enregistrer</Button>
          </div>
          {notes.map((n, i) => <p key={i} className="t-body rounded-xl bg-white p-3 text-anthracite/90">{n}</p>)}
        </section>
        <Button full onClick={() => showToast('Export PDF : fonctionnalité simulée')}><Download size={18} />Télécharger le carnet (PDF)</Button>
      </div>
    </div>
  );
}
