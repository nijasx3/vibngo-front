import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button, Field, Footer, Header, cx } from '../components/ui';
import { useStore } from '../state/store';
import { LEG_LABEL, LEG_MODES, legOptions, shortName } from '../lib/itinerary';
import { tripTemplate } from '../api/mockApi';
import type { Stop } from '../types';

type CompareRow = [string, string | null, string | null, string];
const COMPARE = tripTemplate.compare as unknown as CompareRow[];

/** Retrouve deux étapes d’un jour par leurs identifiants. */
function useStops(): { day: number; a?: Stop; b?: Stop } {
  const it = useStore((s) => s.user!.current_itinerary);
  const q = useSearchParams()[0];
  const day = Number(q.get('day')) || 0;
  const list = it?.days[day] ?? [];
  return { day, a: list.find((s) => s.id === q.get('a')), b: list.find((s) => s.id === q.get('b')) };
}

/** Mode de déplacement entre deux étapes consécutives (À pied / Bus / Taxi). */
export function Leg() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  const setLegMode = useStore((s) => s.setLegMode);
  const showToast = useStore((s) => s.showToast);
  const { day, a, b } = useStops();
  const opts = a && b ? legOptions(a, b) : null;
  if (!it || !a || !b || !opts) return <Navigate to="/trip" replace />;
  const current = it.legModes?.[`${a.title}|${b.title}`] ?? 'walk';
  const back = () => nav(`/trip?day=${day}`, { replace: true });
  return (
    <>
      <Header title="Mode de déplacement" subtitle={`${shortName(a.title)} → ${shortName(b.title)}`} onBack={back} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        {LEG_MODES.map((m) => (
          <button key={m} data-testid={`mode-${m}`} aria-pressed={m === current}
            onClick={() => { setLegMode(a, b, m); showToast(`Trajet : ${LEG_LABEL[m]}`); back(); }}
            className={cx('relative block w-full rounded-lg bg-sable px-4 py-3 text-left', m === current && 'border-l-[3px] border-orange')}>
            <span className="t-label block">{LEG_LABEL[m]}</span>
            <span className="t-body mt-0.5 block">{opts[m][0]} · {opts[m][1]}</span>
            {m === current && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange" />}
          </button>
        ))}
        <p className="t-small mt-3 text-muted">Durées indicatives. Le programme tient compte du temps de trajet.</p>
      </div>
    </>
  );
}

function useDestination() {
  const it = useStore((s) => s.user!.current_itinerary);
  const q = useSearchParams()[0];
  const day = Number(q.get('day')) || 0;
  const stop = it?.days[day]?.find((s) => s.id === q.get('stop'));
  const mode = q.get('mode') ?? 'À pied';
  return { it, day, stop, mode, id: q.get('stop') ?? '' };
}

/** Détail du trajet depuis la position de l’utilisateur jusqu’à une étape. */
export function RouteDetail() {
  const nav = useNavigate();
  const { it, day, stop, mode, id } = useDestination();
  if (!it || !stop) return <Navigate to="/trip" replace />;
  const row = COMPARE.find((r) => r[0] === mode && r[1]) ?? COMPARE[0];
  return (
    <>
      <Header title="Détail du trajet" subtitle={`Destination · ${stop.title}`} onBack={() => nav(`/trip/map?day=${day}`)} />
      <div className="flex flex-col gap-2.5 px-5 pb-4">
        <Field label="Départ" value="Ma position" />
        <Field label="Arrivée" value={stop.title} />
        <Field label="Mode · Distance · Durée" value={`${row[0]} · ${row[1]} · ${row[2]}`} />
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="compare-modes" onClick={() => nav(`/trip/compare?day=${day}&stop=${id}&mode=${encodeURIComponent(mode)}`)}>Comparer les modes</Button></Footer>
    </>
  );
}

/** Comparaison des modes de transport depuis la position de l’utilisateur (valeurs d’exemple du design). */
export function RouteCompare() {
  const nav = useNavigate();
  const { it, day, stop, mode, id } = useDestination();
  if (!it || !stop) return <Navigate to="/trip" replace />;
  return (
    <>
      <Header title="Comparer les trajets" subtitle={`Destination · ${stop.title}`} onBack={() => nav(-1)} />
      <div className="flex flex-col gap-2.5 px-5 pb-6">
        <Field label="Départ" value="Ma position · Exemple à Rome" />
        {COMPARE.map(([label, dist, dur, note]) => {
          const off = !dist;
          const selected = label === mode;
          const cls = cx('block w-full rounded-lg bg-sable px-4 py-3 text-left', selected && 'border-l-[3px] border-orange', off && 'opacity-70');
          const inner = <><span className="t-label block">{label}</span><span className="t-body mt-0.5 block">{off ? note : `${dist} · ${dur}${note ? ` · ${note}` : ''}`}</span></>;
          return off
            ? <div key={label} className={cls}>{inner}</div>
            : <button key={label} data-testid={`route-${label}`} aria-pressed={selected} className={cls}
                onClick={() => nav(`/trip/route?day=${day}&stop=${id}&mode=${encodeURIComponent(label)}`, { replace: true })}>{inner}</button>;
        })}
      </div>
    </>
  );
}
