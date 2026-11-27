import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Avatar, Button, Empty, Field, Footer, Header, PickerSheet, cx } from '../components/ui';
import { communityData } from '../api/mockApi';
import { useStore } from '../state/store';
import type { Collab } from '../types';

const ACCESS: { label: string; value: Collab['access'] }[] = [{ label: 'Peut modifier', value: 'edit' }, { label: 'Peut consulter', value: 'view' }];
const first = (n: string) => n.split(' ')[0];

/** Collaborer : choisir un ami, envoyer l’invitation, puis itinéraire partagé une fois l’invitation acceptée. */
export default function Collaborate() {
  const nav = useNavigate();
  const it = useStore((s) => s.user!.current_itinerary);
  const user = useStore((s) => s.user)!;
  const collab = useStore((s) => s.collab);
  const sendInvite = useStore((s) => s.sendInvite);
  const [pick, setPick] = useState<string | null>(null);
  const [access, setAccess] = useState<Collab['access']>('edit');
  const [sheet, setSheet] = useState(false);
  if (!it) return <Navigate to="/trips" replace />;
  const trip = `Voyage à ${it.destination.split(',')[0]}`;
  const friends = communityData.friends.filter((f) => user.friends.includes(f.id));

  if (collab?.status === 'pending') {
    return (
      <>
        <Header title="Invitation envoyée" back={false} />
        <div className="px-5 pb-4">
          <h2 className="t-section mb-1 text-[15px]">{collab.name}</h2>
          <p className="t-body mb-4 text-muted">{first(collab.name)} pourra {collab.access === 'edit' ? 'modifier' : 'consulter'} le programme après avoir accepté l’invitation.</p>
          <Field label={trip} value="En attente de réponse" />
        </div>
        <div className="flex-1" />
        <Footer><Button data-testid="back-trip" onClick={() => nav('/trip')}>Retour au voyage</Button></Footer>
      </>
    );
  }
  if (collab?.status === 'accepted') {
    return (
      <>
        <Header title="Itinéraire partagé" onBack={() => nav('/trip')} />
        <div className="px-5 pb-4">
          <h2 className="t-section mb-1 text-[15px]">{trip}</h2>
          <p data-testid="accepted-text" className="t-body mb-4 text-muted">
            {collab.access === 'edit' ? `${first(collab.name)} a accepté l’invitation. Vous pouvez tous les deux modifier le programme.` : `${first(collab.name)} a accepté l’invitation et peut consulter le programme.`}
          </p>
          <div className="flex flex-col gap-2.5">
            <Field label="Organisateur" value={user.name} />
            <Field label={collab.access === 'edit' ? 'Peut modifier' : 'Peut consulter'} value={collab.name} />
          </div>
        </div>
        <div className="flex-1" />
        <Footer><Button data-testid="edit-shared" onClick={() => nav('/modify?day=0&from=trip')}>Modifier le programme</Button></Footer>
      </>
    );
  }
  const chosen = friends.find((f) => f.id === pick);
  return (
    <>
      <Header title="Collaborer" onBack={() => nav('/trip')} />
      <div className="px-5 pb-4">
        <h2 className="t-section mb-1 text-[15px]">{trip}</h2>
        <p className="t-body mb-4">Choisis qui pourra voir et modifier le programme avec toi.</p>
        {friends.length === 0
          ? <Empty title="Aucun viber dans ton réseau" text="Ajoute des vibers pour pouvoir les inviter à collaborer."><Button onClick={() => nav('/explore?tab=Utilisateurs')}>Découvrir des vibers</Button></Empty>
          : <ul className="flex flex-col gap-2">{friends.map((f) => (
              <li key={f.id}>
                <button data-testid={`friend-${f.id}`} aria-pressed={f.id === pick} onClick={() => setPick(f.id)}
                  className={cx('flex w-full items-center gap-3 rounded-lg bg-white p-3 text-left', f.id === pick && 'ring-2 ring-orange')}>
                  <Avatar initials={f.initials} size={40} />
                  <span className="flex-1"><span className="t-h3 block text-[15px]">{f.name}</span><span className="t-small block text-muted">{f.id === pick ? 'Sélectionné' : f.sub}</span></span>
                  {f.id === pick && <Check size={18} className="text-orange" />}
                </button>
              </li>))}</ul>}
        <div className="mt-4"><Field label="Accès à l’itinéraire" value={ACCESS.find((a) => a.value === access)!.label} onClick={() => setSheet(true)} /></div>
      </div>
      <div className="flex-1" />
      <Footer><Button data-testid="send-invite" disabled={!chosen} onClick={() => chosen && sendInvite(chosen.id, chosen.name, access)}>Envoyer l’invitation</Button></Footer>
      <PickerSheet open={sheet} onClose={() => setSheet(false)} title="Accès à l’itinéraire" options={ACCESS} value={access} onPick={(v) => setAccess(v as Collab['access'])} />
    </>
  );
}
