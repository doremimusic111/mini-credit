import { API_BASE_URL, http } from './http';

export interface TokenResponse {
  code: number;
  message: string;
  data: {
    token: string | null;
    url: string | null;
  };
}

export async function fetchMiniCreditToken(telegramUserId: string): Promise<TokenResponse> {
  const response = await http.post<TokenResponse>(`${API_BASE_URL}/api/mini/credit/login`, {
    telegram_user_id: telegramUserId,
  });

  return response.data;
}
