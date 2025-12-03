import { http } from './http';

export interface TokenResponse {
  code: number;
  message: string;
  data: {
    token: string;
  };
}

export async function fetchMiniCreditToken(
  account: string,
): Promise<TokenResponse> {
  const response = await http.post<TokenResponse>('/api/mini/credit/login', {
    account,
  });

  return response.data;
}