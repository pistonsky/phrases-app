declare module '*.png' {
  const value: number
  export default value
}

declare const __DEV__: boolean

declare module NodeJS {
  interface Module {
    hot?: {
      accept(path: string, callback: () => void): void
    }
  }
}
