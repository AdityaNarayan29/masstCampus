"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parentsApi, feesApi } from "@/lib/api"
import { Loader2Icon, IndianRupeeIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon } from "lucide-react"

type Child = {
  id: string
  firstName: string
  lastName: string
  gradeLevel: string
  section?: string
}

type Fee = {
  id: string
  studentId: string
  type: string
  amount: number
  dueDate: string
  status: "PENDING" | "PAID" | "OVERDUE" | "WAIVED"
  description?: string
  academicYear: string
  student?: { firstName: string; lastName: string }
}

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const statusBadge: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; label: string }> = {
  PAID: { variant: "default", label: "Paid" },
  PENDING: { variant: "secondary", label: "Pending" },
  OVERDUE: { variant: "destructive", label: "Overdue" },
  WAIVED: { variant: "outline", label: "Waived" },
}

export function ParentFees() {
  const [children, setChildren] = useState<Child[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [selectedChild, setSelectedChild] = useState<string>("all")

  useEffect(() => {
    const load = async () => {
      try {
        const [childrenRes, feesRes] = await Promise.all([
          parentsApi.getMyChildren(),
          feesApi.getAll(),
        ])

        if (childrenRes.success && childrenRes.data) {
          setChildren(childrenRes.data)
          const childIds = new Set(childrenRes.data.map((c: Child) => c.id))

          if (feesRes.success && feesRes.data) {
            const allFees = Array.isArray(feesRes.data) ? feesRes.data : feesRes.data.fees || []
            setFees(allFees.filter((f: Fee) => childIds.has(f.studentId)))
          }
        }
      } catch (error) {
        console.error("Failed to load fees:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter logic
  const filteredFees = fees
    .filter((f) => selectedChild === "all" || f.studentId === selectedChild)
    .filter((f) => filter === "all" || f.status === filter.toUpperCase())
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())

  // Stats
  const childFees = fees.filter((f) => selectedChild === "all" || f.studentId === selectedChild)
  const totalAmount = childFees.reduce((s, f) => s + f.amount, 0)
  const paidAmount = childFees.filter((f) => f.status === "PAID").reduce((s, f) => s + f.amount, 0)
  const pendingAmount = childFees.filter((f) => f.status === "PENDING").reduce((s, f) => s + f.amount, 0)
  const overdueAmount = childFees.filter((f) => f.status === "OVERDUE").reduce((s, f) => s + f.amount, 0)
  const collectionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0

  // Group by academic year
  const groupedByYear = filteredFees.reduce<Record<string, Fee[]>>((acc, f) => {
    const year = f.academicYear || "Unknown"
    if (!acc[year]) acc[year] = []
    acc[year].push(f)
    return acc
  }, {})
  const sortedYears = Object.keys(groupedByYear).sort().reverse()

  // Child name helper
  const childName = (studentId: string) => {
    const c = children.find((ch) => ch.id === studentId)
    return c ? `${c.firstName} ${c.lastName}` : "Unknown"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Fees</h1>
        <p className="text-muted-foreground">Fee details and payment history</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <IndianRupeeIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Total Fees</p>
            </div>
            <p className="text-xl font-bold">{fmt(totalAmount)}</p>
            <Progress value={collectionRate} className="mt-2 h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-1">{collectionRate}% paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
              <p className="text-xs text-muted-foreground">Paid</p>
            </div>
            <p className="text-xl font-bold text-green-600">{fmt(paidAmount)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{childFees.filter((f) => f.status === "PAID").length} fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ClockIcon className="h-3.5 w-3.5 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <p className="text-xl font-bold text-yellow-600">{fmt(pendingAmount)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{childFees.filter((f) => f.status === "PENDING").length} fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangleIcon className="h-3.5 w-3.5 text-red-500" />
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
            <p className="text-xl font-bold text-red-600">{fmt(overdueAmount)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{childFees.filter((f) => f.status === "OVERDUE").length} fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Child selector + status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {children.length > 1 && (
          <Tabs value={selectedChild} onValueChange={setSelectedChild} className="flex-1">
            <TabsList>
              <TabsTrigger value="all">All Children</TabsTrigger>
              {children.map((c) => (
                <TabsTrigger key={c.id} value={c.id}>
                  {c.firstName} ({c.gradeLevel})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Status filter tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({childFees.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({childFees.filter((f) => f.status === "PENDING").length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({childFees.filter((f) => f.status === "OVERDUE").length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({childFees.filter((f) => f.status === "PAID").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Fee records grouped by year */}
      {sortedYears.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No fee records found
          </CardContent>
        </Card>
      ) : (
        sortedYears.map((year) => (
          <Card key={year}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Academic Year {year}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {groupedByYear[year].length} fees &middot; {fmt(groupedByYear[year].reduce((s, f) => s + f.amount, 0))}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupedByYear[year].map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{fee.type}</span>
                        {children.length > 1 && selectedChild === "all" && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {childName(fee.studentId)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(fee.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {fee.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">&middot; {fee.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">{fmt(fee.amount)}</span>
                      <Badge variant={statusBadge[fee.status]?.variant || "outline"} className="text-[10px] min-w-[60px] justify-center">
                        {statusBadge[fee.status]?.label || fee.status}
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
  )
}
