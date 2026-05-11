import { atom, createStore } from 'jotai';
import { BaziChart, BaziInput } from '@/types/bazi';

// Single Jotai store shared across the app — exported so non-React code
// (e.g. fetch wrappers) can read/write atoms imperatively.
export const jotaiStore = createStore();

export const chartAtom = atom<BaziChart | null>(null);
export const originalInputAtom = atom<BaziInput | null>(null);
