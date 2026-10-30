import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { assetUrl, publicApi } from '@/lib/api';

type Overrides = Record<string, string | null>;
const SiteImagesContext = createContext<Overrides>({});

/** Loads the images an admin has replaced. Anything not replaced keeps its bundled default. */
export function SiteImagesProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>({});
  useEffect(() => {
    publicApi<Overrides>('/site-images').then(setOverrides, () => undefined);
  }, []);
  return <SiteImagesContext.Provider value={overrides}>{children}</SiteImagesContext.Provider>;
}

/** The managed image for `key`: the admin's upload if there is one, otherwise `fallback`. */
export function useSiteImage(key: string, fallback: number): number | { uri: string } {
  const path = useContext(SiteImagesContext)[key];
  const uri = assetUrl(path);
  return uri ? { uri } : fallback;
}
