"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, TrashIcon } from "lucide-react";

export interface TeacherRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  classAssignments: string[]; // e.g. ["Class 5-A", "Class 5-B"]
}

export interface TeacherSetupData {
  teachers: TeacherRow[];
}

interface StepTeacherSetupProps {
  data: TeacherSetupData;
  onChange: (data: TeacherSetupData) => void;
  availableClasses: string[]; // from step 2
  errors: Record<string, string>;
}

function emptyTeacher(): TeacherRow {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    classAssignments: [],
  };
}

export function StepTeacherSetup({
  data,
  onChange,
  availableClasses,
  errors,
}: StepTeacherSetupProps) {
  const updateTeacher = (index: number, field: keyof TeacherRow, value: any) => {
    const teachers = [...data.teachers];
    teachers[index] = { ...teachers[index], [field]: value };
    onChange({ teachers });
  };

  const addTeacher = () => {
    onChange({ teachers: [...data.teachers, emptyTeacher()] });
  };

  const removeTeacher = (index: number) => {
    onChange({ teachers: data.teachers.filter((_, i) => i !== index) });
  };

  const toggleClass = (teacherIndex: number, className: string) => {
    const teacher = data.teachers[teacherIndex];
    const current = teacher.classAssignments;
    const next = current.includes(className)
      ? current.filter((c) => c !== className)
      : [...current, className];
    updateTeacher(teacherIndex, "classAssignments", next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Teacher Setup</CardTitle>
        <CardDescription>
          Add your teachers and assign them to classes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.teachers.map((teacher, idx) => (
          <div
            key={idx}
            className="space-y-4 rounded-lg border bg-background p-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Teacher {idx + 1}</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTeacher(idx)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={teacher.firstName}
                  onChange={(e) =>
                    updateTeacher(idx, "firstName", e.target.value)
                  }
                  placeholder="First name"
                />
                {errors[`teacher_${idx}_firstName`] && (
                  <p className="text-sm text-destructive">
                    {errors[`teacher_${idx}_firstName`]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={teacher.lastName}
                  onChange={(e) =>
                    updateTeacher(idx, "lastName", e.target.value)
                  }
                  placeholder="Last name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={teacher.email}
                  onChange={(e) => updateTeacher(idx, "email", e.target.value)}
                  placeholder="teacher@school.com"
                />
                {errors[`teacher_${idx}_email`] && (
                  <p className="text-sm text-destructive">
                    {errors[`teacher_${idx}_email`]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={teacher.phone}
                  onChange={(e) => updateTeacher(idx, "phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Subject</Label>
                <Input
                  value={teacher.subject}
                  onChange={(e) =>
                    updateTeacher(idx, "subject", e.target.value)
                  }
                  placeholder="e.g., Mathematics, English"
                />
              </div>
            </div>

            {/* Class assignments */}
            {availableClasses.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Assign to Classes</Label>
                <div className="flex flex-wrap gap-2">
                  {availableClasses.map((cls) => {
                    const isAssigned =
                      teacher.classAssignments.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleClass(idx, cls)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                          isAssigned
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        <Button variant="outline" onClick={addTeacher} className="w-full">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>

        {data.teachers.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No teachers added yet. Click above to add your first teacher.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
