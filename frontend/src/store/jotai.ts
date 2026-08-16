import { atom, createStore } from 'jotai';
import { BaziChart, BaziInput } from '@/types/bazi';
import { ZiweiChart } from '@/types/ziwei';

// Single Jotai store shared across the app — exported so non-React code
// (e.g. fetch wrappers) can read/write atoms imperatively.
export const jotaiStore = createStore();

export const chartAtom = atom<BaziChart | null>(null);
export const originalInputAtom = atom<BaziInput | null>(null);

/**
 * Last 紫微 chart, tagged with the (birth data + 運限 date) it was built from so
 * a tab switch can reuse it and a changed input invalidates it.
 */
export const ziweiChartAtom = atom<{ key: string; chart: ZiweiChart } | null>(null);
