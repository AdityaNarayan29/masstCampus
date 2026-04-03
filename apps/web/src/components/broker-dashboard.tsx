"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Loader2Icon,
  UsersIcon,
  IndianRupeeIcon,
  ClockIcon,
  NetworkIcon,
} from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { brokersApi } from "@/lib/api"

type BrokerStats = {
  totalStudents?: number
  studentsEnrolled?: number
  totalCommissions?: number
  totalEarned?: number
  pendingPayouts?: number
  pendingAmount?: number
  paidAmount?: number
  subBrokers?: number
  subBrokerCount?: number
}

type EnrolledStudent = {
  id: string
  firstName: string
  lastName: string
  enrollmentNumber?: string
  gradeLevel?: string
  section?: string
  enrolledAt?: string
  createdAt?: string
}

type Commission = {
  id: string
  amount: number
  status: "PENDING" | "PAID" | "CANCELLED"
  studentName?: string
  student?: { firstName: string; lastName: string }
  createdAt?: string
  date?: string
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n)

export function BrokerDashboard() {
  const [stats, setStats] = useState<BrokerStats>({})
  const [brokerData, setBrokerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem("user")
        let userId = ""
        if (stored) {
          const user = JSON.parse(stored)
          userId = user.id || ""
        }

        if (!userId) {
          setLoading(false)
          return
        }

        // Fetch broker details and stats in parallel
        const [brokerRes, statsRes] = await Promise.all([
          brokersApi.getById(userId).catch(() => ({ success: false, data: null })),
          brokersApi.getStats(userId).catch(() => ({ success: false, data: null })),
        ])

        if (brokerRes.success && brokerRes.data) {
          setBrokerData(brokerRes.data)
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data)
        }
      } catch (error) {
        console.error("Failed to load broker dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const enrolledStudents: EnrolledStudent[] = useMemo(() => {
    if (!brokerData) return []
    return brokerData.students || brokerData.enrolledStudents || []
  }, [brokerData])

  const commissions: Commission[] = useMemo(() => {
    if (!brokerData) return []
    return brokerData.commissions || []
  }, [brokerData])

  const quickStats = useMemo(() => {
    return {
      studentsEnrolled:
        stats.totalStudents || stats.studentsEnrolled || enrolledStudents.length,
      totalCommissions: stats.totalCommissions || stats.totalEarned || 0,
      pendingPayouts: stats.pendingPayouts || stats.pendingAmount || 0,
      subBrokers: stats.subBrokers || stats.subBrokerCount || 0,
    }
  }, [stats, enrolledStudents])

  const commissionSummary = useMemo(() => {
    const totalEarned = stats.totalCommissions || stats.totalEarned || 0
    const pending = stats.pendingPayouts || stats.pendingAmount || 0
    const paid = stats.paidAmount || totalEarned - pending
    return { totalEarned, pending, paid }
  }, [stats])

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
              <p className="text-xs text-muted-foreground">Students Enrolled</p>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {quickStats.studentsEnrolled}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Total Commissions
              </p>
              <IndianRupeeIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {fmt(quickStats.totalCommissions)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Pending Payouts</p>
              <ClockIcon className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {fmt(quickStats.pendingPayouts)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Sub-Brokers</p>
              <NetworkIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">
              {quickStats.subBrokers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Commission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Earned</p>
              <p className="text-lg font-bold text-green-600">
                {fmt(commissionSummary.totalEarned)}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-yellow-600">
                {fmt(commissionSummary.pending)}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-bold">
                {fmt(commissionSummary.paid)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Students */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          {enrolledStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No students enrolled yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Enrollment No.
                    </th>
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Grade
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Enrolled
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((student) => (
                    <tr key={student.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {student.enrollmentNumber || "-"}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {student.gradeLevel || "-"}
                        {student.section ? `-${student.section}` : ""}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {student.enrolledAt || student.createdAt
                          ? format(
                              new Date(
                                student.enrolledAt || student.createdAt || "",
                              ),
                              "dd MMM yyyy",
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No commission records yet.
            </p>
          ) : (
            <div className="space-y-2">
              {commissions.slice(0, 10).map((commission) => (
                <div
                  key={commission.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {commission.studentName ||
                        (commission.student
                          ? `${commission.student.firstName} ${commission.student.lastName}`
                          : "Commission")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {commission.createdAt || commission.date
                        ? format(
                            new Date(
                              commission.createdAt || commission.date || "",
                            ),
                            "dd MMM yyyy",
                          )
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {fmt(commission.amount)}
                    </span>
                    <Badge
                      variant={
                        commission.status === "PAID"
                          ? "default"
                          : commission.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {commission.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
