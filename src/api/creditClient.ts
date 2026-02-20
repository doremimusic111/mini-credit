import axios from 'axios';

// Empty VITE_API_BASE_URL = same-origin (use with Vercel proxy to avoid CORS)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'https://api.sirch01.com');

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
  const base = API_BASE_URL;
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
