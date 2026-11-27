import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { img } from '../components/ui';
import { prepareItinerary } from '../api/mockApi';
import { useStore } from '../state/store';

/** Écran de chargement : Vibi prépare l'itinéraire de Rome. */
export default function Prepare() {
  const nav = useNavigate();
  const newProposal = useStore((s) => s.newProposal);
  useEffect(() => {
    let on = true;
    prepareItinerary().then(() => { if (on) { newProposal(); nav('/proposal', { replace: true }); } });
    return () => { on = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div role="status" aria-live="polite" className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <img src={img('vibi.png')} alt="" className="h-32" />
      <div className="spin h-8 w-8 rounded-full border-4 border-sable border-t-orange" />
      <h1 className="t-h3 text-[18px]">Vibi prépare ton itinéraire à Rome…</h1>
      <p className="t-body text-muted">Quelques secondes, le temps de choisir les meilleures étapes.</p>
    </div>
  );
}
