import { useNavigate } from 'react-router-dom';
import { Accordion, Button, Card, Header, Toggle } from '../components/ui';
import { useStore } from '../state/store';
import { PROFILES } from '../lib/scoring';
import type { Parameters } from '../types';

function Row({ label, hint, k, disabled }: { label: string; hint?: string; k: keyof Parameters; disabled?: boolean }) {
  const { user, setParam } = useStore();
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0"><p className="t-body-m text-brun">{label}</p>{hint && <p className="t-caption text-anthracite/60">{hint}</p>}</div>
      <Toggle on={user!.parameters[k]} disabled={disabled} label={label} onChange={(v) => setParam(k, v)} />
    </div>
  );
}

export default function Settings() {
  const nav = useNavigate();
  const { user, reset, loadDemoItinerary, showToast } = useStore();
  if (!user) return null;
  const p = user.parameters;
  const profile = PROFILES.find((x) => x.id === user.traveler_type);
  return (
    <div className="fade-up pb-4">
      <Header title="Paramètres" back />
      <div className="flex flex-col gap-4 px-4">
        <Card>
          <p className="t-section text-brun">Profil voyageur</p>
          <p className="t-card mt-1 text-orange-dark">{profile?.name ?? 'Non défini'}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" className="!min-h-9" onClick={() => nav('/result')}>Consulter</Button>
            <Button variant="outline" className="!min-h-9" onClick={() => nav('/quiz')}>Refaire le test</Button>
          </div>
        </Card>

        <section className="rounded-2xl border border-line bg-white px-4 py-3">
          <h2 className="t-section text-brun">Sécurité et vie privée</h2>
          <div className="divide-y divide-line">
            <Row k="geo" label="Géolocalisation" hint="Carte, lieux et amis à proximité" />
            <Row k="sharePosition" label="Partager ma position avec mes amis" disabled={!p.geo} />
            <Row k="profileVisible" label="Profil visible par mes amis" />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white px-4 py-3">
          <h2 className="t-section text-brun">Notifications</h2>
          <div className="divide-y divide-line">
            <Row k="notif" label="Notifications" hint="Rappels et messages de l'application" />
            <Row k="reminders" label="Rappels d'activités" disabled={!p.notif} />
            <Row k="friendMessages" label="Messages de mes amis" disabled={!p.notif} />
          </div>
        </section>

        <Card><p className="t-section text-brun">Mode hors-ligne</p><p className="t-body mt-1 text-anthracite/80">Activé automatiquement lorsque vous n'avez plus de réseau.</p></Card>

        <Accordion title="Outils pour les tests (modérateur)">
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => { loadDemoItinerary(); showToast('Itinéraire de démonstration chargé'); }}>Charger un itinéraire de démonstration</Button>
            <Button variant="dark" onClick={() => { if (window.confirm('Réinitialiser le prototype ? Toutes les données locales seront effacées.')) { reset(); nav('/signup', { replace: true }); } }}>Réinitialiser le prototype</Button>
            <p className="t-caption text-anthracite/60">Rafraîchir la page déconnecte aussi l'utilisateur et remet tout à zéro.</p>
          </div>
        </Accordion>
      </div>
    </div>
  );
}
