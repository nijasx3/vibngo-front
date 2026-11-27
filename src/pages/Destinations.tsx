import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button, Header, Logo, Photo, cx } from '../components/ui';
import { DESTINATIONS, profileById } from '../api/mockApi';
import { useStore } from '../state/store';

/** « Destinations pour toi » : 4 destinations selon le profil. Seule Rome est ouverte dans le prototype. */
export default function Destinations() {
  const nav = useNavigate();
  const type = useStore((s) => s.user?.traveler_type ?? null);
  const showToast = useStore((s) => s.showToast);
  const [sel, setSel] = useState<string | null>(null);
  const profile = profileById(type);
  const list = (profile?.destinations ?? ['patagonie', 'kyoto', 'bali', 'rome']).map((id) => DESTINATIONS.find((d) => d.id === id)!);
  return (
    <div className="flex flex-1 flex-col pb-6">
      <div className="px-5 pt-4"><Logo /></div>
      <Header onBack={() => nav('/result')} />
      <div className="px-5">
        <h1 className="t-title text-[28px]">Destinations pour toi</h1>
        <p className="t-body mt-3 text-[15px] text-muted">Pour le profil {profile?.name.toLowerCase()}. Choisis une destination pour préparer ton itinéraire.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {list.map((d) => {
            const on = sel === d.id;
            return (
              <button key={d.id} data-testid={`dest-${d.id}`} aria-pressed={on} aria-disabled={!d.available}
                onClick={() => (d.available ? setSel(d.id) : showToast(`${d.name} arrive bientôt : le prototype ne propose que Rome.`))}
                className={cx('relative overflow-hidden rounded-xl bg-sable text-left', !d.available && 'opacity-80', on && 'ring-2 ring-orange')}>
                <Photo src={d.image} alt={d.name} className="h-[125px] w-full" />
                <span className={cx('absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white', on ? 'bg-orange text-white' : 'bg-white/10')}>{on && <Check size={14} strokeWidth={3} />}</span>
                {!d.available && <span className="t-micro absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-brun">Bientôt</span>}
                <span className="block px-3 pb-3 pt-2"><span className="t-h3 block">{d.name}</span><span className="t-small block text-muted">{d.country}</span></span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1" />
      <div className="px-5 pt-4"><Button variant={sel ? 'primary' : 'secondary'} disabled={!sel} onClick={() => nav('/prepare')}>Voir mon itinéraire</Button></div>
    </div>
  );
}
