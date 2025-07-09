interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
    readonly HOST: string;
    readonly PORT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}