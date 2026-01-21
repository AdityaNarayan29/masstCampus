"use client"

import { useState } from "react"
import type { TenantTheme } from "@school-crm/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ColorPicker, ColorSwatch } from "./color-picker"
import { themePresets, getDefaultTheme, type ThemePreset } from "@/lib/theme-presets"
import { cn } from "@/lib/utils"
import { CheckIcon, PaletteIcon, SettingsIcon, EyeIcon, RotateCcwIcon } from "lucide-react"

interface SchoolThemeSettingsProps {
  theme: TenantTheme
  onChange: (theme: TenantTheme) => void
}

const fontOptions = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "system-ui, sans-serif", label: "System UI" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "Open Sans, sans-serif", label: "Open Sans" },
  { value: "Lato, sans-serif", label: "Lato" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "Source Sans Pro, sans-serif", label: "Source Sans Pro" },
]

export function SchoolThemeSettings({ theme, onChange }: SchoolThemeSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(() => {
    // Try to find matching preset
    const match = themePresets.find(
      (p) => p.theme.colors.primary === theme.colors.primary
    )
    return match?.id || null
  })

  const handlePresetSelect = (preset: ThemePreset) => {
    setSelectedPresetId(preset.id)
    onChange({
      ...theme,
      colors: { ...preset.theme.colors },
      fonts: preset.theme.fonts ? { ...preset.theme.fonts } : theme.fonts,
    })
  }

  const handleColorChange = (key: keyof TenantTheme["colors"], value: string) => {
    setSelectedPresetId(null) // Custom colors, no preset
    onChange({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value,
      },
    })
  }

  const handleFontChange = (key: keyof NonNullable<TenantTheme["fonts"]>, value: string) => {
    onChange({
      ...theme,
      fonts: {
        ...theme.fonts,
        [key]: value,
      },
    })
  }

  const handleReset = () => {
    const defaultTheme = getDefaultTheme()
    setSelectedPresetId("default")
    onChange(defaultTheme)
  }

  return (
    <div className="space-y-6">
      {/* Preset Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold flex items-center gap-2">
              <PaletteIcon className="h-4 w-4" />
              Theme Presets
            </Label>
            <p className="text-sm text-muted-foreground">
              Choose a preset or customize colors below
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1"
          >
            <RotateCcwIcon className="h-3 w-3" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {themePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                "relative flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:border-primary/50",
                selectedPresetId === preset.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              {selectedPresetId === preset.id && (
                <div className="absolute top-1 right-1">
                  <CheckIcon className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className="flex gap-1 mb-2">
                <ColorSwatch color={preset.theme.colors.primary} size="sm" />
                <ColorSwatch color={preset.theme.colors.secondary} size="sm" />
                <ColorSwatch color={preset.theme.colors.accent} size="sm" />
              </div>
              <span className="text-xs font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Live Preview */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <EyeIcon className="h-4 w-4" />
          Preview
        </Label>
        <ThemePreview theme={theme} />
      </div>

      <Separator />

      {/* Primary Color Quick Edit */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Primary Color</Label>
        <div className="flex items-center gap-4">
          <ColorPicker
            label=""
            value={theme.colors.primary}
            onChange={(value) => handleColorChange("primary", value)}
          />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Main brand color used for buttons, links, and accents
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Advanced Settings Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base font-semibold flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Advanced Customization
          </Label>
          <p className="text-sm text-muted-foreground">
            Fine-tune individual color values and fonts
          </p>
        </div>
        <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
      </div>

      {/* Advanced Color Settings */}
      {showAdvanced && (
        <div className="space-y-6 pt-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Color Palette</CardTitle>
              <CardDescription>Customize each color in the theme</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <ColorPicker
                label="Primary"
                description="Main brand color"
                value={theme.colors.primary}
                onChange={(v) => handleColorChange("primary", v)}
              />
              <ColorPicker
                label="Secondary"
                description="Secondary actions and backgrounds"
                value={theme.colors.secondary}
                onChange={(v) => handleColorChange("secondary", v)}
              />
              <ColorPicker
                label="Accent"
                description="Highlights and focus states"
                value={theme.colors.accent}
                onChange={(v) => handleColorChange("accent", v)}
              />
              <ColorPicker
                label="Background"
                description="Page background"
                value={theme.colors.background}
                onChange={(v) => handleColorChange("background", v)}
              />
              <ColorPicker
                label="Foreground"
                description="Main text color"
                value={theme.colors.foreground}
                onChange={(v) => handleColorChange("foreground", v)}
              />
              <ColorPicker
                label="Muted"
                description="Subtle backgrounds"
                value={theme.colors.muted}
                onChange={(v) => handleColorChange("muted", v)}
              />
              <ColorPicker
                label="Muted Foreground"
                description="Secondary text"
                value={theme.colors.mutedForeground}
                onChange={(v) => handleColorChange("mutedForeground", v)}
              />
              <ColorPicker
                label="Border"
                description="Borders and dividers"
                value={theme.colors.border}
                onChange={(v) => handleColorChange("border", v)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Typography</CardTitle>
              <CardDescription>Choose fonts for headings and body text</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select
                  value={theme.fonts?.heading || "Inter, sans-serif"}
                  onValueChange={(v) => handleFontChange("heading", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem
                        key={font.value}
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select
                  value={theme.fonts?.body || "Inter, sans-serif"}
                  onValueChange={(v) => handleFontChange("body", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem
                        key={font.value}
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Live preview component
function ThemePreview({ theme }: { theme: TenantTheme }) {
  return (
    <div
      className="rounded-lg border p-4 space-y-3"
      style={{
        backgroundColor: `hsl(${theme.colors.background})`,
        borderColor: `hsl(${theme.colors.border})`,
        fontFamily: theme.fonts?.body,
      }}
    >
      <div className="space-y-1">
        <h3
          className="text-lg font-semibold"
          style={{
            color: `hsl(${theme.colors.foreground})`,
            fontFamily: theme.fonts?.heading,
          }}
        >
          School Dashboard
        </h3>
        <p
          className="text-sm"
          style={{ color: `hsl(${theme.colors.mutedForeground})` }}
        >
          This is how your school portal will look
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 text-sm font-medium rounded-md text-white"
          style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
        >
          Primary Button
        </button>
        <button
          className="px-3 py-1.5 text-sm font-medium rounded-md"
          style={{
            backgroundColor: `hsl(${theme.colors.secondary})`,
            color: `hsl(${theme.colors.foreground})`,
          }}
        >
          Secondary
        </button>
        <Badge
          variant="outline"
          style={{
            borderColor: `hsl(${theme.colors.border})`,
            color: `hsl(${theme.colors.foreground})`,
          }}
        >
          Active
        </Badge>
      </div>

      <div
        className="p-3 rounded-md text-sm"
        style={{
          backgroundColor: `hsl(${theme.colors.muted})`,
          color: `hsl(${theme.colors.mutedForeground})`,
        }}
      >
        Muted background for cards and sections
      </div>
    </div>
  )
}
