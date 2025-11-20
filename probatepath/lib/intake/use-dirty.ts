import { useEffect, useMemo, useState } from 'react';
import { useIntake } from './store';
import { loadDraft } from './persist';

export function useIsWizardDirty() {
  const { draft, hydrated } = useIntake();
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadDraft();
    try {
      setSavedSnapshot(stored ? JSON.stringify(stored) : null);
    } catch (err) {
      setSavedSnapshot(null);
    }
  }, []);

  const current = useMemo(() => {
    try {
      return JSON.stringify(draft);
    } catch (err) {
      return '';
    }
  }, [draft]);

  const dirty = useMemo(() => {
    if (!hydrated) return false;
    if (!savedSnapshot) return current !== JSON.stringify({});
    return savedSnapshot !== current;
  }, [hydrated, savedSnapshot, current]);

  return dirty;
}

export default useIsWizardDirty;
