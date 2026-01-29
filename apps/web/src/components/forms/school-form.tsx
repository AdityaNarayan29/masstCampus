"use client"

import { useState } from "react"
import type { TenantTheme } from "@school-crm/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { schoolSchema, type SchoolFormData, type SchoolWithThemeFormData } from "@/lib/schemas"
import { getDefaultTheme } from "@/lib/theme-presets"
import { SchoolThemeSettings } from "@/components/theme/school-theme-settings"
import { BuildingIcon, PaletteIcon } from "lucide-react"

type School = {
  id: string
  name: string
  domain: string
  students: number
  teachers: number
  status: "active" | "inactive" | "pending"
  plan: "free" | "basic" | "premium"
  createdAt: string
  theme?: TenantTheme
}

interface SchoolFormProps {
  school?: School | null
  onSubmit: (data: SchoolWithThemeFormData) => void
  onCancel: () => void
}

export function SchoolForm({ school, onSubmit, onCancel }: SchoolFormProps) {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: school?.name || "",
    domain: school?.domain || "",
    status: school?.status || "active",
    plan: school?.plan || "free",
  })
  const [theme, setTheme] = useState<TenantTheme>(() => {
    if (school?.theme) return school.theme
    return getDefaultTheme()
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("basic")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = schoolSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message
        }
      })
      setErrors(fieldErrors)
      setActiveTab("basic") // Switch to basic tab to show errors
      return
    }
    setErrors({})
    onSubmit({ ...result.data, theme })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="gap-2">
            <BuildingIcon className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <PaletteIcon className="h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden mt-4">
          <TabsContent value="basic" className="h-full m-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">School Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter school name"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="school.masstcampus.com"
                />
                {errors.domain && <p className="text-sm text-destructive">{errors.domain}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "pending") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value: "free" | "basic" | "premium") =>
                    setFormData({ ...formData, plan: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                {errors.plan && <p className="text-sm text-destructive">{errors.plan}</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="theme" className="h-full m-0 overflow-y-auto pr-2">
            <SchoolThemeSettings theme={theme} onChange={setTheme} />
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex gap-2 pt-4 mt-4 border-t">
        <Button type="submit" className="flex-1">
          {school ? "Update School" : "Add School"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
