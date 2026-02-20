import axios from 'axios';

// Empty VITE_API_BASE_URL = same-origin (use with Vercel proxy to avoid CORS)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'https://api.sirch01.com');

export interface AuthResponse {
  message: string;
  token: string;
  token_type: string;
  platform: string;
  platform_user_id: string;
}

/** Request body for Mini App Auth - Telegram */
export interface TelegramAuthRequest {
  platform: 'telegram';
  init_data: string;
  bot_id: string;
}

/** Request body for Mini App Auth - Line */
export interface LineAuthRequest {
  platform: 'line';
  id_token: string;
  client_id: string;
}

export type AuthRequest = TelegramAuthRequest | LineAuthRequest;

/**
 * Step 1: Authenticate via Mini App (Telegram or Line) to obtain Sanctum token.
 * POST /api/mini/auth
 */
/**
 * Extract a user-friendly error message from an Axios error.
 */
export function getAuthErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const res = (e as { response?: { data?: unknown; status?: number } }).response;
    if (res?.data && typeof res.data === 'object') {
      const data = res.data as Record<string, unknown>;
      if (typeof data.message === 'string') return data.message;
      if (typeof data.error === 'string') return data.error;
      if (Array.isArray(data.errors)) {
        const first = data.errors[0];
        return typeof first === 'string' ? first : String(first);
      }
    }
    if (res?.status) return `Request failed (${res.status})`;
  }
  return e instanceof Error ? e.message : String(e);
}

export async function fetchSanctumToken(
  payload: AuthRequest
): Promise<AuthResponse> {
  const base = API_BASE_URL;
  const { data } = await axios.post<AuthResponse>(
    `${base}/api/mini/auth`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );
  return data;
}
