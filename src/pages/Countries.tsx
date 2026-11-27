import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check, Search } from 'lucide-react';
import { Button, Header, Logo, cx } from '../components/ui';
import { norm } from '../api/mockApi';
import { useStore } from '../state/store';

const COUNTRIES = ['France', 'Italie', 'Espagne', 'Portugal', 'Japon'];

export default function Countries() {
  const nav = useNavigate();
  const answers = useStore((s) => s.answers);
  const { visited, setVisited } = useStore();
  const [q, setQ] = useState('');
  if (answers.length !== 12) return <Navigate to="/intro" replace />;
  const list = COUNTRIES.filter((c) => norm(c).includes(norm(q)));
  const toggle = (c: string) => setVisited(visited.includes(c) ? visited.filter((x) => x !== c) : [...visited, c]);
  return (
    <div className="flex flex-1 flex-col pb-6">
      <div className="px-5 pt-4"><Logo /></div>
      <Header onBack={() => nav('/quiz')} />
      <div className="px-5">
        <h1 className="t-title text-[26px] leading-[1.2]">Quels pays avez-vous déjà visités ?</h1>
        <p className="t-body mt-2 text-muted">Facultatif · Sélectionne autant de pays que tu veux.</p>
        <label className="mt-5 flex items-center gap-3 rounded-lg bg-sable px-4 py-3">
          <Search size={18} />
          <span className="flex-1"><span className="t-label block">Rechercher un pays</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex. Italie" aria-label="Rechercher un pays" className="t-body w-full bg-transparent focus:outline-none" /></span>
        </label>
        <ul className="mt-3">
          {list.map((c) => (
            <li key={c}>
              <button onClick={() => toggle(c)} aria-pressed={visited.includes(c)} className="flex w-full items-center justify-between border-b border-trait py-4 text-left text-[16px] font-medium">
                {c}
                <span className={cx('flex h-5 w-5 items-center justify-center rounded-[4px] border-2', visited.includes(c) ? 'border-orange bg-orange text-white' : 'border-brun')}>{visited.includes(c) && <Check size={14} strokeWidth={3} />}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col gap-2 px-5 pt-4">
        <Button variant="secondary" onClick={() => { setVisited([]); nav('/result'); }}>Passer</Button>
        <Button onClick={() => nav('/result')}>Voir mon profil</Button>
      </div>
    </div>
  );
}
