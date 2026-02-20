import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'https://api.sirch01.com');

export interface SessionResponse {
  code: number;
  message: string;
  data: {
    token: string | null;
    url: string | null;
  };
}

/**
 * Step 2: Get Credit Agent session (token + backend URL).
 * Requires Sanctum token from POST /api/auth first.
 * POST /api/mini/credit/session
 */
export async function fetchCreditSession(
  sanctumToken: string
): Promise<SessionResponse> {
  const base = import.meta.env.DEV ? '' : (API_BASE_URL || 'https://api.sirch01.com');
  const { data } = await axios.post<SessionResponse>(
    `${base}/api/mini/credit/session`,
    {},
    {
      headers: {
        Authorization: `Bearer ${sanctumToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  );
  return data;
}
