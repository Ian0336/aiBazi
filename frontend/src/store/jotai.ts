import { atom } from 'jotai';
import { BaziChart, BaziInput } from '@/types/bazi';

export const chartAtom = atom<BaziChart | null>(null);
export const originalInputAtom = atom<BaziInput | null>(null);
