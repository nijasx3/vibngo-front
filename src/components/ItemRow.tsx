import { useState } from 'react';
import { Check, Clock, MoreHorizontal, Landmark, Utensils, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ItineraryItem } from '../types';
import { catalog } from '../api/mockApi';
import { Badge, cx } from './ui';

export interface RowActions { onDelay?: () => void; onPostpone?: () => void; onReplace?: () => void; onDelete?: () => void }

const ICON = { poi: Landmark, activity: Ticket, resto: Utensils } as const;

export default function ItemRow({ item, actions, showStatus }: { item: ItineraryItem; actions?: RowActions; showStatus?: boolean }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const data = catalog.byId(item.ref);
  if (!data) return null;
  const Icon = ICON[item.kind];
  const act = (fn?: () => void) => () => { fn?.(); setOpen(false); };
  return (
    <div className="rounded-2xl border border-line bg-white" data-testid="itinerary-item">
      <div className="flex items-center gap-3 p-3">
        <div className="flex w-11 shrink-0 flex-col items-center"><Clock size={12} className="text-anthracite/50" /><span className="t-body-s text-brun">{item.time}</span></div>
        <button onClick={() => nav(`/place/${item.ref}`)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange"><Icon size={18} /></span>
          <span className="min-w-0">
            <span className="t-card block truncate text-brun">{data.name}</span>
            <span className="t-caption block truncate text-anthracite/70">{data.tagline}</span>
          </span>
        </button>
        {showStatus && item.paid && <Badge tone="orange"><Check size={10} className="mr-0.5" />Payé</Badge>}
        {actions && (
          <button aria-label={`Gérer « ${data.name} »`} aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brun active:bg-creme">
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>
      {actions && open && (
        <div className="fade-up flex flex-wrap gap-2 border-t border-line px-3 py-2.5">
          {actions.onDelay && <button onClick={act(actions.onDelay)} className={cx('t-body-m rounded-full border border-line px-3 py-1.5 text-brun active:bg-creme')}>Retarder</button>}
          {actions.onPostpone && <button onClick={act(actions.onPostpone)} className="t-body-m rounded-full border border-line px-3 py-1.5 text-brun active:bg-creme">Reporter</button>}
          {actions.onReplace && <button onClick={act(actions.onReplace)} className="t-body-m rounded-full border border-line px-3 py-1.5 text-brun active:bg-creme">Remplacer</button>}
          {actions.onDelete && <button onClick={act(actions.onDelete)} className="t-body-m rounded-full border border-rose px-3 py-1.5 text-orange-dark active:bg-rose/20">Supprimer</button>}
        </div>
      )}
    </div>
  );
}
