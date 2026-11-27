import { useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Download, Pencil, Plus } from 'lucide-react';
import { Button, Field, Footer, Header, PhotoCard, PickerSheet, Sheet, StepBadge, cx } from '../components/ui';
import { tripTemplate } from '../api/mockApi';
import { useStore } from '../state/store';
import { diffDays, fmtDayShort, fmtDayMonth, iso, parseISO, today } from '../lib/dates';
import { tripSub } from '../lib/itinerary';
import type { Itinerary, Souvenir } from '../types';

const FEELINGS = tripTemplate.feelings as string[];
const MAX_PHOTOS = 3;
const jOf = (it: Itinerary, s: Souvenir) => diffDays(parseISO(s.date), parseISO(it.startDate)) + 1;

function SouvenirCard({ it, s, onEdit }: { it: Itinerary; s: Souvenir; onEdit?: () => void }) {
  return (
    <article data-testid="souvenir" className="rounded-lg bg-sable p-3">
      <div className="flex items-center gap-2">
        <span className="rounded-[4px] bg-rouille px-1.5 py-0.5 text-[11px] font-bold text-white">J{jOf(it, s)}</span>
        <h3 className="t-h3 flex-1 text-[14px]">{fmtDayShort(parseISO(s.date))} · {s.title}</h3>
        {onEdit && <button aria-label={`Modifier le souvenir ${s.title}`} data-testid="edit-souvenir" onClick={onEdit} className="p-1"><Pencil size={16} /></button>}
      </div>
      <div className="mt-2 flex gap-3">
        {s.photos[0] && <img src={s.photos[0]} alt="" className="h-[72px] w-[72px] shrink-0 rounded-md object-cover" />}
        <div className="min-w-0 flex-1">
          {s.text && <p className="t-small text-[12px] leading-snug">{s.text}</p>}
          {s.feeling && <span className="mt-1.5 inline-block rounded bg-white px-2 py-0.5 text-[10px] font-bold">{s.feeling}</span>}
          {s.photos.length > 1 && <span className="t-small ml-2 text-[10px] text-muted">+{s.photos.length - 1} photo{s.photos.length > 2 ? 's' : ''}</span>}
        </div>
      </div>
    </article>
  );
}

/** Carnet de voyage : souvenirs jour par jour. */
export function Carnet() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  const souvenirs = useStore((s) => s.souvenirs);
  const pub = useStore((s) => s.carnetPublic);
  if (!it) return <Navigate to="/trips" replace />;
  const days = new Set(souvenirs.map((s) => s.date)).size;
  const total = it.days.length;
  return (
    <>
      <Header title="Carnet de voyage" onBack={() => nav('/trip')}
        right={souvenirs.length > 0 ? <button aria-label="Aperçu et export PDF" data-testid="preview" onClick={() => nav('/carnet/preview')} className="p-2"><Download size={20} /></button> : undefined} />
      <div className="px-5 pb-4">
        <PhotoCard src="rome.jpg" title={it.title} sub={tripSub(it)} height="h-[110px]" />
        {souvenirs.length === 0 ? (
          <div className="px-2 py-10 text-center">
            <h2 className="t-h3 text-[16px]">Aucun souvenir pour le moment</h2>
            <p className="t-body mx-auto mt-2 max-w-[270px] text-muted">Ajoute une photo et quelques mots pour garder une trace de ton voyage.</p>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            <Field label="Visibilité du carnet" value={pub ? 'Public' : 'Privé'} onClick={() => nav('/carnet/visibility')} />
            <Button variant="light" stripe={false} data-testid="add-souvenir-inline" onClick={() => nav('/carnet/new')}><Plus size={16} className="mr-1.5" />Ajouter un souvenir</Button>
            <div className="flex items-center gap-3"><span className="t-label">Souvenirs enregistrés</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-trait"><span className="block h-full bg-orange" style={{ width: `${Math.min(100, (days / total) * 100)}%` }} /></span>
              <span data-testid="progress" className="t-small font-bold">{days} / {total} jours</span></div>
            <div className="flex flex-col gap-2.5">{souvenirs.map((s) => <SouvenirCard key={s.id} it={it} s={s} onEdit={() => nav(`/carnet/edit/${s.id}`)} />)}</div>
          </div>
        )}
      </div>
      <div className="flex-1" />
      {souvenirs.length === 0 && <Footer><Button data-testid="add-souvenir" onClick={() => nav('/carnet/new')}>Ajouter un souvenir</Button></Footer>}
    </>
  );
}

/** Ajout / modification d’un souvenir (photos : 0 à 3, choisies depuis l’appareil). */
export function SouvenirForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const it = useStore((s) => s.user!.current_itinerary);
  const existing = useStore((s) => s.souvenirs.find((x) => x.id === id));
  const { addSouvenir, updateSouvenir, removeSouvenir, showToast } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const clamp = (d: string) => (it ? (d < it.startDate ? it.startDate : d > it.endDate ? it.endDate : d) : d);
  const [date, setDate] = useState(() => existing?.date ?? clamp(iso(today())));
  const [title, setTitle] = useState(existing?.title ?? '');
  const [text, setText] = useState(existing?.text ?? '');
  const [feeling, setFeeling] = useState(existing?.feeling ?? '');
  const [photos, setPhotos] = useState<string[]>(existing?.photos ?? []);
  const [sheet, setSheet] = useState<null | 'date' | 'feeling'>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  if (!it || (id && !existing)) return <Navigate to="/carnet" replace />;
  const valid = title.trim().length > 0 && (text.trim().length > 0 || photos.length > 0) && date >= it.startDate && date <= it.endDate;

  if (viewing !== null && photos[viewing]) {
    return (
      <>
        <Header title="Photo du souvenir" onBack={() => setViewing(null)} />
        <div className="px-5 pb-4"><img src={photos[viewing]} alt="Photo du souvenir" data-testid="photo-view" className="max-h-[520px] w-full rounded-xl object-cover" /></div>
        <div className="flex-1" />
        <Footer><Button data-testid="delete-photo" onClick={() => { setPhotos(photos.filter((_, i) => i !== viewing)); setViewing(null); }}>Supprimer</Button></Footer>
      </>
    );
  }
  const onFile = (f?: File | null) => { if (f && photos.length < MAX_PHOTOS) setPhotos([...photos, URL.createObjectURL(f)]); if (fileRef.current) fileRef.current.value = ''; };
  const save = () => {
    const data = { date, title: title.trim(), text: text.trim(), feeling, photos };
    if (existing) { updateSouvenir(existing.id, data); showToast('Souvenir modifié'); nav('/carnet', { replace: true }); return; }
    addSouvenir(data);
    showToast('Souvenir enregistré');
    nav('/carnet', { replace: true });
  };
  const input = 't-body mt-0.5 block w-full bg-transparent placeholder:text-muted focus:outline-none';
  const d = parseISO(date);
  return (
    <>
      <Header title={existing ? 'Modifier le souvenir' : 'Ajouter un souvenir'} subtitle={it.destination} onBack={() => nav('/carnet')} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        <Field label="Date" value={`${fmtDayMonth(d)} ${d.getFullYear()}`} onClick={() => setSheet('date')} />
        <Field label="Titre"><input aria-label="Titre" data-testid="s-title" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder="Donne un titre à ton souvenir" className={input} /></Field>
        <Field label="Souvenir"><textarea aria-label="Souvenir" data-testid="s-text" value={text} maxLength={400} rows={3} onChange={(e) => setText(e.target.value)} placeholder="Raconte un moment de ta journée…" className={cx(input, 'resize-none')} /></Field>
        <Field label="Ressenti" value={feeling} placeholder="Choisir un ressenti" onClick={() => setSheet('feeling')} />
        <div className="mt-2 flex items-baseline justify-between"><h2 className="t-section">Photos</h2><span data-testid="photo-count" className="t-small text-muted">{photos.length} / {MAX_PHOTOS} photos</span></div>
        <div className="flex gap-2">
          {photos.map((p, i) => <button key={p} aria-label={`Voir la photo ${i + 1}`} data-testid="photo-thumb" onClick={() => setViewing(i)} className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-md"><img src={p} alt="" className="h-full w-full object-cover" /></button>)}
          <button data-testid="add-photo" disabled={photos.length >= MAX_PHOTOS} onClick={() => fileRef.current?.click()} className="flex h-[52px] items-center gap-1.5 rounded-md bg-sable px-3 text-[12px] font-medium disabled:opacity-40"><Plus size={14} />Ajouter une photo</button>
          <input ref={fileRef} type="file" accept="image/*" hidden data-testid="photo-input" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      </div>
      <div className="flex-1" />
      <Footer>
        <Button data-testid="save-souvenir" disabled={!valid} onClick={save}>Enregistrer</Button>
        {existing && <Button variant="light" stripe={false} data-testid="remove-souvenir" onClick={() => { removeSouvenir(existing.id); showToast('Souvenir supprimé'); nav('/carnet', { replace: true }); }}>Supprimer le souvenir</Button>}
      </Footer>
      <Sheet open={sheet === 'date'} onClose={() => setSheet(null)} title="Date du souvenir">
        <input type="date" aria-label="Date du souvenir" min={it.startDate} max={it.endDate} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="t-body w-full rounded-lg bg-sable px-4 py-3 focus:outline-none" />
        <p className="t-small mt-2 text-muted">Pendant ton voyage : du {fmtDayMonth(parseISO(it.startDate))} au {fmtDayMonth(parseISO(it.endDate))}.</p>
        <div className="mt-3"><Button onClick={() => setSheet(null)}>Valider</Button></div>
      </Sheet>
      <PickerSheet open={sheet === 'feeling'} onClose={() => setSheet(null)} title="Ressenti" options={FEELINGS.map((f) => ({ label: f, value: f }))} value={feeling} onPick={setFeeling} />
    </>
  );
}

/** Aperçu du carnet avant export PDF. */
export function CarnetPreview() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  const souvenirs = useStore((s) => s.souvenirs);
  const showToast = useStore((s) => s.showToast);
  if (!it || souvenirs.length === 0) return <Navigate to="/carnet" replace />;
  return (
    <>
      <Header title="Aperçu du carnet" subtitle={`Document PDF · ${souvenirs.length} souvenir${souvenirs.length > 1 ? 's' : ''}`} onBack={() => nav('/carnet')} />
      <div className="mx-5 mb-4 rounded-xl bg-white p-3 shadow-[0_1px_6px_rgba(90,46,31,.12)]">
        <PhotoCard src="rome.jpg" title={it.title} sub={tripSub(it)} height="h-[100px]" />
        <h2 className="t-section mb-2 mt-4">Souvenirs de voyage</h2>
        <div className="flex flex-col gap-3">
          {souvenirs.map((s) => (
            <div key={s.id} data-testid="preview-souvenir" className="flex gap-2.5">
              {s.photos[0] ? <img src={s.photos[0]} alt="" className="h-[64px] w-[64px] shrink-0 rounded-md object-cover" /> : <StepBadge n={jOf(it, s)} />}
              <div className="min-w-0 flex-1"><div className="t-h3 text-[13px]"><span className="mr-1.5 rounded-[4px] bg-rouille px-1 py-0.5 text-[10px] text-white">J{jOf(it, s)}</span>{fmtDayShort(parseISO(s.date))} · {s.title}</div>
                {s.text && <p className="t-small mt-0.5 text-[11px]">{s.text}</p>}{s.feeling && <span className="mt-1 inline-block rounded bg-sable px-1.5 py-0.5 text-[10px] font-bold">{s.feeling}</span>}</div>
            </div>))}
        </div>
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="export-pdf" onClick={() => showToast('Carnet exporté en PDF (simulation)')}>Exporter en PDF</Button></Footer>
    </>
  );
}

/** Visibilité du carnet : privé (par défaut) ou public. */
export function CarnetVisibility() {
  const nav = useNavigate();
  const pub = useStore((s) => s.carnetPublic);
  const { setCarnetPublic, showToast } = useStore();
  const opt = (value: boolean, label: string, text: string) => (
    <button data-testid={value ? 'vis-public' : 'vis-private'} aria-pressed={pub === value} onClick={() => { setCarnetPublic(value); showToast(`Carnet ${value ? 'public' : 'privé'}`); nav('/carnet', { replace: true }); }}
      className={cx('block w-full rounded-lg bg-sable px-4 py-3 text-left', pub === value && 'border-l-[3px] border-orange')}>
      <span className="t-label block">{label}</span><span className="t-body mt-0.5 block">{text}</span>
    </button>
  );
  return (
    <>
      <Header title="Visibilité du carnet" subtitle="Choisis qui peut le consulter." onBack={() => nav('/carnet')} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        {opt(false, 'Privé', 'Visible uniquement par toi')}
        {opt(true, 'Public', 'Visible sur ton profil par les vibers')}
      </div>
    </>
  );
}
