declare module '*.png' {
  const value: number
  export default value
}

declare module 'app/utils/config' {
  export const BASE_URL: string
  export const BASE_AUDIO_URL: string
  export const S3_BUCKET: string
  export const S3_REGION: string
  export const S3_ACCESS_KEY: string
  export const S3_SECRET_KEY: string
}

declare const __DEV__: boolean

declare const module: {
  hot?: {
    accept(path: string, callback: () => void): void
  }
  exports: any
}
