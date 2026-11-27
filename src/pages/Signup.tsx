import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Field, Header, Logo } from '../components/ui';
import { useStore } from '../state/store';

/** Un seul champ (pseudo) : le prototype n'a ni comptes ni mots de passe. */
export default function Signup() {
  const nav = useNavigate();
  const login = useSearchParams()[0].get('mode') === 'login';
  const signup = useStore((s) => s.signup);
  const [name, setName] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    signup(name);
    nav('/intro');
  };
  return (
    <form onSubmit={submit} className="flex flex-1 flex-col pb-6">
      <div className="px-5 pt-4"><Logo /></div>
      <Header title={login ? 'Se connecter' : 'Créer un compte'} subtitle={login ? 'Retrouve tes voyages et tes recommandations.' : 'Crée ton compte pour découvrir ton profil voyageur.'} onBack={() => nav('/')} />
      <div className="px-5">
        <Field label="Pseudo">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="Ton pseudo" aria-label="Pseudo" autoComplete="nickname"
            className="t-body mt-0.5 block w-full bg-transparent text-[15px] focus:outline-none" />
        </Field>
      </div>
      <div className="flex-1" />
      <div className="px-5">
        <Button type="submit" disabled={!name.trim()}>{login ? 'Se connecter' : 'Créer mon compte'}</Button>
      </div>
    </form>
  );
}
