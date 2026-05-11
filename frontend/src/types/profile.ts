export type Gender = 'male' | 'female';

export interface Profile {
  id: string;
  user_id: string;
  label: string;
  gender: Gender;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  is_lunar: boolean;
  is_leap_month: boolean;
  birth_timezone: string;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileCreate {
  label: string;
  gender: Gender;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  is_lunar?: boolean;
  is_leap_month?: boolean;
  birth_timezone?: string;
  location?: string | null;
  notes?: string | null;
}

export type ProfileUpdate = Partial<ProfileCreate>;
