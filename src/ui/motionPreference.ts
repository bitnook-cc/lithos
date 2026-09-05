import { useSyncExternalStore } from 'react';

const KEY = 'lithos_reduce_motion';
let override = false;
try { override = localStorage.getItem(KEY) === 'true'; } catch { /* Device preference still works without storage. */ }
export function reducedMotion() { return override || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
export function setReducedMotion(value: boolean) {
  override = value;
  try { localStorage.setItem(KEY, String(value)); } catch { /* Keep the setting for this session. */ }
  window.dispatchEvent(new Event('lithos-motion-change'));
}
function subscribe(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => {
    document.documentElement.dataset.motion = reducedMotion() ? 'reduced' : 'full';
    callback();
  };
  update();
  media.addEventListener('change', update);
  window.addEventListener('lithos-motion-change', update);
  return () => { media.removeEventListener('change', update); window.removeEventListener('lithos-motion-change', update); };
}
export function useReducedMotion() { return useSyncExternalStore(subscribe, reducedMotion, () => true); }
