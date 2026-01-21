"use client"

import type { TenantTheme } from "@school-crm/types"

export interface ThemePreset {
  id: string
  name: string
  description: string
  theme: TenantTheme
}

// Default presets inspired by tweakcn and popular design systems
export const themePresets: ThemePreset[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean shadcn default theme",
    theme: {
      colors: {
        primary: "222.2 47.4% 11.2%",
        secondary: "210 40% 96.1%",
        accent: "210 40% 96.1%",
        background: "0 0% 100%",
        foreground: "222.2 84% 4.9%",
        muted: "210 40% 96.1%",
        mutedForeground: "215.4 16.3% 46.9%",
        border: "214.3 31.8% 91.4%",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
    },
  },
  {
    id: "blue",
    name: "Ocean Blue",
    description: "Professional blue theme",
    theme: {
      colors: {
        primary: "221.2 83.2% 53.3%",
        secondary: "210 40% 96.1%",
        accent: "210 40% 96.1%",
        background: "0 0% 100%",
        foreground: "222.2 84% 4.9%",
        muted: "210 40% 96.1%",
        mutedForeground: "215.4 16.3% 46.9%",
        border: "214.3 31.8% 91.4%",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
    },
  },
  {
    id: "green",
    name: "Forest Green",
    description: "Fresh and natural green theme",
    theme: {
      colors: {
        primary: "142.1 76.2% 36.3%",
        secondary: "138 76% 97%",
        accent: "142.1 76.2% 36.3%",
        background: "0 0% 100%",
        foreground: "240 10% 3.9%",
        muted: "138 76% 97%",
        mutedForeground: "240 3.8% 46.1%",
        border: "240 5.9% 90%",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
    },
  },
  {
    id: "purple",
    name: "Royal Purple",
    description: "Elegant purple theme",
    theme: {
      colors: {
        primary: "262.1 83.3% 57.8%",
        secondary: "270 100% 98%",
        accent: "262.1 83.3% 57.8%",
        background: "0 0% 100%",
        foreground: "224 71.4% 4.1%",
        muted: "270 100% 98%",
        mutedForeground: "215.4 16.3% 46.9%",
        border: "220 13% 91%",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
    },
  },
  {
    id: "orange",
    name: "Sunset Orange",
    description: "Warm and energetic orange theme",
    theme: {
      colors: {
        primary: "24.6 95% 53.1%",
        secondary: "30 100% 97%",
        accent: "24.6 95% 53.1%",
        background: "0 0% 100%",
        foreground: "20 14.3% 4.1%",
        muted: "30 100% 97%",
        mutedForeground: "25 5.3% 44.7%",
        border: "20 5.9% 90%",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
    },
  },
  {
    id: "rose",
    name: "Rose Pink",
    description: "Soft and modern rose theme",
    theme: {
      colors: {
        primary: "346.8 77.2% 49.8%",
        secondary: "340 100% 97%",
        accent: "346.8 77.2% 49.8%",
        background: "0 0% 100%",
        foreground: "240 10% 3.9%",
        muted: "340 100% 97%",
        mutedForeground: "240 3.8% 46.1%",
        border: "240 5.9% 90%",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
    },
  },
  {
    id: "teal",
    name: "Teal",
    description: "Cool and calming teal theme",
    theme: {
      colors: {
        primary: "173 80% 40%",
        secondary: "170 80% 97%",
        accent: "173 80% 40%",
        background: "0 0% 100%",
        foreground: "240 10% 3.9%",
        muted: "170 80% 97%",
        mutedForeground: "240 3.8% 46.1%",
        border: "240 5.9% 90%",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Neutral and professional slate theme",
    theme: {
      colors: {
        primary: "215.4 16.3% 46.9%",
        secondary: "210 40% 96.1%",
        accent: "215.4 16.3% 46.9%",
        background: "0 0% 100%",
        foreground: "222.2 84% 4.9%",
        muted: "210 40% 96.1%",
        mutedForeground: "215.4 16.3% 46.9%",
        border: "214.3 31.8% 91.4%",
      },
      fonts: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
    },
  },
]

// Convert HSL values to hsl() string format for CSS
export function hslToString(hsl: string): string {
  // If already has hsl() wrapper, return as-is
  if (hsl.startsWith("hsl(")) return hsl
  return `hsl(${hsl})`
}

// Parse hsl() string to just the values
export function parseHsl(hslString: string): string {
  const match = hslString.match(/hsl\(([\d.\s%]+)\)/)
  return match ? match[1] : hslString
}

// Convert hex to HSL values string
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, "")

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// Convert HSL values to hex
export function hslToHex(hsl: string): string {
  const parts = hsl.replace(/%/g, "").split(" ").map(Number)
  if (parts.length < 3) return "#000000"

  const h = parts[0] / 360
  const s = parts[1] / 100
  const l = parts[2] / 100

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueToRgb(p, q, h + 1 / 3)
    g = hueToRgb(p, q, h)
    b = hueToRgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getDefaultTheme(): TenantTheme {
  return themePresets[0].theme
}
