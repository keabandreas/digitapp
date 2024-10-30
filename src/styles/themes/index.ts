// src/styles/themes/index.ts
import { norddark } from './nord-dark'
import { nordlight } from './nord-light'
import type { Theme } from './types'

export const themes: Record<string, Theme> = {
  norddark,
  nordlight
} as const

export type ThemeNames = keyof typeof themes
export * from './types'
