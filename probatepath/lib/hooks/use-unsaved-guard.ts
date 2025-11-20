import { useEffect, useRef, useState } from 'react';

type Opts = {
  isDirty: boolean;
  ignoreUntil?: number;
};

export function useUnsavedGuard(opts: Opts) {
  const { isDirty } = opts;
  const ignoreRef = useRef<number>(opts.ignoreUntil ?? 0);
  const [_, setTick] = useState(0);

  useEffect(() => {
    ignoreRef.current = opts.ignoreUntil ?? ignoreRef.current;
  }, [opts.ignoreUntil]);

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      const now = Date.now();
      if (!isDirty) return;
      if (ignoreRef.current && now <= ignoreRef.current) return;
      // Standard prompt
      e.preventDefault();
      e.returnValue = '';
      return '';
    }

    function onClick(e: MouseEvent) {
      try {
        if (!isDirty) return;
        const now = Date.now();
        if (ignoreRef.current && now <= ignoreRef.current) return;

        // Find nearest anchor
        let el = e.target as HTMLElement | null;
        while (el && el.nodeName !== 'A') el = el.parentElement;
        if (!el) return;
        const anchor = el as HTMLAnchorElement;
        const href = anchor.getAttribute('href');
        if (!href) return;
        // Ignore external links and anchors with target=_blank
        if (anchor.target === '_blank') return;
        if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;

        // It's an internal navigation — prompt
        const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
        if (!confirmed) {
          e.preventDefault();
          e.stopPropagation();
        }
      } catch (err) {
        // swallow
        // eslint-disable-next-line no-console
        console.warn('[unsaved-guard] click handler failed', err);
      }
    }

    function onSubmittedEvent() {
      // allow navigation for 5s
      ignoreRef.current = Date.now() + 5000;
      setTick((t) => t + 1);
    }

    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', onClick, true);
    window.addEventListener('intake:submitted', onSubmittedEvent as EventListener);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('intake:submitted', onSubmittedEvent as EventListener);
    };
  }, [isDirty]);

  function setIgnoreUntil(ts: number) {
    ignoreRef.current = ts;
    setTick((t) => t + 1);
  }

  return { setIgnoreUntil };
}

export default useUnsavedGuard;
