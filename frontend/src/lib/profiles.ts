import { apiFetch } from './api';
import type { Profile, ProfileCreate, ProfileUpdate } from '@/types/profile';

export const listProfiles = () => apiFetch<Profile[]>('/profiles');

export const getProfile = (id: string) => apiFetch<Profile>(`/profiles/${id}`);

export const createProfile = (data: ProfileCreate) =>
  apiFetch<Profile>('/profiles', { method: 'POST', body: JSON.stringify(data) });

export const updateProfile = (id: string, data: ProfileUpdate) =>
  apiFetch<Profile>(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProfile = (id: string) =>
  apiFetch<void>(`/profiles/${id}`, { method: 'DELETE' });
