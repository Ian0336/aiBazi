import { apiFetch } from './api';
import type { ZiweiChart, ZiweiInput } from '@/types/ziwei';

export const calculateZiwei = (input: ZiweiInput) =>
  apiFetch<ZiweiChart>('/ziwei', { method: 'POST', body: JSON.stringify(input) });
