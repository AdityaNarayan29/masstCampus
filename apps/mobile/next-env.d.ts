/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_API_BASE_URL?: string;
    readonly BACKEND_URL?: string;
  }
}

export {};
