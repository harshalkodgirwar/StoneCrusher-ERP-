'use client';

import { useSyncExternalStore } from 'react';
import { crusherStore, CrusherStoreState } from './crusher-store';

export function useCrusherStore(): CrusherStoreState {
  return useSyncExternalStore(
    (callback) => crusherStore.subscribe(callback),
    () => crusherStore.getState(),
    () => crusherStore.getState()
  );
}
