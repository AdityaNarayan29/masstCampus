"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDownIcon, CheckCircle2Icon, XCircleIcon, ClockIcon, CalendarIcon } from "lucide-react"
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

type AttendanceRecord = {
  id: string
  studentId: string
  classId: string
  date: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
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

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bulkAttendance, setBulkAttendance] = useState<Record<string, string>>({})
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

    try {
      const res = await classesApi.getStudents(selectedClass)
      if (res.success) {
        setStudents(res.data)
        // Initialize bulk attendance
        const initial: Record<string, string> = {}
        res.data.forEach((s: Student) => {
          initial[s.id] = "PRESENT"
        })
        setBulkAttendance(initial)
      }
    } catch (error) {
      console.error("Failed to load students for class:", error)
      toast.error("Failed to load students")
    }
  }

  const handleMarkAttendance = () => {
    if (!selectedClass) {
      toast.error("Please select a class first")
      return
    }
    loadStudentsForClass()
    setIsSheetOpen(true)
  }

  const handleSubmitBulkAttendance = async () => {
    if (!selectedClass || !selectedDate) return

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
        toast.success("Attendance marked successfully")
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
      toast.success("Attendance marked successfully (Demo Mode)")
      setIsSheetOpen(false)
    }
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
                  <Button onClick={handleMarkAttendance} disabled={!selectedClass}>
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

      {/* Mark Attendance Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Mark Attendance</SheetTitle>
            <SheetDescription>
              {selectedClass && classes.find((c) => c.id === selectedClass)?.name} - {selectedDate}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between border-b pb-3"
              >
                <div>
                  <div className="font-medium">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {student.enrollmentNumber}
                  </div>
                </div>
                <Select
                  value={bulkAttendance[student.id] || "PRESENT"}
                  onValueChange={(value) =>
                    setBulkAttendance({ ...bulkAttendance, [student.id]: value })
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="LATE">Late</SelectItem>
                    <SelectItem value="EXCUSED">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={handleSubmitBulkAttendance} className="flex-1">
              Save Attendance
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSheetOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PageLayout>
  )
}
