import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bot, Compass, House, Plus, User, Users } from 'lucide-react';
import { cx } from './ui';
import { useStore } from '../state/store';

const HIDE_NAV = ['/signup', '/quiz', '/result', '/chat'];
const HIDE_FAB = ['/signup', '/quiz', '/result', '/chat', '/create'];

function NavBar() {
  const link = (to: string, label: string, Icon: typeof House) => (
    <NavLink to={to} className={({ isActive }) => cx('flex min-h-12 w-14 flex-col items-center justify-center gap-0.5', isActive ? 'text-orange' : 'text-anthracite/60')}>
      <Icon size={22} strokeWidth={2} /><span className="text-[10px] font-semibold">{label}</span>
    </NavLink>
  );
  return (
    <nav aria-label="Navigation principale" className="flex shrink-0 items-center justify-between border-t border-line bg-white px-3 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5">
      {link('/home', 'Accueil', House)}
      {link('/explore', 'Explorer', Compass)}
      <NavLink to="/create" aria-label="Créer un itinéraire" className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-orange text-white shadow-lg shadow-orange/40 active:bg-orange-dark"><Plus size={26} /></NavLink>
      {link('/community', 'Communauté', Users)}
      {link('/profile', 'Profil', User)}
    </nav>
  );
}

function Toast() {
  const { toast, hideToast } = useStore();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 2600);
    return () => clearTimeout(t);
  }, [toast, hideToast]);
  if (!toast) return null;
  return <div role="status" className="t-body-s fade-up pointer-events-none absolute inset-x-4 top-4 z-50 rounded-xl bg-brun px-4 py-3 text-center text-white shadow-xl">{toast}</div>;
}

/** Cadre mobile : plein écran sur téléphone, "device" 393×852 centré sur ordinateur. */
export default function Layout() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const showNav = !HIDE_NAV.some((p) => pathname.startsWith(p));
  const showFab = !HIDE_FAB.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!user && !['/signup'].includes(pathname)) nav('/signup', { replace: true });
    else if (user && !user.traveler_type && !['/quiz', '/result'].includes(pathname) && pathname !== '/signup') nav('/quiz', { replace: true });
  }, [user, pathname, nav]);

  return (
    <div className="flex min-h-full items-center justify-center bg-creme sm:p-6">
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-creme sm:h-[min(852px,calc(100dvh-48px))] sm:w-[393px] sm:rounded-[44px] sm:border-[6px] sm:border-anthracite sm:shadow-2xl">
        <Toast />
        <main className="scroll-area relative flex-1 overflow-y-auto overflow-x-hidden" id="scroll-root">
          <Outlet />
          {showFab && <div className="h-20" />}
        </main>
        {showFab && (
          <button aria-label="Ouvrir VibnGO Assistant" onClick={() => nav('/chat')}
            className="absolute bottom-[78px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brun text-white shadow-xl shadow-brun/30 active:scale-95">
            <Bot size={28} />
          </button>
        )}
        {showNav && <NavBar />}
      </div>
    </div>
  );
}
