import { BedDouble, Heart, Landmark, Ticket, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Item } from '../types';
import { Rating, Visual, cx } from './ui';
import { useStore } from '../state/store';

export const TYPE_ICON = { monument: Landmark, activity: Ticket, hotel: BedDouble, resto: Utensils } as const;
export const TYPE_LABEL = { monument: 'Monument', activity: 'Activité', hotel: 'Hôtel', resto: 'Restaurant' } as const;

export default function ItemCard({ item }: { item: Item }) {
  const nav = useNavigate();
  const liked = useStore((s) => s.user?.like.includes(item.id));
  const Icon = TYPE_ICON[item.type];
  return (
    <button onClick={() => nav(`/place/${item.id}`)} data-testid={`card-${item.id}`} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-2.5 text-left active:bg-creme/60">
      <Visual tone={item.tone} className="h-16 w-16 shrink-0 rounded-xl" icon={<Icon size={26} />} label={item.name} />
      <div className="min-w-0 flex-1">
        <p className="t-card truncate text-brun">{item.name}</p>
        <p className="t-caption truncate text-anthracite/70">{TYPE_LABEL[item.type]} · {item.tagline}</p>
        <div className="mt-1 flex items-center gap-2"><Rating value={item.rating} />{item.price && <span className="t-caption font-semibold text-orange-dark">{item.price}</span>}</div>
      </div>
      {liked && <Heart size={18} className={cx('shrink-0 fill-orange text-orange')} aria-label="Dans vos favoris" />}
    </button>
  );
}
