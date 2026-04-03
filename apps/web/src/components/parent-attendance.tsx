"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parentsApi, attendanceApi } from "@/lib/api"
import { Loader2Icon, CheckCircle2Icon, XCircleIcon, ClockIcon, CalendarIcon } from "lucide-react"

type Child = {
  id: string
  firstName: string
  lastName: string
  gradeLevel: string
  section?: string
  enrollmentNumber?: string
}

type AttendanceRecord = {
  id: string
  studentId: string
  date: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  notes?: string
  class?: { name: string }
}

const statusConfig = {
  PRESENT: { color: "bg-green-500", label: "Present", icon: CheckCircle2Icon, badge: "default" as const },
  ABSENT: { color: "bg-red-500", label: "Absent", icon: XCircleIcon, badge: "destructive" as const },
  LATE: { color: "bg-yellow-500", label: "Late", icon: ClockIcon, badge: "secondary" as const },
  EXCUSED: { color: "bg-gray-400", label: "Excused", icon: CalendarIcon, badge: "outline" as const },
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function ParentAttendance() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<string>("")
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  useEffect(() => {
    parentsApi.getMyChildren().then((res) => {
      if (res.success && res.data) {
        setChildren(res.data)
        if (res.data.length > 0) setSelectedChild(res.data[0].id)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedChild) return
    setLoading(true)
    attendanceApi.getAll({}).then((res) => {
      if (res.success && res.data) {
        const records = (Array.isArray(res.data) ? res.data : res.data.attendance || [])
          .filter((r: any) => r.studentId === selectedChild)
        setAttendance(records)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [selectedChild])

  const child = children.find((c) => c.id === selectedChild)

  // Filter by selected month
  const monthRecords = attendance.filter((r) => r.date.startsWith(selectedMonth))
  const allMonths = [...new Set(attendance.map((r) => r.date.substring(0, 7)))].sort().reverse()

  const monthStats = {
    total: monthRecords.length,
    present: monthRecords.filter((r) => r.status === "PRESENT").length,
    absent: monthRecords.filter((r) => r.status === "ABSENT").length,
    late: monthRecords.filter((r) => r.status === "LATE").length,
    excused: monthRecords.filter((r) => r.status === "EXCUSED").length,
    percentage: monthRecords.length > 0
      ? Math.round((monthRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length / monthRecords.length) * 100)
      : 0,
  }

  // Overall stats
  const overallStats = {
    total: attendance.length,
    present: attendance.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
    percentage: attendance.length > 0
      ? Math.round((attendance.filter((r) => r.status === "PRESENT" || r.status === "LATE").length / attendance.length) * 100)
      : 0,
  }

  // Calendar grid for selected month
  const calendarDays = (() => {
    const [year, month] = selectedMonth.split("-").map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const days: { date: number; status?: string; isWeekend: boolean }[] = []

    // Pad start
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ date: 0, isWeekend: false })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${selectedMonth}-${String(d).padStart(2, "0")}`
      const record = monthRecords.find((r) => r.date.startsWith(dateStr))
      const dow = new Date(year, month - 1, d).getDay()
      days.push({ date: d, status: record?.status, isWeekend: dow === 0 || dow === 6 })
    }

    return days
  })()

  // Monthly trend (last 6 months)
  const monthlyTrend = allMonths.slice(0, 6).reverse().map((m) => {
    const records = attendance.filter((r) => r.date.startsWith(m))
    const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length
    return {
      month: m,
      label: months[parseInt(m.split("-")[1]) - 1],
      percentage: records.length > 0 ? Math.round((present / records.length) * 100) : 0,
      total: records.length,
    }
  })

  if (loading && children.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const formatMonth = (m: string) => {
    const [y, mo] = m.split("-")
    return `${months[parseInt(mo) - 1]} ${y}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">View attendance records</p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <Tabs value={selectedChild} onValueChange={setSelectedChild}>
          <TabsList>
            {children.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.firstName} ({c.gradeLevel}{c.section ? `-${c.section}` : ""})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Overall Attendance</p>
            <p className="text-2xl font-bold">{overallStats.percentage}%</p>
            <p className="text-xs text-muted-foreground">{overallStats.present}/{overallStats.total} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">{formatMonth(selectedMonth)}</p>
            <p className="text-2xl font-bold">{monthStats.percentage}%</p>
            <Progress value={monthStats.percentage} className="mt-1 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Present This Month</p>
            <p className="text-2xl font-bold text-green-600">{monthStats.present}</p>
            <p className="text-xs text-muted-foreground">of {monthStats.total} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Absent This Month</p>
            <p className="text-2xl font-bold text-red-600">{monthStats.absent}</p>
            {monthStats.late > 0 && <p className="text-xs text-yellow-600">{monthStats.late} late</p>}
          </CardContent>
        </Card>
      </div>

      {/* Monthly trend */}
      {monthlyTrend.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-end h-24">
              {monthlyTrend.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium">{m.percentage}%</span>
                  <div className="w-full rounded-t" style={{
                    height: `${Math.max(m.percentage * 0.8, 4)}px`,
                    backgroundColor: m.percentage >= 90 ? '#22c55e' : m.percentage >= 75 ? '#eab308' : '#ef4444',
                  }} />
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar view */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Calendar - {formatMonth(selectedMonth)}</CardTitle>
            <select
              className="text-xs border rounded px-2 py-1"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {allMonths.map((m) => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d} className="text-[10px] text-muted-foreground font-medium">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`aspect-square rounded flex items-center justify-center text-xs ${
                  day.date === 0 ? "" :
                  day.isWeekend ? "bg-muted/50 text-muted-foreground" :
                  day.status === "PRESENT" ? "bg-green-100 text-green-700 font-medium" :
                  day.status === "ABSENT" ? "bg-red-100 text-red-700 font-medium" :
                  day.status === "LATE" ? "bg-yellow-100 text-yellow-700 font-medium" :
                  day.status === "EXCUSED" ? "bg-gray-100 text-gray-600" :
                  "text-muted-foreground"
                }`}
                title={day.status || (day.isWeekend ? "Weekend" : "")}
              >
                {day.date || ""}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-100 border border-green-200" /> Present</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-200" /> Absent</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-100 border border-yellow-200" /> Late</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-muted/50 border" /> Weekend</span>
          </div>
        </CardContent>
      </Card>

      {/* Daily records for selected month */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Daily Records - {formatMonth(selectedMonth)}</CardTitle>
        </CardHeader>
        <CardContent>
          {monthRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No attendance records for this month</p>
          ) : (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {[...monthRecords].sort((a, b) => b.date.localeCompare(a.date)).map((r) => {
                const cfg = statusConfig[r.status]
                const Icon = cfg.icon
                const date = new Date(r.date)
                return (
                  <div key={r.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${
                        r.status === "PRESENT" ? "text-green-500" :
                        r.status === "ABSENT" ? "text-red-500" :
                        r.status === "LATE" ? "text-yellow-500" : "text-gray-400"
                      }`} />
                      <span className="text-sm">
                        {date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <Badge variant={cfg.badge} className="text-[10px]">{cfg.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
