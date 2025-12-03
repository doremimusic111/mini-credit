import { onMounted, ref } from 'vue';

/**
 * Telegram WebApp User object structure
 * Based on Telegram WebApp API: https://core.telegram.org/bots/webapps
 */
export interface TelegramWebAppUser {
  /** Unique identifier for the user or bot (up to 52 significant bits) */
  id: number;
  /** First name of the user or bot */
  first_name: string;
  /** Last name of the user or bot (optional) */
  last_name?: string;
  /** Username of the user or bot (optional) */
  username?: string;
  /** IETF language tag of the user's language (optional) */
  language_code?: string;
  /** True if this user is a bot (optional, returns in receiver field only) */
  is_bot?: boolean;
  /** True if this user is a Telegram Premium user (optional) */
  is_premium?: boolean;
  /** True if this user added the bot to the attachment menu (optional) */
  added_to_attachment_menu?: boolean;
}

/**
 * Telegram WebApp initDataUnsafe structure
 */
export interface TelegramWebAppInitDataUnsafe {
  /** User information */
  user?: TelegramWebAppUser;
  /** Receiver information (optional) */
  receiver?: TelegramWebAppUser;
  /** Chat information (optional) */
  chat?: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    photo_url?: string;
  };
  /** Start parameter (optional) */
  start_param?: string;
  /** Can send after date (optional) */
  can_send_after?: number;
  /** Auth date */
  auth_date: number;
  /** Hash for validation */
  hash: string;
}

/**
 * Telegram WebApp interface
 */
export interface TelegramWebApp {
  /** Signal that the app is ready */
  ready: () => void;
  /** Expand the app */
  expand: () => void;
  /** Close the app */
  close: () => void;
  /** Initialization data (raw string) */
  initData: string;
  /** Unsafe initialization data (parsed, not validated) */
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  /** Version of the WebApp */
  version: string;
  /** Platform */
  platform: string;
  /** Color scheme */
  colorScheme: 'light' | 'dark';
  /** Theme params */
  themeParams: Record<string, any>;
  /** Is expanded */
  isExpanded: boolean;
  /** Viewport height */
  viewportHeight: number;
  /** Viewport stable height */
  viewportStableHeight: number;
  /** Header color */
  headerColor: string;
  /** Background color */
  backgroundColor: string;
  /** Back button */
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  /** Main button */
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  /** Haptic feedback */
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Mock data for local development (from .env or defaults)
function getMockUser(): TelegramWebAppUser {
  return {
    id: Number(import.meta.env.VITE_MOCK_USER_ID) || 6884869563,
    first_name: import.meta.env.VITE_MOCK_FIRST_NAME || 'Test',
    last_name: import.meta.env.VITE_MOCK_LAST_NAME || 'User',
    username: import.meta.env.VITE_MOCK_USERNAME || 'tgbot1',
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
  const webApp = ref<TelegramWebApp | null>(null);
  const user = ref<TelegramWebAppUser | null>(null);
  const initData = ref<string | null>(null);

  // Initialize mock data immediately if Telegram WebApp is not available
  if (isDevelopment()) {
    console.warn('[DEV] Using mock Telegram WebApp data');
    const mockUser = getMockUser();
    webApp.value = {
      ready: () => {},
      expand: () => {},
      close: () => {},
      initData: getMockInitData(),
      initDataUnsafe: {
        user: mockUser,
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'mock_hash',
      },
      version: '6.0',
      platform: 'web',
      colorScheme: 'dark',
      themeParams: {},
      isExpanded: true,
      viewportHeight: 600,
      viewportStableHeight: 600,
      headerColor: '#000000',
      backgroundColor: '#000000',
      BackButton: {
        isVisible: false,
        onClick: () => {},
        offClick: () => {},
        show: () => {},
        hide: () => {},
      },
      MainButton: {
        text: '',
        color: '',
        textColor: '',
        isVisible: false,
        isActive: true,
        isProgressVisible: false,
        setText: () => {},
        onClick: () => {},
        offClick: () => {},
        show: () => {},
        hide: () => {},
        enable: () => {},
        disable: () => {},
        showProgress: () => {},
        hideProgress: () => {},
        setParams: () => {},
      },
      HapticFeedback: {
        impactOccurred: () => {},
        notificationOccurred: () => {},
        selectionChanged: () => {},
      },
    } as TelegramWebApp;
    initData.value = getMockInitData();
    user.value = mockUser;

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