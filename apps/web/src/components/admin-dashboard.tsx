"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Loader2Icon,
  UsersIcon,
  GraduationCapIcon,
  IndianRupeeIcon,
  CalendarCheckIcon,
} from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  studentsApi,
  teachersApi,
  classesApi,
  feesApi,
  attendanceApi,
} from "@/lib/api"

type Student = {
  id: string
  firstName: string
  lastName: string
}

type Teacher = {
  id: string
  firstName: string
  lastName: string
}

type ClassItem = {
  id: string
  name: string
  gradeLevel?: string
  section?: string
  teacher?: { id: string; firstName: string; lastName: string }
  _count?: { students: number }
  studentCount?: number
}

type Fee = {
  id: string
  studentId: string
  type: string
  amount: number
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE" | "WAIVED"
  student?: { firstName: string; lastName: string }
}

type AttendanceRecord = {
  id: string
  studentId: string
  classId: string
  date: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  student?: { firstName: string; lastName: string }
  class?: { name: string }
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n)

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, teachersRes, classesRes, feesRes, attRes] =
          await Promise.all([
            studentsApi.getAll().catch(() => ({ success: false, data: null })),
            teachersApi.getAll().catch(() => ({ success: false, data: null })),
            classesApi.getAll().catch(() => ({ success: false, data: null })),
            feesApi.getAll().catch(() => ({ success: false, data: null })),
            attendanceApi
              .getAll({ date: today })
              .catch(() => ({ success: false, data: null })),
          ])

        if (studentsRes.success && studentsRes.data) {
          const s = Array.isArray(studentsRes.data)
            ? studentsRes.data
            : studentsRes.data.students || []
          setStudents(s)
        }
        if (teachersRes.success && teachersRes.data) {
          const t = Array.isArray(teachersRes.data)
            ? teachersRes.data
            : teachersRes.data.teachers || []
          setTeachers(t)
        }
        if (classesRes.success && classesRes.data) {
          const c = Array.isArray(classesRes.data)
            ? classesRes.data
            : classesRes.data.classes || []
          setClasses(c)
        }
        if (feesRes.success && feesRes.data) {
          const f = Array.isArray(feesRes.data)
            ? feesRes.data
            : feesRes.data.fees || []
          setFees(f)
        }
        if (attRes.success && attRes.data) {
          const a = Array.isArray(attRes.data)
            ? attRes.data
            : attRes.data.attendance || []
          setAttendance(a)
        }
      } catch (error) {
        console.error("Failed to load admin dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const feeStats = useMemo(() => {
    const total = fees.reduce((s, f) => s + f.amount, 0)
    const collected = fees
      .filter((f) => f.status === "PAID")
      .reduce((s, f) => s + f.amount, 0)
    const pending = fees
      .filter((f) => f.status === "PENDING")
      .reduce((s, f) => s + f.amount, 0)
    const overdue = fees
      .filter((f) => f.status === "OVERDUE")
      .reduce((s, f) => s + f.amount, 0)
    const collectionRate = total > 0 ? Math.round((collected / total) * 100) : 0
    return { total, collected, pending, overdue, collectionRate }
  }, [fees])

  const todayAttPct = useMemo(() => {
    if (attendance.length === 0) return 0
    const present = attendance.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE",
    ).length
    return Math.round((present / attendance.length) * 100)
  }, [attendance])

  const recentAttendance = useMemo(() => {
    return [...attendance]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, 5)
  }, [attendance])

  const recentFees = useMemo(() => {
    return [...fees]
      .filter((f) => f.status === "PAID")
      .sort(
        (a, b) =>
          new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
      )
      .slice(0, 5)
  }, [fees])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Students</p>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Teachers</p>
              <GraduationCapIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{teachers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Fee Collection</p>
              <IndianRupeeIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {feeStats.collectionRate}%
            </p>
            <p className="text-[10px] text-muted-foreground">collection rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Today&apos;s Attendance
              </p>
              <CalendarCheckIcon className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-1">{todayAttPct}%</p>
            <p className="text-[10px] text-muted-foreground">
              {attendance.length} records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fee Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Fees</p>
              <p className="text-lg font-bold">{fmt(feeStats.total)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-lg font-bold text-green-600">
                {fmt(feeStats.collected)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-yellow-600">
                {fmt(feeStats.pending)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-lg font-bold text-red-600">
                {fmt(feeStats.overdue)}
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Collection Progress</span>
              <span>{feeStats.collectionRate}%</span>
            </div>
            <Progress value={feeStats.collectionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No attendance records today.
              </p>
            ) : (
              <div className="space-y-2">
                {recentAttendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {record.student
                          ? `${record.student.firstName} ${record.student.lastName}`
                          : record.studentId.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.class?.name || ""}
                      </p>
                    </div>
                    <Badge
                      variant={
                        record.status === "PRESENT"
                          ? "default"
                          : record.status === "ABSENT"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Fee Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentFees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent fee payments.
              </p>
            ) : (
              <div className="space-y-2">
                {recentFees.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {fee.student
                          ? `${fee.student.firstName} ${fee.student.lastName}`
                          : fee.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fee.type}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {fmt(fee.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Class Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Class Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No classes found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Class
                    </th>
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Grade
                    </th>
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Teacher
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Students
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{cls.name}</td>
                      <td className="py-2 text-muted-foreground">
                        {cls.gradeLevel || "-"}
                        {cls.section ? `-${cls.section}` : ""}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {cls.teacher
                          ? `${cls.teacher.firstName} ${cls.teacher.lastName}`
                          : "-"}
                      </td>
                      <td className="py-2 text-right">
                        {cls._count?.students || cls.studentCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
