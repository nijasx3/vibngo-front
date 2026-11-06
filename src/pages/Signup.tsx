import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button } from '../components/ui';
import { useStore } from '../state/store';

export default function Signup() {
  const nav = useNavigate();
  const { user, signup } = useStore();
  const [name, setName] = useState('');
  const valid = name.trim().length >= 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    signup(name);
    nav('/quiz', { replace: true });
  };

  if (user) {
    return (
      <div className="flex min-h-full flex-col justify-center gap-4 px-6 py-10 text-center">
        <p className="t-screen text-brun">Bon retour, {user.name} !</p>
        <Button full onClick={() => nav(user.traveler_type ? '/home' : '/quiz')}>Continuer</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex min-h-full flex-col px-6 pb-8 pt-16">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange text-white shadow-lg shadow-orange/30"><MapPin size={40} /></div>
        <div>
          <h1 className="font-[family-name:var(--font-title)] text-[32px] font-bold leading-none text-brun">Vibn<span className="text-orange">GO</span></h1>
          <p className="t-body mt-3 text-anthracite/80">Votre voyage, pensé pour votre façon de voyager.</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="t-screen text-brun">Bienvenue !</h2>
        <label className="flex flex-col gap-1.5">
          <span className="t-body-s text-brun">Choisissez votre pseudo</span>
          <input
            value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoComplete="nickname" autoCapitalize="none"
            placeholder="Ex. : Louis"
            className="t-body-m min-h-12 rounded-xl border border-line bg-white px-4 text-anthracite placeholder:text-anthracite/40 focus:border-orange focus:outline-none"
          />
        </label>
        <Button type="submit" disabled={!valid} full>Commencer</Button>
        <p className="t-caption text-center text-anthracite/60">Prototype de test · aucune donnée n'est envoyée</p>
      </div>
    </form>
  );
}
