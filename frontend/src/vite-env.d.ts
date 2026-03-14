/// <reference types="vite/client" />

// `fetchpriority` is a standard HTML attribute (lowercase) but React 18's
// type definitions only expose the camelCase `fetchPriority` alias, which
// triggers a React DOM warning at runtime. Declare the lowercase form here
// so TypeScript accepts it without a cast.
declare namespace React {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto'
  }
}

interface ImportMetaEnv {
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_COGNITO_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
