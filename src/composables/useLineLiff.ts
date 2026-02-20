import { onMounted, ref } from 'vue';

/**
 * LIFF (Line Front-end Framework) integration for Line mini app.
 * Use liff.getIDToken() to obtain id_token for backend auth.
 */

export interface LineLiffState {
  isReady: boolean;
  isInClient: boolean;
  idToken: string | null;
  profile: { userId: string; displayName: string; pictureUrl?: string } | null;
  error: string | null;
}

declare global {
  interface Window {
    liff?: {
      init: (config: { liffId: string }) => Promise<void>;
      getIDToken: () => string | null;
      getDecodedIDToken: () => { sub: string; name?: string; picture?: string } | null;
      isInClient: () => boolean;
      isLoggedIn: () => boolean;
      login: (config?: { redirectUri?: string }) => void;
    };
  }
}

const LIFF_ID = import.meta.env.VITE_LIFF_ID_CREDIT || '2009179302-lcIOdnXu';
const LINE_CHANNEL_ID = import.meta.env.VITE_LINE_CHANNEL_ID || '';

export function useLineLiff() {
  const state = ref<LineLiffState>({
    isReady: false,
    isInClient: false,
    idToken: null,
    profile: null,
    error: null,
  });

  onMounted(async () => {
    // Skip LIFF when running inside Telegram WebApp
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      return;
    }

    // Skip LIFF on localhost to avoid redirect to Line login during local development
    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return;
    }

    const liff = window.liff;
    if (!liff) {
      state.value.error = 'LIFF SDK not loaded';
      return;
    }

    try {
      await liff.init({ liffId: LIFF_ID });
      state.value.isInClient = liff.isInClient();

      // In external browser, user must login first to get ID token
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const idToken = liff.getIDToken();
      console.log('idToken', idToken);
      const decoded = liff.getDecodedIDToken();
      state.value.idToken = idToken;
      state.value.profile = decoded
        ? {
            userId: decoded.sub,
            displayName: decoded.name ?? '',
            pictureUrl: decoded.picture,
          }
        : null;
      state.value.isReady = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      state.value.error = `LIFF init failed: ${msg}`;
      console.error('[LIFF]', err);
    }
  });

  return {
    state,
    getChannelId: () => LINE_CHANNEL_ID,
  };
}
