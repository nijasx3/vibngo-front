import { useNavigate } from 'react-router-dom';
import { CalendarDays, Lock, MapPin, Route, Users } from 'lucide-react';
import { Button, Header, SectionTitle, Toggle } from '../components/ui';
import { profileById } from '../api/mockApi';
import { useStore } from '../state/store';
import { parseISO, fmtDayMonth } from '../lib/dates';
import type { Parameters } from '../types';
import type { ReactNode } from 'react';

function Row({ icon, title, sub, k, label }: { icon: ReactNode; title: string; sub: string; k: keyof Parameters; label: string }) {
  const { user, setParam } = useStore();
  return (
    <div className="flex items-center gap-3 border-b border-trait py-3.5">
      <span className="w-5">{icon}</span>
      <div className="min-w-0 flex-1"><div className="t-h3 text-[15px]">{title}</div><div className="t-small text-muted">{sub}</div></div>
      <Toggle label={label} checked={user!.parameters[k]} onChange={(v) => setParam(k, v)} />
    </div>
  );
}

export default function Settings() {
  const nav = useNavigate();
  const { user, quizDate, loadDemoItinerary, reset, showToast } = useStore();
  const profile = profileById(user!.traveler_type);
  return (
    <>
      <Header title="Paramètres" />
      <div className="px-5 pb-6">
        <section><SectionTitle>Profil voyageur</SectionTitle>
          <div className="rounded-lg border-l-[3px] border-orange bg-brun p-4 text-white">
            <div className="t-h3 text-[20px]">{profile?.name ?? 'Nouveau voyageur'}</div>
            <p className="t-small mt-1 text-white/85">{profile?.description ?? 'Passe le questionnaire pour découvrir ton profil voyageur.'}</p>
            <div className="mt-3 flex items-center justify-between"><span className="t-small text-[10px] text-white/70">{quizDate ? `Dernier test · ${fmtDayMonth(parseISO(quizDate))}` : 'Aucun test passé'}</span>
              <button onClick={() => nav('/intro')} className="rounded-md bg-white px-3 py-1.5 text-[12px] font-bold text-brun">{profile ? 'Refaire' : 'Commencer'}</button></div>
          </div></section>

        <section className="mt-6"><SectionTitle>Sécurité et vie privée</SectionTitle>
          <Row icon={<MapPin size={18} />} title="Géolocalisation" sub="Suivi en temps réel de votre position" k="geo" label="Géolocalisation" />
          <Row icon={<Users size={18} />} title="Visibilité communauté" sub="Votre profil est visible des autres voyageurs" k="visibility" label="Visibilité communauté" />
          <Row icon={<Lock size={18} />} title="Partage de données" sub="Amélioration des recommandations IA" k="dataSharing" label="Partage de données" /></section>

        <section className="mt-6"><SectionTitle>Notifications</SectionTitle>
          <Row icon={<CalendarDays size={18} />} title="Événements à proximité" sub="Alertes sur les lieux et événements proches" k="notif" label="Événements à proximité" />
          <Row icon={<Route size={18} />} title="Modifications d’itinéraire" sub="Suggestions pour optimiser votre parcours" k="itineraryChanges" label="Modifications d’itinéraire" />
          <Row icon={<Users size={18} />} title="Activités des amis" sub="Amis à proximité de vos lieux favoris" k="friendActivity" label="Activités des amis" /></section>

        <section className="mt-6"><SectionTitle>Mode hors ligne</SectionTitle>
          <div className="rounded-lg bg-sable p-4"><div className="flex items-center justify-between"><div><div className="t-h3 text-[15px]">Mise en cache automatique</div><div className="t-small text-muted">Planning · Carte · Réservations</div></div>
            <button onClick={() => showToast('Données mises à jour (simulation)')} className="rounded-md bg-white px-3 py-1.5 text-[12px] font-bold">Actualiser</button></div>
            <p className="t-small mt-3 inline-block rounded bg-vert px-2.5 py-1">✓ Rome · 7 jours en cache</p></div></section>

        <section className="mt-6"><SectionTitle sub="Réservé aux tests utilisateurs (hors design)">Outils de test</SectionTitle>
          <div className="flex flex-col gap-2">
            <Button variant="light" stripe={false} data-testid="load-demo" onClick={() => { loadDemoItinerary(); showToast('Voyage à Rome chargé'); }}>Charger un voyage à Rome en cours</Button>
            <Button variant="secondary" data-testid="logout" onClick={() => { reset(); nav('/'); }}>Se déconnecter</Button>
          </div></section>
      </div>
    </>
  );
}
