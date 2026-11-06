import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Navigation, Star } from 'lucide-react';
import { Accordion, Badge, Button, Rating, Visual, cx } from '../components/ui';
import { TYPE_ICON, TYPE_LABEL } from '../components/ItemCard';
import { catalog } from '../api/mockApi';
import { useStore } from '../state/store';
import { PROFILES } from '../lib/scoring';

const REVIEWS: Record<string, [string, string][]> = {
  default: [['Inès', 'Très belle expérience, je recommande d\'y aller tôt.'], ['Marc', 'Super adresse, rien à redire.']],
};

export default function Place() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, toggleLike, showToast } = useStore();
  const item = id ? catalog.byId(id) : undefined;
  if (!item) return <div className="p-6 text-center"><p className="t-screen text-brun">Lieu introuvable</p><Button className="mt-4" onClick={() => nav('/explore')}>Retour à Explorer</Button></div>;
  const liked = !!user?.like.includes(item.id);
  const Icon = TYPE_ICON[item.type];
  const profile = PROFILES.find((p) => p.id === user?.traveler_type);
  const isHotel = item.type === 'hotel';

  const like = () => { toggleLike(item.id); showToast(liked ? 'Retiré de vos favoris' : 'Ajouté à vos favoris'); };

  return (
    <div className="fade-up pb-4">
      <Visual tone={item.tone} className="h-60 !items-end !justify-start p-4" icon={<Icon size={64} />} label={item.name}>
        <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between">
          <button aria-label="Retour" onClick={() => nav(-1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brun shadow"><ArrowLeft size={22} /></button>
          <button aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={liked} onClick={like} className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow">
            <Heart size={22} className={cx(liked ? 'fill-orange text-orange' : 'text-brun')} />
          </button>
        </div>
        <div className="relative z-10 text-left text-white"><h1 className="t-hero">{item.name}</h1><p className="t-body">{item.tagline}</p></div>
      </Visual>

      <div className="flex flex-col gap-4 px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Rating value={item.rating} count={item.reviews} />
          {isHotel && item.stars && <span className="flex">{Array.from({ length: item.stars }).map((_, i) => <Star key={i} size={12} className="fill-orange text-orange" />)}</span>}
          {item.price && <Badge tone="orange">{item.price}</Badge>}
          <Badge>{TYPE_LABEL[item.type]}</Badge>
        </div>
        {profile && <Badge tone="rose">Recommandé pour le profil : {profile.name}</Badge>}

        <Button full variant={liked ? 'outline' : 'primary'} onClick={like} aria-pressed={liked}>
          <Heart size={18} className={cx(liked && 'fill-orange text-orange')} />{liked ? 'Dans vos favoris' : 'Ajouter aux favoris'}
        </Button>

        <p className="t-body text-anthracite/90">{item.description}</p>

        <Accordion title="Détails" defaultOpen>
          <dl className="flex flex-col gap-2">
            {(item.details ?? []).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4"><dt className="t-body text-anthracite/70">{k}</dt><dd className="t-body-s text-right text-brun">{v}</dd></div>
            ))}
          </dl>
        </Accordion>
        <Accordion title="Adresse et géolocalisation">
          <Visual tone="brun" className="h-24 rounded-xl" icon={<MapPin size={28} />} label="Carte" />
          <p className="t-body mt-2 text-anthracite/90">{item.address}</p>
          <Button variant="outline" className="mt-2 !min-h-9" onClick={() => showToast('Itinéraire : fonctionnalité simulée')}><Navigation size={16} />Itinéraire</Button>
        </Accordion>
        <Accordion title="Galerie photos">
          <div className="grid grid-cols-3 gap-2">{(['orange', 'rose', 'brun'] as const).map((t) => <Visual key={t} tone={t} className="h-20 rounded-xl" label="Photo" />)}</div>
        </Accordion>
        <Accordion title="Avis voyageurs">
          <ul className="flex flex-col gap-3">
            {REVIEWS.default.map(([n, t]) => (
              <li key={n} className="flex gap-3"><span className="t-card flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose text-white">{n[0]}</span><div><p className="t-card text-brun">{n}</p><p className="t-body text-anthracite/80">{t}</p></div></li>
            ))}
          </ul>
        </Accordion>

        <div className="flex gap-2">
          <Button full onClick={() => showToast('Réservation simulée : redirection vers le partenaire')}>{isHotel ? 'Réserver' : 'Réserver en ligne'}</Button>
          <Button full variant="outline" onClick={() => showToast('Création d\'événement : fonctionnalité simulée')}>Créer un événement</Button>
        </div>
      </div>
    </div>
  );
}
