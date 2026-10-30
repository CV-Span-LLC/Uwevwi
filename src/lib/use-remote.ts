import { useCallback, useEffect, useRef, useState } from 'react';

export type Remote<T> = { data: T | undefined; error: string | undefined; loading: boolean; reload: () => void };

type Settled<T> = { key: string; data?: T; error?: string };

/** Loads data when mounted (and when `deps` change), exposing loading and error state. */
export function useRemote<T>(load: () => Promise<T>, deps: unknown[] = []): Remote<T> {
  const [tick, setTick] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>();
  const key = JSON.stringify([...deps, tick]);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let active = true;
    loadRef.current().then(
      (data) => active && setSettled({ key, data }),
      (err: unknown) => active && setSettled({ key, error: err instanceof Error ? err.message : 'Something went wrong.' }),
    );
    return () => {
      active = false;
    };
  }, [key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  // Results for an older request are ignored, so `loading` is simply "no result for this key yet".
  const current = settled?.key === key ? settled : undefined;
  return { data: current?.data ?? (current ? undefined : settled?.data), error: current?.error, loading: !current, reload };
}
