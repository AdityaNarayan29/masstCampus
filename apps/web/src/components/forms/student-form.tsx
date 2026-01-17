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
import { studentSchema, type StudentFormData } from "@/lib/schemas"

type Student = {
  id: string
  name: string
  email: string
  phone: string
  school: string
  grade: string
  status: "active" | "inactive" | "graduated"
  enrolledAt: string
  avatar?: string
}

interface StudentFormProps {
  student?: Student | null
  schools: string[]
  onSubmit: (data: StudentFormData) => void
  onCancel: () => void
}

export function StudentForm({ student, schools, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    school: student?.school || "",
    grade: student?.grade || "",
    status: student?.status || "active",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = studentSchema.safeParse(formData)
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
        <Label htmlFor="name">Student Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter student name"
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
          placeholder="student@email.com"
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
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: "active" | "inactive" | "graduated") =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="graduated">Graduated</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {student ? "Update Student" : "Add Student"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
