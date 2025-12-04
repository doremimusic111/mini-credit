import { http } from './http';

export interface TokenResponse {
  code: number;
  message: string;
  data: {
    token: string;
  };
}

export async function fetchMiniCreditToken(
  telegramUserId: string,
): Promise<TokenResponse> {
  const response = await http.post<TokenResponse>('/api/mini/credit/login', {
    telegram_user_id: telegramUserId,
  });

  return response.data;
}