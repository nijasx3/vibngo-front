import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Check, ChevronRight, ImageOff, Star } from 'lucide-react';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`;

export function Logo({ className }: { className?: string }) {
  return (
    <span aria-label="Vibngo" className={cx('font-sans text-[22px] font-bold leading-none tracking-tight text-encre', className)}>
      Vibn<span className="text-orange">go</span>
    </span>
  );
}

/** Barre supérieure : logo, Messages, puce Vibi, cloche. Les écrans « bientôt » pointent vers /soon. */
export function TopBar({ bare = false }: { bare?: boolean }) {
  if (bare) return <div className="px-5 pb-1 pt-4"><Logo /></div>;
  return (
    <div className="flex items-center gap-2 px-5 pb-1 pt-4">
      <Link to="/home" aria-label="Accueil"><Logo /></Link>
      <div className="flex-1" />
      <Link to="/soon?page=messages" className="text-[15px] font-medium text-brun">Messages</Link>
      <Link to="/vibi" aria-label="Ouvrir Vibi, ton assistant" className="flex h-9 items-center gap-2 rounded-lg bg-sable pl-1 pr-3 text-[13px] font-medium">
        <span className="h-7 w-7 overflow-hidden rounded-full bg-white"><img src={img('vibi-avatar.png')} alt="" className="h-full w-full object-cover" /></span>Vibi
      </Link>
      <Link to="/soon?page=notifications" aria-label="Notifications" className="relative p-1">
        <Bell size={20} strokeWidth={1.8} />
        <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-orange" />
      </Link>
    </div>
  );
}

export function Header({ title, subtitle, back = true, onBack, right, lead }: { title?: string; subtitle?: string; back?: boolean; onBack?: () => void; right?: ReactNode; lead?: string }) {
  const nav = useNavigate();
  return (
    <div className="px-5 pb-3 pt-2">
      <div className="flex items-center gap-2">
        {back && <button aria-label="Retour" onClick={onBack ?? (() => nav(-1))} className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full"><ArrowLeft size={22} strokeWidth={1.8} /></button>}
        {lead && <span className="t-micro text-muted">{lead}</span>}
        <div className="flex-1" />
        {right}
      </div>
      {title && <h1 className="t-title mt-1">{title}</h1>}
      {subtitle && <p className="t-small mt-1 text-muted">{subtitle}</p>}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'orange' | 'light'; stripe?: boolean };
export function Button({ variant = 'primary', stripe = true, className, children, ...p }: BtnProps) {
  const base = 'relative flex min-h-12 w-full items-center justify-center rounded-lg px-4 text-[16px] font-bold transition active:scale-[.99] disabled:opacity-40';
  const v = {
    primary: 'bg-brun text-white',
    secondary: 'bg-sable text-brun border border-brun/60',
    orange: 'bg-orange text-white',
    light: 'bg-sable text-brun',
  }[variant];
  const s = stripe && (variant === 'primary' || variant === 'secondary') ? 'before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-lg before:bg-orange' : '';
  return <button className={cx(base, v, s, className)} {...p}>{children}</button>;
}

/** Cadre commun des boutons d'action collés en bas d'écran. */
export function Footer({ children }: { children: ReactNode }) {
  return <div className="sticky bottom-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-fond from-80% to-transparent px-5 pb-4 pt-6">{children}</div>;
}

/** Carte « libellé + valeur » (champ de formulaire ou ligne sélectionnable). */
export function Field({ label, value, onClick, placeholder, accent, children }: { label: string; value?: string; onClick?: () => void; placeholder?: string; accent?: boolean; children?: ReactNode }) {
  const inner = (
    <>
      <span className="t-label block">{label}</span>
      {children ?? <span className={cx('t-body mt-0.5 block', !value && 'text-muted')}>{value || placeholder}</span>}
    </>
  );
  const cls = cx('relative block w-full rounded-lg bg-sable px-4 py-3 text-left', accent && 'border-l-[3px] border-orange');
  return onClick ? (
    <button onClick={onClick} className={cls}>{inner}<ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-brun" /></button>
  ) : <div className={cls}>{inner}</div>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cx('relative h-7 w-12 shrink-0 rounded-full transition-colors', checked ? 'bg-orange' : 'bg-brun')}>
      <span className={cx('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

export function Tabs({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="tablist" className="flex border-b border-trait px-5">
      {items.map((t) => (
        <button key={t} role="tab" aria-selected={t === value} onClick={() => onChange(t)}
          className={cx('relative flex-1 pb-2.5 pt-2 text-[14px]', t === value ? 'font-bold' : 'font-normal text-muted')}>
          {t}{t === value && <span className="absolute inset-x-1 -bottom-px h-0.5 bg-orange" />}
        </button>
      ))}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return <button onClick={onClick} aria-pressed={active} className={cx('rounded-md px-3 py-1.5 text-[12px] font-medium', active ? 'bg-brun text-white' : 'bg-sable text-brun')}>{children}</button>;
}

export function StepBadge({ n }: { n: number }) {
  return <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-rouille text-[12px] font-bold text-white">{n}</span>;
}

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-orange" aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} fill={i <= value ? 'currentColor' : 'none'} strokeWidth={1.6} />)}
    </span>
  );
}

export function SectionTitle({ children, action, onAction, sub }: { children: ReactNode; action?: string; onAction?: () => void; sub?: string }) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between">
        <h2 className="t-section">{children}</h2>
        {action && <button onClick={onAction} className="text-[12px] font-bold">{action}</button>}
      </div>
      {sub && <p className="t-small mt-0.5 text-muted">{sub}</p>}
    </div>
  );
}

export function Photo({ src, alt = '', className }: { src?: string | null; alt?: string; className?: string }) {
  return src
    ? <img src={img(src)} alt={alt} loading="lazy" className={cx('object-cover', className)} />
    : <div aria-hidden className={cx('flex items-center justify-center bg-gradient-to-br from-sable to-trait text-brun/30', className)}><ImageOff size={18} /></div>;
}

export function Avatar({ initials, size = 40, tone = 'rose' }: { initials: string; size?: number; tone?: 'rose' | 'sable' }) {
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden
      className={cx('flex shrink-0 items-center justify-center rounded-full font-medium', tone === 'rose' ? 'bg-[#e9a79c] text-white' : 'bg-sable text-brun')}>{initials}</span>
  );
}

/** Carte photo avec bandeau brun en bas (destination, voyage). */
export function PhotoCard({ src, title, sub, label, height = 'h-44', right, onClick }: { src?: string | null; title: string; sub?: string; label?: string; height?: string; right?: ReactNode; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className="block w-full overflow-hidden rounded-xl text-left">
      <Photo src={src} className={cx('w-full', height)} />
      <div className="flex items-center justify-between bg-brun px-4 py-3 text-white">
        <div>
          {label && <div className="t-micro text-white/70">{label}</div>}
          <div className="text-[24px] font-bold leading-tight">{title}</div>
          {sub && <div className="t-small text-white/85">{sub}</div>}
        </div>
        {right}
      </div>
    </Tag>
  );
}

export function ListRow({ src, title, sub, onClick, right, testId }: { src?: string | null; title: string; sub?: string; onClick?: () => void; right?: ReactNode; testId?: string }) {
  return (
    <div data-testid={testId} className="flex items-center gap-3 rounded-lg bg-white p-2 shadow-[0_1px_0_rgba(90,46,31,.06)]">
      <button onClick={onClick} className="flex flex-1 items-center gap-3 text-left">
        {src !== undefined && <Photo src={src} className="h-12 w-12 shrink-0 rounded-md" />}
        <span className="min-w-0 flex-1"><span className="t-h3 block truncate text-[15px]">{title}</span>{sub && <span className="t-small block text-muted">{sub}</span>}</span>
      </button>
      {right ?? (onClick && <ChevronRight size={18} className="mr-1" />)}
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  const host = document.getElementById('phone-frame') ?? document.body;
  return createPortal(
    <div className="absolute inset-0 z-40 flex items-end bg-encre/40" onClick={onClose}>
      <div role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()} className="fade-up max-h-[85%] w-full overflow-y-auto rounded-t-2xl bg-fond p-5 pb-6">
        <div className="mb-3 flex items-center justify-between"><h2 className="t-section">{title}</h2><button onClick={onClose} className="text-[13px] font-bold">Fermer</button></div>
        {children}
      </div>
    </div>,
    host,
  );
}

/** Choix dans une liste (transport, budget…) présenté dans une feuille. */
export function PickerSheet({ open, onClose, title, options, value, onPick }: { open: boolean; onClose: () => void; title: string; options: { label: string; value: string }[]; value: string; onPick: (v: string) => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <button key={o.value} onClick={() => { onPick(o.value); onClose(); }} className="flex items-center justify-between rounded-lg bg-sable px-4 py-3 text-left text-[14px]">
            <span>{o.label}</span>{o.value === value && <Check size={16} className="text-orange" />}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export function Empty({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-8 py-12 text-center">
      <h2 className="t-h3">{title}</h2>
      <p className="t-body max-w-[260px] text-muted">{text}</p>
      {children && <div className="mt-3 w-full">{children}</div>}
    </div>
  );
}
