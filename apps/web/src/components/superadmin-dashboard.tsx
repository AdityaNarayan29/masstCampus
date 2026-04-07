"use client"

import { useState, useEffect } from "react"
import { Loader2Icon, BuildingIcon, UsersIcon, GraduationCapIcon, BookOpenIcon, IndianRupeeIcon, ChevronRightIcon, ArrowLeftIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AdminDashboard } from "@/components/admin-dashboard"
import apiClient from "@/lib/api"

type School = {
  id: string
  name: string
  subdomain: string
  board?: string
  city?: string
  state?: string
  isActive: boolean
  onboardingComplete?: boolean
  createdAt: string
  _counts?: {
    students: number
    teachers: number
    classes: number
    fees: number
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

export function SuperAdminDashboard() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [schoolStats, setSchoolStats] = useState<Record<string, any>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get("/tenants")
        if (res.data?.success || res.data?.data) {
          const tenants = res.data.data || res.data
          const tenantList = Array.isArray(tenants) ? tenants : tenants.tenants || []
          setSchools(tenantList)

          // Load stats for each school
          const stats: Record<string, any> = {}
          for (const school of tenantList) {
            try {
              const [studentsRes, teachersRes, classesRes, feesRes] = await Promise.all([
                apiClient.get("/students", { headers: { "x-tenant-id": school.id } }).catch(() => ({ data: { data: [] } })),
                apiClient.get("/teachers", { headers: { "x-tenant-id": school.id } }).catch(() => ({ data: [] })),
                apiClient.get("/classes", { headers: { "x-tenant-id": school.id } }).catch(() => ({ data: { data: { classes: [] } } })),
                apiClient.get("/fees", { headers: { "x-tenant-id": school.id } }).catch(() => ({ data: { data: [] } })),
              ])

              const students = studentsRes.data?.data || []
              const studentList = Array.isArray(students) ? students : students.students || []
              const teachers = teachersRes.data?.data || teachersRes.data || []
              const teacherList = Array.isArray(teachers) ? teachers : []
              const classes = classesRes.data?.data?.classes || classesRes.data?.data || []
              const classList = Array.isArray(classes) ? classes : []
              const fees = feesRes.data?.data || []
              const feeList = Array.isArray(fees) ? fees : fees.fees || []

              const totalFees = feeList.reduce((s: number, f: any) => s + (f.amount || 0), 0)
              const paidFees = feeList.filter((f: any) => f.status === "PAID").reduce((s: number, f: any) => s + (f.amount || 0), 0)

              stats[school.id] = {
                students: studentList.length,
                teachers: teacherList.length,
                classes: classList.length,
                totalFees,
                paidFees,
                collectionRate: totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0,
              }
            } catch {
              stats[school.id] = { students: 0, teachers: 0, classes: 0, totalFees: 0, paidFees: 0, collectionRate: 0 }
            }
          }
          setSchoolStats(stats)
        }
      } catch (error) {
        console.error("Failed to load schools:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // If a school is selected, show its admin dashboard with school context
  if (selectedSchool) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedSchool(null)}>
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            All Schools
          </Button>
          <div>
            <h1 className="text-xl font-bold">{selectedSchool.name}</h1>
            <p className="text-xs text-muted-foreground">{selectedSchool.board} · {selectedSchool.city}, {selectedSchool.state}</p>
          </div>
          <Badge variant={selectedSchool.isActive ? "default" : "secondary"} className="ml-auto">
            {selectedSchool.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <AdminDashboard />
      </div>
    )
  }

  // Platform overview
  const totalStudents = Object.values(schoolStats).reduce((s: number, st: any) => s + (st.students || 0), 0)
  const totalTeachers = Object.values(schoolStats).reduce((s: number, st: any) => s + (st.teachers || 0), 0)
  const totalRevenue = Object.values(schoolStats).reduce((s: number, st: any) => s + (st.paidFees || 0), 0)
  const totalPending = Object.values(schoolStats).reduce((s: number, st: any) => s + ((st.totalFees || 0) - (st.paidFees || 0)), 0)
  const activeSchools = schools.filter(s => s.isActive).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">Manage all schools from one place</p>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Schools</p>
              <BuildingIcon className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{activeSchools}</p>
            <p className="text-[10px] text-muted-foreground">{schools.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Students</p>
              <GraduationCapIcon className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-[10px] text-muted-foreground">across all schools</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Teachers</p>
              <BookOpenIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{totalTeachers}</p>
            <p className="text-[10px] text-muted-foreground">across all schools</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <IndianRupeeIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">{fmt(totalRevenue)}</p>
            <p className="text-[10px] text-muted-foreground">collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Pending</p>
              <IndianRupeeIcon className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">{fmt(totalPending)}</p>
            <p className="text-[10px] text-muted-foreground">uncollected</p>
          </CardContent>
        </Card>
      </div>

      {/* School cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3">All Schools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => {
            const stats = schoolStats[school.id] || { students: 0, teachers: 0, classes: 0, totalFees: 0, paidFees: 0, collectionRate: 0 }
            return (
              <Card
                key={school.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedSchool(school)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{school.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {school.board || "N/A"} · {school.city || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={school.isActive ? "default" : "secondary"} className="text-[10px]">
                        {school.isActive ? "Live" : "Setup"}
                      </Badge>
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">{stats.students}</p>
                      <p className="text-[10px] text-muted-foreground">Students</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">{stats.teachers}</p>
                      <p className="text-[10px] text-muted-foreground">Teachers</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-lg font-bold">{stats.classes}</p>
                      <p className="text-[10px] text-muted-foreground">Classes</p>
                    </div>
                  </div>

                  {stats.totalFees > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Fee Collection</span>
                        <span className="font-medium">{stats.collectionRate}%</span>
                      </div>
                      <Progress value={stats.collectionRate} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {fmt(stats.paidFees)} of {fmt(stats.totalFees)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
