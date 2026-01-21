"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { hslToHex, hexToHsl } from "@/lib/theme-presets"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  label: string
  value: string // HSL values without hsl() wrapper, e.g., "222.2 47.4% 11.2%"
  onChange: (value: string) => void
  description?: string
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(() => hslToHex(value))

  useEffect(() => {
    setHexValue(hslToHex(value))
  }, [value])

  const handleHexChange = (hex: string) => {
    setHexValue(hex)
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hexToHsl(hex))
    }
  }

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    setHexValue(hex)
    onChange(hexToHsl(hex))
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={hexValue}
            onChange={handleColorPickerChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-10 h-10 rounded-md border border-input shadow-sm cursor-pointer"
            style={{ backgroundColor: hexValue }}
          />
        </div>
        <Input
          value={hexValue}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#000000"
          className="w-28 font-mono text-sm"
        />
        <div className="flex-1 text-xs text-muted-foreground font-mono truncate">
          {value}
        </div>
      </div>
    </div>
  )
}

interface ColorSwatchProps {
  color: string // HSL values
  isSelected?: boolean
  onClick?: () => void
  size?: "sm" | "md" | "lg"
}

export function ColorSwatch({ color, isSelected, onClick, size = "md" }: ColorSwatchProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        "rounded-md border-2 transition-all hover:scale-110",
        isSelected ? "border-foreground ring-2 ring-foreground ring-offset-2" : "border-transparent"
      )}
      style={{ backgroundColor: `hsl(${color})` }}
    />
  )
}
