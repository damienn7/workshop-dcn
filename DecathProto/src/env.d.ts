interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // more env vars can be defined here
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
