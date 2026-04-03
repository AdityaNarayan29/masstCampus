"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Loader2Icon,
  BookOpenIcon,
  UsersIcon,
  CalendarCheckIcon,
  TrendingUpIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react"
import { format, subDays } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { classesApi, attendanceApi } from "@/lib/api"

type ClassItem = {
  id: string
  name: string
  gradeLevel?: string
  section?: string
  teacher?: { id: string; firstName: string; lastName: string }
  teacherId?: string
  _count?: { students: number }
  studentCount?: number
}

type AttendanceRecord = {
  id: string
  studentId: string
  classId: string
  date: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
}

export function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [attendanceByClass, setAttendanceByClass] = useState<
    Record<string, AttendanceRecord[]>
  >({})
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")

  const today = format(new Date(), "yyyy-MM-dd")
  const todayDisplay = format(new Date(), "EEEE, MMMM d, yyyy")

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setUserName(user.profile?.firstName || user.firstName || "Teacher")
      } catch {
        setUserName("Teacher")
      }
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem("user")
        let userId = ""
        let userFirstName = ""
        let userLastName = ""
        if (stored) {
          const user = JSON.parse(stored)
          userId = user.id || ""
          userFirstName = (
            user.profile?.firstName ||
            user.firstName ||
            ""
          ).toLowerCase()
          userLastName = (
            user.profile?.lastName ||
            user.lastName ||
            ""
          ).toLowerCase()
        }

        const classesRes = await classesApi.getAll()
        let allClasses: ClassItem[] = []
        if (classesRes.success && classesRes.data) {
          allClasses = Array.isArray(classesRes.data)
            ? classesRes.data
            : classesRes.data.classes || []
        }

        // Filter classes by teacher match
        const myClasses = allClasses.filter((c) => {
          if (c.teacherId === userId) return true
          if (c.teacher) {
            const tFirst = (c.teacher.firstName || "").toLowerCase()
            const tLast = (c.teacher.lastName || "").toLowerCase()
            if (
              userFirstName &&
              tFirst === userFirstName &&
              tLast === userLastName
            )
              return true
            if (c.teacher.id === userId) return true
          }
          return false
        })

        setClasses(myClasses)

        // Fetch attendance for each class (last 7 days)
        const startDate = format(subDays(new Date(), 6), "yyyy-MM-dd")
        const attMap: Record<string, AttendanceRecord[]> = {}
        await Promise.all(
          myClasses.map(async (cls) => {
            try {
              const res = await attendanceApi.getAll({
                classId: cls.id,
                startDate,
                endDate: today,
              })
              if (res.success && res.data) {
                attMap[cls.id] = Array.isArray(res.data)
                  ? res.data
                  : res.data.attendance || []
              } else {
                attMap[cls.id] = []
              }
            } catch {
              attMap[cls.id] = []
            }
          }),
        )
        setAttendanceByClass(attMap)
      } catch (error) {
        console.error("Failed to load teacher dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const todayAttendanceByClass = useMemo(() => {
    const result: Record<string, { marked: boolean; count: number }> = {}
    for (const cls of classes) {
      const records = (attendanceByClass[cls.id] || []).filter((r) =>
        r.date.startsWith(today),
      )
      result[cls.id] = { marked: records.length > 0, count: records.length }
    }
    return result
  }, [classes, attendanceByClass, today])

  const quickStats = useMemo(() => {
    const totalStudents = classes.reduce(
      (sum, c) => sum + (c._count?.students || c.studentCount || 0),
      0,
    )
    const markedCount = Object.values(todayAttendanceByClass).filter(
      (v) => v.marked,
    ).length
    const markedPct =
      classes.length > 0
        ? Math.round((markedCount / classes.length) * 100)
        : 0

    // Weekly average attendance
    let weekTotal = 0
    let weekPresent = 0
    for (const records of Object.values(attendanceByClass)) {
      weekTotal += records.length
      weekPresent += records.filter(
        (r) => r.status === "PRESENT" || r.status === "LATE",
      ).length
    }
    const weekAvg =
      weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 0

    return {
      classCount: classes.length,
      totalStudents,
      todayMarkedPct: markedPct,
      weekAvg,
    }
  }, [classes, todayAttendanceByClass, attendanceByClass])

  // Last 5 days attendance summary
  const recentDays = useMemo(() => {
    const days: { date: string; present: number; total: number; pct: number }[] =
      []
    for (let i = 4; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd")
      let present = 0
      let total = 0
      for (const records of Object.values(attendanceByClass)) {
        const dayRecs = records.filter((r) => r.date.startsWith(d))
        total += dayRecs.length
        present += dayRecs.filter(
          (r) => r.status === "PRESENT" || r.status === "LATE",
        ).length
      }
      days.push({
        date: d,
        present,
        total,
        pct: total > 0 ? Math.round((present / total) * 100) : 0,
      })
    }
    return days
  }, [attendanceByClass])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-sm text-muted-foreground">{todayDisplay}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">My Classes</p>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {quickStats.classCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Students</p>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {quickStats.totalStudents}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Today&apos;s Attendance
              </p>
              <CalendarCheckIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {quickStats.todayMarkedPct}%
            </p>
            <p className="text-[10px] text-muted-foreground">classes marked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">This Week</p>
              <TrendingUpIcon className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-1">{quickStats.weekAvg}%</p>
            <p className="text-[10px] text-muted-foreground">avg attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Classes */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Today&apos;s Classes</h2>
        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No classes assigned to you yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const att = todayAttendanceByClass[cls.id] || {
                marked: false,
                count: 0,
              }
              const studentCount =
                cls._count?.students || cls.studentCount || 0
              return (
                <Card key={cls.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Grade {cls.gradeLevel || "-"}
                          {cls.section ? ` - ${cls.section}` : ""}
                        </p>
                      </div>
                      {att.marked ? (
                        <Badge
                          variant="default"
                          className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100"
                        >
                          <CheckCircle2Icon className="h-3 w-3 mr-1" />
                          Marked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Not Marked
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-3.5 w-3.5" />
                        {studentCount} students
                      </span>
                      {att.marked && (
                        <span className="text-xs">
                          {att.count} records today
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Recent Attendance (Last 5 Days)
        </h2>
        <Card>
          <CardContent className="p-4">
            {recentDays.every((d) => d.total === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No attendance data available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentDays.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-24">
                        {format(new Date(day.date), "EEE, MMM d")}
                      </span>
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${day.pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {day.total > 0
                        ? `${day.present}/${day.total} (${day.pct}%)`
                        : "No data"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
