import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'https://api.sirch01.com');

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
export async function fetchSanctumToken(
  payload: AuthRequest
): Promise<AuthResponse> {
  const base = import.meta.env.DEV ? '' : (API_BASE_URL || 'https://api.sirch01.com');
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
