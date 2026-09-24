import { useSyncExternalStore, useEffect } from 'react';
import { crusherStore, CrusherStoreState } from './crusher-store';

let isInitialized = false;

export function useCrusherStore(): CrusherStoreState {
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      isInitialized = true;
      crusherStore.hydrateFromStorage();
      crusherStore.syncWithSupabase();
    }
  }, []);

  return useSyncExternalStore(
    (callback) => crusherStore.subscribe(callback),
    () => crusherStore.getState(),
    () => crusherStore.getServerSnapshot()
  );
}

