// Packages and app modules that have no type definitions in this tree.
// Imports stay `any` so the conversion does not invent API contracts.
declare module 'react-native'
declare module 'app/utils/config'

declare const Audio: any
declare const store: any
declare const RECORDING_PERMISSIONS_DENIED: any

declare const console: {
  log(...args: any[]): void
}
declare function require(id: string): any
declare function setInterval(handler: (...args: any[]) => void, timeout?: number): any
declare function clearInterval(handle: any): void
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number): any
declare function clearTimeout(handle: any): void
declare function requestAnimationFrame(callback: (...args: any[]) => void): any

declare const module: {
  hot?: {
    accept(path: string, callback: () => void): void
  }
  exports: any
}
