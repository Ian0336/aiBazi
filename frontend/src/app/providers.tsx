"use client";

import { ReactNode } from 'react';
import { Provider as JotaiProvider, createStore } from 'jotai';

const jotaiStore = createStore();

export default function Providers({ children }: { children: ReactNode }) {
  return <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>;
}
