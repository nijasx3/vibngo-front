import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Field, Header } from '../components/ui';
import { useStore } from '../state/store';

export default function EditProfile() {
  const nav = useNavigate();
  const { user, updateProfile, showToast } = useStore();
  const [f, setF] = useState({ name: user?.name ?? '', lastName: user?.lastName ?? '', city: user?.city ?? '', bio: user?.bio ?? '' });
  const input = (k: keyof typeof f, label: string, ph: string) => (
    <Field label={label}><input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={ph} aria-label={label} className="t-body mt-0.5 block w-full bg-transparent text-[15px] focus:outline-none" /></Field>
  );
  return (
    <>
      <Header title="Modifier mon profil" />
      <div className="flex flex-col gap-3 px-5">
        {input('name', 'Prénom', 'Ton prénom')}
        {input('lastName', 'Nom', 'Ton nom')}
        {input('city', 'Ville', 'Ta ville')}
        <Field label="Bio"><textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} rows={3} placeholder="Présente-toi en quelques mots…" aria-label="Bio" className="t-body mt-0.5 block w-full resize-none bg-transparent text-[15px] focus:outline-none" /></Field>
      </div>
      <div className="flex-1" />
      <div className="px-5 pb-4 pt-5"><Button disabled={!f.name.trim()} onClick={() => { updateProfile({ ...f, name: f.name.trim() }); showToast('Profil mis à jour'); nav('/profile'); }}>Enregistrer</Button></div>
    </>
  );
}
