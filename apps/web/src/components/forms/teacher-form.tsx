"use client"

import { useState } from "react"
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
import { teacherSchema, type TeacherFormData } from "@/lib/schemas"

type Teacher = {
  id: string
  name: string
  email: string
  phone: string
  school: string
  subjects: string[]
  status: "active" | "inactive" | "on_leave"
  joinedAt: string
  avatar?: string
}

interface TeacherFormProps {
  teacher?: Teacher | null
  schools: string[]
  onSubmit: (data: TeacherFormData) => void
  onCancel: () => void
}

export function TeacherForm({ teacher, schools, onSubmit, onCancel }: TeacherFormProps) {
  const [formData, setFormData] = useState<TeacherFormData>({
    name: teacher?.name || "",
    email: teacher?.email || "",
    phone: teacher?.phone || "",
    school: teacher?.school || "",
    subjects: teacher?.subjects?.join(", ") || "",
    status: teacher?.status || "active",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = teacherSchema.safeParse(formData)
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
        <Label htmlFor="name">Teacher Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter teacher name"
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
          placeholder="teacher@email.com"
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
        <Label htmlFor="school">School</Label>
        <Select
          value={formData.school}
          onValueChange={(value) => setFormData({ ...formData, school: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select school" />
          </SelectTrigger>
          <SelectContent>
            {schools.map((school) => (
              <SelectItem key={school} value={school}>
                {school}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.school && <p className="text-sm text-destructive">{errors.school}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subjects">Subjects</Label>
        <Input
          id="subjects"
          value={formData.subjects}
          onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
          placeholder="Physics, Chemistry, Mathematics"
        />
        <p className="text-xs text-muted-foreground">Separate multiple subjects with commas</p>
        {errors.subjects && <p className="text-sm text-destructive">{errors.subjects}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: "active" | "inactive" | "on_leave") =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {teacher ? "Update Teacher" : "Add Teacher"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
