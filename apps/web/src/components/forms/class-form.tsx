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
import { classSchema, type ClassFormData } from "@/lib/schemas"

type Class = {
  id: string
  name: string
  school: string
  grade: string
  section: string
  students: number
  teacher: string
  status: "active" | "inactive"
  createdAt: string
}

interface ClassFormProps {
  classItem?: Class | null
  schools: string[]
  onSubmit: (data: ClassFormData) => void
  onCancel: () => void
}

export function ClassForm({ classItem, schools, onSubmit, onCancel }: ClassFormProps) {
  const [formData, setFormData] = useState<ClassFormData>({
    name: classItem?.name || "",
    school: classItem?.school || "",
    grade: classItem?.grade || "",
    section: classItem?.section || "",
    teacher: classItem?.teacher || "",
    status: classItem?.status || "active",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = classSchema.safeParse(formData)
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
        <Label htmlFor="name">Class Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Class 12-A"
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) => setFormData({ ...formData, grade: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {["9th", "10th", "11th", "12th"].map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.grade && <p className="text-sm text-destructive">{errors.grade}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Select
            value={formData.section}
            onValueChange={(value) => setFormData({ ...formData, section: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {["A", "B", "C", "D"].map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.section && <p className="text-sm text-destructive">{errors.section}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teacher">Class Teacher</Label>
        <Input
          id="teacher"
          value={formData.teacher}
          onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
          placeholder="Enter teacher name"
        />
        {errors.teacher && <p className="text-sm text-destructive">{errors.teacher}</p>}
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
          {classItem ? "Update Class" : "Add Class"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
