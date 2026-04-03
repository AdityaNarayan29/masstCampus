"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2Icon, UsersIcon, IndianRupeeIcon, CalendarCheckIcon, AlertTriangleIcon, GraduationCapIcon, BookOpenIcon, PhoneIcon, MailIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth, subDays } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parentsApi, feesApi, attendanceApi } from "@/lib/api"

type Child = {
  id: string
  firstName: string
  lastName: string
  enrollmentNumber: string
  gradeLevel?: string
  section?: string
  email?: string
  phone?: string
}

type Fee = {
  id: string
  studentId: string
  type: string
  amount: number
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE" | "WAIVED"
  academicYear: string
  description?: string
  student?: { id: string; firstName: string; lastName: string }
}

type AttendanceRecord = {
  id: string
  studentId: string
  date: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

export function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [attendanceByChild, setAttendanceByChild] = useState<Record<string, AttendanceRecord[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState<string>("all")
  const [feeFilter, setFeeFilter] = useState("ALL")

  const now = new Date()

  useEffect(() => {
    const load = async () => {
      try {
        const childrenRes = await parentsApi.getMyChildren()
        const childrenData: Child[] = childrenRes.success && childrenRes.data ? childrenRes.data : []
        setChildren(childrenData)

        if (childrenData.length === 0) { setLoading(false); return }

        const childIds = new Set(childrenData.map((c) => c.id))

        const feesRes = await feesApi.getAll()
        if (feesRes.success && feesRes.data) {
          const allFees: Fee[] = Array.isArray(feesRes.data) ? feesRes.data : feesRes.data.fees || []
          setFees(allFees.filter((f) => childIds.has(f.studentId)))
        }

        const attMap: Record<string, AttendanceRecord[]> = {}
        await Promise.all(
          childrenData.map(async (child) => {
            try {
              const res = await attendanceApi.getAll({ studentId: child.id })
              if (res.success && res.data) {
                attMap[child.id] = Array.isArray(res.data) ? res.data : res.data.attendance || []
              } else { attMap[child.id] = [] }
            } catch { attMap[child.id] = [] }
          })
        )
        setAttendanceByChild(attMap)
      } catch (error) {
        console.error("Failed to load parent dashboard:", error)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  // Derived data
  const childStats = useMemo(() => {
    const result: Record<string, { attendancePct: number; presentDays: number; totalDays: number; pendingAmount: number; overdueCount: number; paidAmount: number; totalFees: number }> = {}
    for (const child of children) {
      const records = attendanceByChild[child.id] || []
      const thisMonth = records.filter((r) => r.date.startsWith(format(now, "yyyy-MM")))
      const present = thisMonth.filter((r) => r.status === "PRESENT" || r.status === "LATE").length
      const childFees = fees.filter((f) => f.studentId === child.id)

      result[child.id] = {
        attendancePct: thisMonth.length > 0 ? Math.round((present / thisMonth.length) * 100) : 0,
        presentDays: present,
        totalDays: thisMonth.length,
        pendingAmount: childFees.filter((f) => f.status === "PENDING" || f.status === "OVERDUE").reduce((s, f) => s + f.amount, 0),
        overdueCount: childFees.filter((f) => f.status === "OVERDUE").length,
        paidAmount: childFees.filter((f) => f.status === "PAID").reduce((s, f) => s + f.amount, 0),
        totalFees: childFees.length,
      }
    }
    return result
  }, [children, fees, attendanceByChild])

  const quickStats = useMemo(() => {
    const totalPending = fees.filter((f) => f.status === "PENDING" || f.status === "OVERDUE").reduce((s, f) => s + f.amount, 0)
    const overdueCount = fees.filter((f) => f.status === "OVERDUE").length
    const pcts = Object.values(childStats).map((c) => c.attendancePct)
    const avgAtt = pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0
    return { totalChildren: children.length, pendingFees: totalPending, avgAttendance: avgAtt, overdueCount }
  }, [children, fees, childStats])

  // Last 7 days attendance per child
  const last7Days = useMemo(() => {
    const result: Record<string, { date: string; status: string | null }[]> = {}
    for (const child of children) {
      const records = attendanceByChild[child.id] || []
      const days: { date: string; status: string | null }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = format(subDays(now, i), "yyyy-MM-dd")
        const rec = records.find((r) => r.date.startsWith(d))
        days.push({ date: d, status: rec ? rec.status : null })
      }
      result[child.id] = days
    }
    return result
  }, [children, attendanceByChild])

  // Filtered fees
  const filteredFees = useMemo(() => {
    return fees
      .filter((f) => selectedChild === "all" || f.studentId === selectedChild)
      .filter((f) => feeFilter === "ALL" || f.status === feeFilter)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
  }, [fees, selectedChild, feeFilter])

  const feesByYear = useMemo(() => {
    const groups: Record<string, Fee[]> = {}
    for (const f of filteredFees) {
      const y = f.academicYear || "Unknown"
      if (!groups[y]) groups[y] = []
      groups[y].push(f)
    }
    return groups
  }, [filteredFees])

  const childName = (id: string) => {
    const c = children.find((ch) => ch.id === id)
    return c ? `${c.firstName} ${c.lastName}` : "Unknown"
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
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Children</p>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{quickStats.totalChildren}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Pending Fees</p>
              <IndianRupeeIcon className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold mt-1">{fmt(quickStats.pendingFees)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Attendance</p>
              <CalendarCheckIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-1">{quickStats.avgAttendance}%</p>
            <p className="text-[10px] text-muted-foreground">this month avg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Overdue</p>
              <AlertTriangleIcon className={`h-4 w-4 ${quickStats.overdueCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </div>
            <p className={`text-2xl font-bold mt-1 ${quickStats.overdueCount > 0 ? "text-red-500" : ""}`}>{quickStats.overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Child Profiles */}
      <div>
        <h2 className="text-lg font-semibold mb-3">My Children</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => {
            const stats = childStats[child.id] || { attendancePct: 0, presentDays: 0, totalDays: 0, pendingAmount: 0, overdueCount: 0, paidAmount: 0, totalFees: 0 }
            const hasOverdue = stats.overdueCount > 0
            const hasPending = stats.pendingAmount > 0

            return (
              <Card key={child.id} className={`relative overflow-hidden border-l-4 ${hasOverdue ? "border-l-red-500" : hasPending ? "border-l-yellow-500" : "border-l-green-500"}`}>
                <CardContent className="p-4">
                  {/* Profile header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {child.firstName[0]}{child.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-base">{child.firstName} {child.lastName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <GraduationCapIcon className="h-3 w-3" />
                        <span>Grade {child.gradeLevel || "-"}{child.section ? ` - ${child.section}` : ""}</span>
                      </div>
                      {child.enrollmentNumber && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <BookOpenIcon className="h-3 w-3" />
                          <span>{child.enrollmentNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Attendance</p>
                      <p className="text-lg font-bold">{stats.attendancePct}%</p>
                      <p className="text-[10px] text-muted-foreground">{stats.presentDays}/{stats.totalDays} this month</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending Fees</p>
                      <p className={`text-lg font-bold ${hasOverdue ? "text-red-500" : hasPending ? "text-yellow-600" : "text-green-600"}`}>
                        {stats.pendingAmount > 0 ? fmt(stats.pendingAmount) : "Clear"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{stats.totalFees} total fees</p>
                    </div>
                  </div>

                  {/* Last 7 days */}
                  <div className="mt-3 flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground mr-1">Last 7 days:</span>
                    {(last7Days[child.id] || []).map((d, i) => {
                      const dow = new Date(d.date).getDay()
                      const isWeekend = dow === 0 || dow === 6
                      return (
                        <span
                          key={i}
                          className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-medium ${
                            isWeekend ? "bg-muted text-muted-foreground" :
                            d.status === "PRESENT" ? "bg-green-500 text-white" :
                            d.status === "ABSENT" ? "bg-red-500 text-white" :
                            d.status === "LATE" ? "bg-yellow-500 text-white" :
                            "bg-gray-200"
                          }`}
                          title={`${format(new Date(d.date), "EEE dd")}: ${d.status || (isWeekend ? "Weekend" : "No data")}`}
                        >
                          {format(new Date(d.date), "d")}
                        </span>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Fee History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Fee History</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {children.length > 1 && (
            <Tabs value={selectedChild} onValueChange={setSelectedChild}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
                {children.map((c) => (
                  <TabsTrigger key={c.id} value={c.id} className="text-xs h-7">{c.firstName}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          <Tabs value={feeFilter} onValueChange={setFeeFilter}>
            <TabsList className="h-8">
              <TabsTrigger value="ALL" className="text-xs h-7">All</TabsTrigger>
              <TabsTrigger value="PENDING" className="text-xs h-7">Pending</TabsTrigger>
              <TabsTrigger value="OVERDUE" className="text-xs h-7">Overdue</TabsTrigger>
              <TabsTrigger value="PAID" className="text-xs h-7">Paid</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Fee cards grouped by year */}
        {Object.keys(feesByYear).length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No fees found</CardContent></Card>
        ) : (
          Object.entries(feesByYear).sort(([a], [b]) => b.localeCompare(a)).map(([year, yearFees]) => (
            <Card key={year} className="mb-4">
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{year}</CardTitle>
                  <span className="text-xs text-muted-foreground">{yearFees.length} fees &middot; {fmt(yearFees.reduce((s, f) => s + f.amount, 0))}</span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="space-y-1.5">
                  {yearFees.map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{fee.type}</span>
                          {selectedChild === "all" && children.length > 1 && (
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{childName(fee.studentId)}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {fee.description ? ` · ${fee.description}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-sm font-semibold">{fmt(fee.amount)}</span>
                        <Badge
                          variant={fee.status === "PAID" ? "default" : fee.status === "OVERDUE" ? "destructive" : fee.status === "WAIVED" ? "outline" : "secondary"}
                          className="text-[10px] min-w-[55px] justify-center"
                        >
                          {fee.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
