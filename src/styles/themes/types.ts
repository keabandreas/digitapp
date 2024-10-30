// src/styles/themes/types.ts
export interface ThemeColors {
  "--background": string
  "--foreground": string
  "--card": string
  "--card-foreground": string
  "--popover": string
  "--popover-foreground": string
  "--primary": string
  "--primary-foreground": string
  "--secondary": string
  "--secondary-foreground": string
  "--muted": string
  "--muted-foreground": string
  "--accent": string
  "--accent-foreground": string
  "--destructive": string
  "--destructive-foreground": string
  "--border": string
  "--input": string
  "--ring": string
  "--radius": string
}

export interface Theme {
  name: string
  description?: string
  light?: ThemeColors
  dark?: ThemeColors
}
