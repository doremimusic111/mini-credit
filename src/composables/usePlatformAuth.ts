import { computed, ref, watch } from 'vue';
import { useTelegramWebApp } from './useTelegramWebApp';
import { useLineLiff } from './useLineLiff';
import { fetchSanctumToken, getAuthErrorMessage, type AuthRequest } from '@/api/authClient';

/** Bot ID for the Telegram Mini App. Must match the bot that serves the web app. */
const CREDIT_BOT_ID = import.meta.env.VITE_TELEGRAM_BOT_ID || '8471147380';

export type Platform = 'telegram' | 'line' | null;

export function usePlatformAuth() {
  const { user, initData } = useTelegramWebApp();
  const { state: liffState, getChannelId } = useLineLiff();

  const sanctumToken = ref<string | null>(null);
  const authError = ref<string | null>(null);

  const platform = computed<Platform>(() => {
    if (user.value?.id && initData.value) return 'telegram';
    if (liffState.value.isReady && liffState.value.idToken) return 'line';
    return null;
  });

  const displayName = computed(() => {
    if (platform.value === 'telegram') {
      return user.value?.username ? `@${user.value.username}` : user.value?.first_name ?? '';
    }
    if (platform.value === 'line') {
      return liffState.value.profile?.displayName ?? liffState.value.profile?.userId ?? '';
    }
    return '';
  });

  const isReady = computed(() => {
    if (platform.value === 'telegram') return !!user.value?.id && !!initData.value;
    if (platform.value === 'line') return liffState.value.isReady && !!liffState.value.idToken;
    return false;
  });

  const hasError = computed(
    () => authError.value || (platform.value === 'line' ? liffState.value.error : null)
  );

  async function getAuthPayload(): Promise<AuthRequest | null> {
    if (platform.value === 'telegram' && user.value && initData.value) {
      return {
        platform: 'telegram',
        init_data: initData.value,
        bot_id: CREDIT_BOT_ID,
      };
    }
    if (platform.value === 'line' && liffState.value.idToken) {
      const clientId = getChannelId();
      if (!clientId) {
        authError.value = 'VITE_LINE_CHANNEL_ID is not configured';
        return null;
      }
      return {
        platform: 'line',
        id_token: liffState.value.idToken,
        client_id: clientId,
      };
    }
    return null;
  }

  async function fetchToken(): Promise<string | null> {
    authError.value = null;
    const payload = await getAuthPayload();
    if (!payload) {
      authError.value = 'No auth payload available';
      return null;
    }
    try {
      const res = await fetchSanctumToken(payload);
      sanctumToken.value = res.token;
      return res.token;
    } catch (e: unknown) {
      const msg = getAuthErrorMessage(e);
      authError.value = msg;
      if (import.meta.env.DEV) console.error('[Auth] API error:', e);
      return null;
    }
  }

  watch(liffState, (s) => {
    if (s.error) authError.value = s.error;
  });

  return {
    platform,
    displayName,
    isReady,
    hasError,
    sanctumToken,
    authError,
    fetchToken,
    getAuthPayload,
    telegramUser: user,
    lineProfile: computed(() => liffState.value.profile),
  };
}
