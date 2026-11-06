import { useState, type ReactNode } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tone } from '../types';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export function Button({ children, variant = 'primary', full, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'dark'; full?: boolean }) {
  const v = {
    primary: 'bg-orange text-white active:bg-orange-dark disabled:bg-orange/40',
    dark: 'bg-brun text-white active:bg-anthracite disabled:opacity-40',
    outline: 'bg-white text-brun border border-brun/30 active:bg-creme disabled:opacity-40',
    ghost: 'bg-transparent text-orange',
  }[variant];
  return (
    <button {...p} className={cx('t-body-s inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 transition-colors', v, full && 'w-full', className)}>
      {children}
    </button>
  );
}

export function Chip({ children, active, onClick, className }: { children: ReactNode; active?: boolean; onClick?: () => void; className?: string }) {
  const base = cx('t-body-m inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 transition-colors', active ? 'bg-orange text-white' : 'bg-white text-brun border border-line', className);
  return onClick ? <button onClick={onClick} className={base} aria-pressed={active}>{children}</button> : <span className={base}>{children}</span>;
}

export function Badge({ children, tone = 'creme' }: { children: ReactNode; tone?: 'creme' | 'orange' | 'brun' | 'rose' }) {
  const t = { creme: 'bg-creme text-brun', orange: 'bg-orange/15 text-orange-dark', brun: 'bg-brun text-white', rose: 'bg-rose/25 text-brun' }[tone];
  return <span className={cx('t-caption inline-flex items-center rounded-full px-2 py-0.5 font-semibold', t)}>{children}</span>;
}

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
      className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors', on ? 'bg-orange' : 'bg-line', disabled && 'opacity-40')}>
      <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

export function Accordion({ title, right, defaultOpen = false, children, id }: { title: ReactNode; right?: ReactNode; defaultOpen?: boolean; children: ReactNode; id?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white" data-testid={id}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
        <span className="t-section text-brun">{title}</span>
        <span className="flex items-center gap-2">{right}<ChevronDown size={18} className={cx('text-brun/60 transition-transform', open && 'rotate-180')} /></span>
      </button>
      {open && <div className="fade-up border-t border-line px-4 py-3">{children}</div>}
    </section>
  );
}

export function SectionTitle({ children, action, onAction }: { children: ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="t-section text-brun">{children}</h2>
      {action && <button onClick={onAction} className="t-caption flex items-center gap-0.5 font-semibold text-orange">{action}<ChevronRight size={12} /></button>}
    </div>
  );
}

const TONES: Record<Tone, string> = {
  orange: 'from-orange to-rose',
  rose: 'from-rose to-orange',
  brun: 'from-brun to-orange',
};
/** Remplace les photos (non disponibles dans le POC) par un visuel aux couleurs de la charte. */
export function Visual({ tone = 'orange', icon, label, className, children }: { tone?: Tone; icon?: ReactNode; label?: string; className?: string; children?: ReactNode }) {
  return (
    <div className={cx('relative flex items-center justify-center overflow-hidden bg-gradient-to-br text-white/90', TONES[tone], className)} role="img" aria-label={label ?? 'Illustration'}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative">{icon}</div>
      {children}
    </div>
  );
}

export function Rating({ value, count }: { value?: number; count?: number }) {
  if (value === undefined) return null;
  return (
    <span className="t-caption inline-flex items-center gap-1 font-semibold text-brun">
      <Star size={12} className="fill-orange text-orange" />{value.toFixed(1)}{count !== undefined && <span className="font-normal text-anthracite/60">({count})</span>}
    </span>
  );
}

export function Header({ title, back, right, onBack }: { title: ReactNode; back?: boolean; right?: ReactNode; onBack?: () => void }) {
  const nav = useNavigate();
  return (
    <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
      <div className="flex min-w-0 items-center gap-2">
        {back && (
          <button aria-label="Retour" onClick={() => (onBack ? onBack() : nav(-1))} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-brun active:bg-brun/10">
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 className="t-screen truncate text-brun">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-1">{right}</div>
    </header>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const c = cx('rounded-2xl border border-line bg-white p-3 text-left', className);
  return onClick ? <button onClick={onClick} className={cx(c, 'w-full active:bg-creme/60')}>{children}</button> : <div className={c}>{children}</div>;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16" role="status">
      <div className="spin h-12 w-12 rounded-full border-4 border-orange/20 border-t-orange" />
      {label && <p className="t-body-m text-center text-brun">{label}</p>}
    </div>
  );
}
