import { useNavigate } from 'react-router-dom';
import { Header, TopBar } from '../components/ui';
import { useStore } from '../state/store';

/** Point d'entrée de la création (bouton « Créer » du menu ou bouton de la page destination). */
export default function Create() {
  const nav = useNavigate();
  const resetDraft = useStore((s) => s.resetDraft);
  return (
    <>
      <TopBar />
      <Header title="Créer un voyage" subtitle="Choisis comment préparer ton voyage." back={false} />
      <div className="flex flex-col gap-3 px-5 pb-6">
        <button data-testid="create-with-vibi" onClick={() => nav('/create/vibi')} className="rounded-lg border-l-[3px] border-orange bg-sable px-4 py-5 text-left"><h2 className="t-section text-[20px]">Créer avec Vibi</h2><p className="t-body mt-1 text-muted">Décris ton voyage. Vibi te propose un programme.</p></button>
        <button data-testid="create-without-vibi" onClick={() => { resetDraft(); nav('/manual'); }} className="rounded-lg border-l-[3px] border-orange bg-sable px-4 py-5 text-left"><h2 className="t-section text-[20px]">Créer sans Vibi</h2><p className="t-body mt-1 text-muted">Choisis tes activités et organise chaque journée.</p></button>
      </div>
    </>
  );
}
