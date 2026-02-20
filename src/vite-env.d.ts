/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_LIFF_ID_CREDIT: string;
  readonly VITE_LINE_CHANNEL_ID: string;
  readonly VITE_MOCK_USER_ID: string;
  readonly VITE_MOCK_USERNAME: string;
  readonly VITE_MOCK_FIRST_NAME: string;
  readonly VITE_MOCK_LAST_NAME: string;
  readonly VITE_MOCK_INIT_DATA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

