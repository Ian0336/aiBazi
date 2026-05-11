export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  resets_at: string;
}
