import { http } from './http';

export interface TokenResponse {
  code: number;
  message: string;
  data: {
    token: string;
  };
}

export async function fetchMiniCreditToken(
  username: string,
): Promise<TokenResponse> {
  const response = await http.post<TokenResponse>('/api/mini/credit/login', {
    username,
  });

  return response.data;
}