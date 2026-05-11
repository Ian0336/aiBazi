"use client";

import { ReactNode, useEffect } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { jotaiStore } from '@/store/jotai';
import { bootstrapAuth } from '@/store/auth';

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Try to silently establish a session from an existing refresh cookie.
    // No-op for anonymous users.
    bootstrapAuth();
  }, []);

  return <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>;
}
