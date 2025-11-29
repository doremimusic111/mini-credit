import { onMounted, ref } from 'vue';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

// Mock data for local development (from .env or defaults)
function getMockUser() {
  return {
    id: Number(import.meta.env.VITE_MOCK_USER_ID) || 6884869563,
    first_name: import.meta.env.VITE_MOCK_FIRST_NAME || 'Test',
    last_name: import.meta.env.VITE_MOCK_LAST_NAME || 'User',
    username: import.meta.env.VITE_MOCK_USERNAME || 'testuser',
    language_code: 'en',
  };
}

function getMockInitData() {
  return import.meta.env.VITE_MOCK_INIT_DATA || 'mock_init_data_for_local_development';
}

function isDevelopment() {
  // Check if Telegram WebApp is not available OR if it exists but has no real user data
  const tg = window.Telegram?.WebApp;
  if (!tg) return true;
  
  // If WebApp exists but has no user data, we're in development
  const hasRealUser = tg.initDataUnsafe?.user?.id;
  return !hasRealUser;
}

export function useTelegramWebApp() {
  const webApp = ref<any | null>(null);
  const user = ref<any | null>(null);
  const initData = ref<string | null>(null);

  // Initialize mock data immediately if Telegram WebApp is not available
  if (isDevelopment()) {
    console.warn('[DEV] Using mock Telegram WebApp data');
    webApp.value = {
      ready: () => {},
      expand: () => {},
      close: () => {},
    };
    initData.value = getMockInitData();
    user.value = getMockUser();

    console.log({user: user.value, initData: initData.value});
  }

  onMounted(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready(); // signal to Telegram that app is ready
      webApp.value = tg;
      
      // Only use real data if we have actual user data (not in development)
      const realUser = tg.initDataUnsafe?.user;
      if (realUser?.id) {
        // Real Telegram WebApp environment with actual user
        initData.value = tg.initData;
        user.value = realUser;
      }
      // Otherwise, keep the mock data that was set above
    }
  });

  return {
    webApp,
    user,
    initData,
  };
}