import React, { useEffect, useRef } from 'react';

/** Native modal semantics provide focus containment, background inertness and focus restoration. */
export function Dialog({ title, children, onClose, className = '' }: { title: string; children: React.ReactNode; onClose?: () => void; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); }; }, []);
  return <dialog ref={ref} className={`slice-dialog ${className}`} aria-label={title} onCancel={event => { event.preventDefault(); onClose?.(); }} onClick={event => { if (event.target === event.currentTarget) onClose?.(); }}>{children}</dialog>;
}
