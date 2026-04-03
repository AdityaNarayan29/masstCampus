"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDownIcon, CheckCircle2Icon, XCircleIcon, ClockIcon, CalendarIcon, Users2Icon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { PageLayout } from "@/components/page-layout"
import { EntityTable } from "@/components/entity-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { attendanceApi, classesApi, parentsApi } from "@/lib/api"
import { ParentAttendance } from "@/components/parent-attendance"

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE"

type AttendanceRecord = {
  id: string
  studentId: string
  classId: string
  date: string
  status: AttendanceStatus | "EXCUSED"
  notes?: string
  student?: { id: string; firstName: string; lastName: string; enrollmentNumber: string }
  class?: { id: string; name: string; gradeLevel: string; section: string }
}

type ClassItem = {
  id: string
  name: string
  gradeLevel: string
  section: string
}

type Student = {
  id: string
  firstName: string
  lastName: string
  enrollmentNumber: string
}

const STATUS_CYCLE: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE"]

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; text: string; border: string; icon: typeof CheckCircle2Icon }> = {
  PRESENT: { label: "Present", bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800", icon: CheckCircle2Icon },
  ABSENT: { label: "Absent", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800", icon: XCircleIcon },
  LATE: { label: "Late", bg: "bg-yellow-50 dark:bg-yellow-950/30", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-800", icon: ClockIcon },
}

function StatusToggle({ status, onToggle }: { status: AttendanceStatus; onToggle: () => void }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 min-h-[44px] min-w-[110px] justify-center font-medium transition-all active:scale-95 select-none ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm">{config.label}</span>
    </button>
  )
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [bulkAttendance, setBulkAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [userRole, setUserRole] = useState<string>("")
  const [childIds, setChildIds] = useState<Set<string>>(new Set())

  // Stats
  const stats = {
    present: attendance.filter((a) => a.status === "PRESENT").length,
    absent: attendance.filter((a) => a.status === "ABSENT").length,
    late: attendance.filter((a) => a.status === "LATE").length,
    excused: attendance.filter((a) => a.status === "EXCUSED").length,
    total: attendance.length,
  }

  // Bulk attendance summary (for the sheet)
  const bulkSummary = {
    present: Object.values(bulkAttendance).filter((s) => s === "PRESENT").length,
    absent: Object.values(bulkAttendance).filter((s) => s === "ABSENT").length,
    late: Object.values(bulkAttendance).filter((s) => s === "LATE").length,
    total: Object.keys(bulkAttendance).length,
  }

  const isParent = userRole === "PARENT"

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setUserRole(user.role || "")

        // If parent, load their children
        if (user.role === "PARENT") {
          parentsApi.getMyChildren().then(res => {
            if (res.success && res.data) {
              setChildIds(new Set(res.data.map((c: any) => c.id)))
            }
          }).catch(() => {})
        }
      } catch {}
    }

    const loadData = async () => {
      try {
        const classesRes = await classesApi.getAll()
        if (classesRes.success && classesRes.data) {
          const classesData = classesRes.data.classes || classesRes.data
          const formatted = classesData.map((c: any) => ({
            id: c.id,
            name: c.name,
            gradeLevel: c.gradeLevel,
            section: c.section,
          }))
          setClasses(formatted)
        }
      } catch (error) {
        console.error("Failed to load classes:", error)
        toast.error("Failed to load classes")
      }
    }
    loadData()
  }, [])

  // Load attendance when class or date changes
  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadAttendance()
    }
  }, [selectedClass, selectedDate])

  const loadAttendance = async () => {
    if (!selectedClass) return

    setLoading(true)
    try {
      const res = await attendanceApi.getAll({
        classId: selectedClass,
        date: selectedDate,
      })
      if (res.success && res.data) {
        let records = Array.isArray(res.data) ? res.data : res.data.attendance || []
        // If parent, filter to only their children
        if (userRole === "PARENT" && childIds.size > 0) {
          records = records.filter((r: any) => childIds.has(r.studentId))
        }
        setAttendance(records)
      }
    } catch (error) {
      console.error("Failed to load attendance:", error)
    }
    setLoading(false)
  }

  const loadStudentsForClass = async () => {
    if (!selectedClass) return

    setLoadingStudents(true)
    try {
      const res = await classesApi.getStudents(selectedClass)
      if (res.success) {
        const studentData = Array.isArray(res.data) ? res.data : res.data.students || []
        setStudents(studentData)
        // Initialize all students to PRESENT (one-tap: default everyone present)
        const initial: Record<string, AttendanceStatus> = {}
        studentData.forEach((s: Student) => {
          initial[s.id] = "PRESENT"
        })
        setBulkAttendance(initial)
      }
    } catch (error) {
      console.error("Failed to load students for class:", error)
      toast.error("Failed to load students")
    }
    setLoadingStudents(false)
  }

  const handleMarkAttendance = () => {
    if (!selectedClass) {
      toast.error("Please select a class first")
      return
    }
    loadStudentsForClass()
    setIsSheetOpen(true)
  }

  const handleMarkAllPresent = useCallback(() => {
    const allPresent: Record<string, AttendanceStatus> = {}
    students.forEach((s) => {
      allPresent[s.id] = "PRESENT"
    })
    setBulkAttendance(allPresent)
    toast.success("All students marked present")
  }, [students])

  const handleToggleStatus = useCallback((studentId: string) => {
    setBulkAttendance((prev) => {
      const current = prev[studentId] || "PRESENT"
      const currentIndex = STATUS_CYCLE.indexOf(current)
      const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length]
      return { ...prev, [studentId]: nextStatus }
    })
  }, [])

  const handleSubmitBulkAttendance = async () => {
    if (!selectedClass || !selectedDate) return

    setSubmitting(true)
    const records = Object.entries(bulkAttendance).map(([studentId, status]) => ({
      studentId,
      status,
    }))

    try {
      const res = await attendanceApi.bulkMark({
        classId: selectedClass,
        date: selectedDate,
        records,
      })
      if (res.success) {
        toast.success(`Attendance marked for ${records.length} students`)
        setIsSheetOpen(false)
        loadAttendance()
      }
    } catch (error) {
      // Demo mode - update local state
      const newAttendance = Object.entries(bulkAttendance).map(([studentId, status], index) => ({
        id: String(Date.now() + index),
        studentId,
        classId: selectedClass,
        date: selectedDate,
        status: status as AttendanceRecord["status"],
        student: students.find(s => s.id === studentId),
        class: classes.find(c => c.id === selectedClass),
      }))
      setAttendance(newAttendance)
      toast.success(`Attendance marked for ${records.length} students (Demo Mode)`)
      setIsSheetOpen(false)
    }
    setSubmitting(false)
  }

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "student",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const student = row.original.student
        return (
          <div>
            <div className="font-medium">
              {student?.firstName} {student?.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {student?.enrollmentNumber}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "class",
      header: "Class",
      cell: ({ row }) => {
        const classItem = row.original.class
        return (
          <div>
            {classItem?.gradeLevel} - {classItem?.section}
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"))
        return <div>{format(date, "dd/MM/yyyy")}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; icon: any }> = {
          PRESENT: { variant: "default", icon: CheckCircle2Icon },
          ABSENT: { variant: "destructive", icon: XCircleIcon },
          LATE: { variant: "secondary", icon: ClockIcon },
          EXCUSED: { variant: "outline", icon: CalendarIcon },
        }
        const config = variants[status] || variants.PRESENT
        const Icon = config.icon
        return (
          <Badge variant={config.variant} className="flex w-fit items-center gap-1">
            <Icon className="h-3 w-3" />
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("notes") || "-"}
        </div>
      ),
    },
  ]

  if (isParent) {
    return (
      <PageLayout title="My Attendance" breadcrumbs={[{ label: "My Attendance" }]}>
        <ParentAttendance />
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Attendance" breadcrumbs={[{ label: "Attendance" }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Mark and track student attendance
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Class & Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="w-[200px]">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.gradeLevel} - {c.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              {!isParent && (
                <div className="flex items-end">
                  <Button onClick={handleMarkAttendance} disabled={!selectedClass} size="lg">
                    <Users2Icon className="mr-2 h-4 w-4" />
                    Mark Attendance
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Excused</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              {selectedClass
                ? `Showing attendance for ${selectedDate}`
                : "Select a class to view attendance"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityTable
              columns={columns}
              data={attendance}
              searchKey="student"
              searchPlaceholder="Search students..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Bulk Attendance Sheet - Redesigned for one-tap marking */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-[500px] flex flex-col p-0">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-background border-b px-6 pt-6 pb-4">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-xl">Mark Attendance</SheetTitle>
              <SheetDescription>
                {selectedClass && (() => {
                  const cls = classes.find((c) => c.id === selectedClass)
                  return cls ? `${cls.gradeLevel} - ${cls.section}` : ""
                })()}{" "}
                | {selectedDate}
              </SheetDescription>
            </SheetHeader>

            {/* Mark All Present - the one-tap action */}
            <Button
              onClick={handleMarkAllPresent}
              variant="outline"
              className="w-full h-12 text-base font-semibold border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
            >
              <CheckCircle2Icon className="mr-2 h-5 w-5" />
              Mark All Present
            </Button>

            <p className="mt-2 text-xs text-muted-foreground text-center">
              Tap a student's status to cycle: Present &rarr; Absent &rarr; Late
            </p>
          </div>

          {/* Student list - scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {loadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading students...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users2Icon className="h-10 w-10 mb-2" />
                <p>No students found in this class</p>
              </div>
            ) : (
              <div className="space-y-1">
                {students.map((student, index) => {
                  const status = (bulkAttendance[student.id] || "PRESENT") as AttendanceStatus
                  const config = STATUS_CONFIG[status]
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${config.bg} ${config.border}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {student.enrollmentNumber}
                          </div>
                        </div>
                      </div>
                      <StatusToggle
                        status={status}
                        onToggle={() => handleToggleStatus(student.id)}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sticky footer with summary + submit */}
          {students.length > 0 && (
            <div className="sticky bottom-0 z-10 border-t bg-background px-6 py-4 space-y-3">
              {/* Summary badges */}
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                  <CheckCircle2Icon className="h-3.5 w-3.5" />
                  {bulkSummary.present} Present
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
                  <XCircleIcon className="h-3.5 w-3.5" />
                  {bulkSummary.absent} Absent
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 font-medium text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {bulkSummary.late} Late
                </span>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmitBulkAttendance}
                disabled={submitting || students.length === 0}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Submit Attendance for {bulkSummary.total} Students</>
                )}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  )
}
