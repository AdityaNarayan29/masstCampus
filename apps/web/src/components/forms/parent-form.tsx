"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { parentSchema, type ParentFormData } from "@/lib/schemas"

type Parent = {
  id: string
  name: string
  email: string
  phone: string
  children: number
  occupation?: string
  address?: string
  status: "active" | "inactive"
  createdAt: string
}

interface ParentFormProps {
  parent?: Parent | null
  onSubmit: (data: ParentFormData) => void
  onCancel: () => void
}

export function ParentForm({ parent, onSubmit, onCancel }: ParentFormProps) {
  const [formData, setFormData] = useState<ParentFormData>({
    name: parent?.name || "",
    email: parent?.email || "",
    phone: parent?.phone || "",
    occupation: parent?.occupation || "",
    address: parent?.address || "",
    status: parent?.status || "active",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = parentSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit(result.data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Parent Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter parent name"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="parent@email.com"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+91 98765 43210"
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupation">Occupation (Optional)</Label>
        <Input
          id="occupation"
          value={formData.occupation || ""}
          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
          placeholder="e.g., Engineer, Doctor, Business"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address (Optional)</Label>
        <Textarea
          id="address"
          value={formData.address || ""}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter address"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: "active" | "inactive") =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {parent ? "Update Parent" : "Add Parent"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
