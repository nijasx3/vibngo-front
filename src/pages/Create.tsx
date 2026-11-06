import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Minus, Plus, Sparkles } from 'lucide-react';
import { Badge, Button, Card, Chip, Header, Spinner, cx } from '../components/ui';
import ItemRow from '../components/ItemRow';
import { community_, generateItinerary, itineraryTemplate } from '../api/mockApi';
import { buildItinerary, useStore } from '../state/store';
import { PROFILES } from '../lib/scoring';
import { addDays, fmtLong, parseISO } from '../lib/dates';
import { delayItem, postponeItem, removeItem, replaceItem } from '../lib/itinerary';
import type { Itinerary } from '../types';

const field = 't-body-m min-h-12 w-full rounded-xl border border-line bg-white px-4 text-anthracite placeholder:text-anthracite/40 focus:border-orange focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="t-body-s text-brun">{label}</span>{children}</label>;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>{options.map((o) => <option key={o}>{o}</option>)}</select>;
}

type Phase = 'form' | 'loading' | 'review' | 'done';

export default function Create() {
  const nav = useNavigate();
  const { user, draft, setDraft, saveItinerary, showToast } = useStore();
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<Phase>('form');
  const [it, setIt] = useState<Itinerary | null>(null);
  const profile = PROFILES.find((p) => p.id === user?.traveler_type);
  const datesOk = draft.startDate && draft.endDate && draft.endDate >= draft.startDate;
  const canNext = step === 1 ? draft.destination.trim().length > 0 && !!datesOk : true;

  const generate = async () => {
    setPhase('loading');
    await generateItinerary();
    setIt(buildItinerary(draft.destination.trim(), draft));
    setPhase('review');
  };
  const edit = (fn: (x: Itinerary) => Itinerary | null, err?: string) => setIt((cur) => { if (!cur) return cur; const n = fn(cur); if (!n) { if (err) showToast(err); return cur; } return n; });
  const validate = () => { saveItinerary({ ...it!, validated: true }); setPhase('done'); };

  if (phase === 'loading') {
    return (
      <div className="px-6 pt-24"><Spinner label={`Notre assistant prépare votre itinéraire pour ${draft.destination.trim()}…`} />
        <p className="t-caption text-center text-anthracite/60">Prise en compte de votre profil{profile ? ` « ${profile.name} »` : ''}, de vos centres d'intérêt et de votre budget.</p></div>
    );
  }

  if (phase === 'done' && it) {
    return (
      <div className="fade-up flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <CheckCircle2 size={72} className="text-orange" />
        <h1 className="t-hero text-brun" data-testid="validated">Itinéraire validé !</h1>
        <p className="t-body text-anthracite/80">Votre voyage à {it.destination} est enregistré. Retrouvez-le sur l'accueil et dans votre profil.</p>
        <Button full onClick={() => nav('/itinerary', { replace: true })}>Voir mon itinéraire</Button>
        <Button full variant="outline" onClick={() => nav('/home', { replace: true })}>Retour à l'accueil</Button>
      </div>
    );
  }

  if (phase === 'review' && it) {
    return (
      <div className="fade-up pb-4">
        <Header title="Votre itinéraire" back onBack={() => setPhase('form')} />
        <div className="flex flex-col gap-4 px-4">
          <Card className="!bg-brun !border-brun text-white">
            <p className="t-hero">{it.title} · {it.destination}</p>
            <p className="t-body mt-1 text-white/85">{fmtLong(parseISO(it.startDate))} → {fmtLong(parseISO(it.endDate))} · {it.travelers} voyageur{it.travelers > 1 ? 's' : ''}</p>
            {profile && <p className="t-caption mt-2 flex items-center gap-1 text-white/85"><Sparkles size={12} />Adapté à votre profil : {profile.name}</p>}
          </Card>
          <p className="t-caption text-anthracite/60">Touchez « … » sur une activité pour la retarder, la reporter, la remplacer ou la supprimer.</p>
          {it.days.map((d, di) => (
            <section key={d.label} className="flex flex-col gap-2">
              <h2 className="t-section text-brun">{d.label} <span className="font-normal text-anthracite/60">· {fmtLong(addDays(parseISO(it.startDate), di))}</span></h2>
              {d.items.map((item) => (
                <ItemRow key={item.id} item={item} actions={{
                  onDelay: () => edit((x) => delayItem(x, item.id)),
                  onPostpone: () => edit((x) => postponeItem(x, item.id), "C'est le dernier jour : impossible de reporter."),
                  onReplace: () => edit((x) => replaceItem(x, item.id), 'Aucune alternative disponible pour cette activité.'),
                  onDelete: () => edit((x) => removeItem(x, item.id)),
                }} />
              ))}
              {d.items.length === 0 && <p className="t-body text-anthracite/60">Journée libre.</p>}
            </section>
          ))}
          <Button full onClick={validate} data-testid="validate">Valider l'itinéraire</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up pb-6">
      <Header title="Créer un itinéraire" back onBack={() => (step > 1 ? setStep(step - 1) : nav(-1))} />
      <div className="flex flex-col gap-4 px-4">
        <div className="flex items-center gap-2 px-6" aria-label={`Étape ${step} sur 3`}>
          {[1, 2, 3].map((n, i) => (
            <div key={n} className="flex flex-1 items-center gap-2 last:flex-none">
              <span className={cx('t-card flex h-7 w-7 shrink-0 items-center justify-center rounded-full', n <= step ? 'bg-orange text-white' : 'border border-line bg-white text-anthracite/60')}>{n}</span>
              {i < 2 && <span className={cx('h-0.5 flex-1', n < step ? 'bg-orange' : 'bg-line')} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <Field label="Destination"><input className={field} value={draft.destination} onChange={(e) => setDraft({ destination: e.target.value })} placeholder="Où souhaitez-vous partir ?" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Départ"><input type="date" className={field} value={draft.startDate} onChange={(e) => setDraft({ startDate: e.target.value, endDate: draft.endDate < e.target.value ? e.target.value : draft.endDate })} /></Field>
              <Field label="Retour"><input type="date" className={field} min={draft.startDate} value={draft.endDate} onChange={(e) => setDraft({ endDate: e.target.value })} /></Field>
            </div>
            {!datesOk && <p className="t-caption text-orange-dark">La date de retour doit être après la date de départ.</p>}
            <Field label="Voyageurs">
              <div className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-2">
                <span className="t-body-m">{draft.travelers} voyageur{draft.travelers > 1 ? 's' : ''}</span>
                <span className="flex items-center gap-2">
                  <button aria-label="Moins de voyageurs" disabled={draft.travelers <= 1} onClick={() => setDraft({ travelers: draft.travelers - 1 })} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-brun disabled:opacity-30"><Minus size={16} /></button>
                  <button aria-label="Plus de voyageurs" disabled={draft.travelers >= 8} onClick={() => setDraft({ travelers: draft.travelers + 1 })} className="flex h-10 w-10 items-center justify-center rounded-full bg-orange text-white disabled:opacity-30"><Plus size={16} /></button>
                </span>
              </div>
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Budget"><Select value={draft.budget} onChange={(v) => setDraft({ budget: v })} options={['500 €', '800 €', '1 200 €', '2 000 € et plus']} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Transport aller"><Select value={draft.transportOut} onChange={(v) => setDraft({ transportOut: v })} options={['Avion', 'Train', 'Voiture', 'Bus']} /></Field>
              <Field label="Transport retour"><Select value={draft.transportBack} onChange={(v) => setDraft({ transportBack: v })} options={['Avion', 'Train', 'Voiture', 'Bus']} /></Field>
            </div>
            <Field label="Hébergement"><Select value={draft.lodging} onChange={(v) => setDraft({ lodging: v })} options={['Hôtel', 'Appartement', 'Auberge de jeunesse', 'Chez des amis']} /></Field>
            <Field label="Contraintes (optionnel)"><textarea rows={3} className={cx(field, 'py-3')} value={draft.constraints} onChange={(e) => setDraft({ constraints: e.target.value })} placeholder="Ex. : mobilité réduite, régime alimentaire…" /></Field>
          </>
        )}

        {step === 3 && (
          <>
            <section className="flex flex-col gap-2">
              <h2 className="t-section text-brun">Centres d'intérêt prioritaires</h2>
              <div className="flex flex-wrap gap-2">
                {itineraryTemplate.interests.map((i) => {
                  const on = draft.interests.includes(i);
                  return <Chip key={i} active={on} onClick={() => setDraft({ interests: on ? draft.interests.filter((x) => x !== i) : [...draft.interests, i] })}>{i}</Chip>;
                })}
              </div>
            </section>
            <section className="flex flex-col gap-2">
              <h2 className="t-section text-brun">Inviter des amis à collaborer</h2>
              {community_.friends.map((f) => {
                const on = draft.invited.includes(f.id);
                return (
                  <label key={f.id} className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-white px-3">
                    <input type="checkbox" checked={on} onChange={() => setDraft({ invited: on ? draft.invited.filter((x) => x !== f.id) : [...draft.invited, f.id] })} className="h-5 w-5 accent-[#e86c3c]" />
                    <span className="t-body-m flex-1 text-brun">{f.name}</span>{f.id === 'paul' && <Badge tone="orange">À Rome</Badge>}
                  </label>
                );
              })}
            </section>
            <Card className="!bg-orange/10 !border-orange/30"><p className="t-body text-brun">Notre assistant va composer un itinéraire à partir de votre profil, de vos centres d'intérêt et de vos contraintes. Vous pourrez ensuite le modifier avant de le valider.</p></Card>
          </>
        )}

        <div className="flex gap-3 pt-2">
          {step < 3 ? <Button full disabled={!canNext} onClick={() => setStep(step + 1)}>Suivant</Button>
            : <Button full onClick={generate} data-testid="generate"><Sparkles size={18} />Générer avec l'IA</Button>}
        </div>
      </div>
    </div>
  );
}
