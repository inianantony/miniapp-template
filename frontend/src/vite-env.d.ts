/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_BASE_PATH: string
  readonly VITE_API_BASE: string
  readonly VITE_AUTH_TOKEN_URL: string
  readonly VITE_USE_MOCK_CRUD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}