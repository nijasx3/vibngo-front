import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../state/store';

/** #/reset : remet le prototype à zéro (pratique entre deux participants). */
export default function Reset() {
  const nav = useNavigate();
  const reset = useStore((s) => s.reset);
  useEffect(() => { reset(); nav('/signup', { replace: true }); }, [reset, nav]);
  return null;
}
