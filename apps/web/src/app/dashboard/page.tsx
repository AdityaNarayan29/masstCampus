"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ParentDashboard } from "@/components/parent-dashboard"
import { TeacherDashboard } from "@/components/teacher-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { BrokerDashboard } from "@/components/broker-dashboard"

import data from "./data.json"

function RoleDashboard({ role }: { role: string }) {
  switch (role) {
    case "PARENT":
      return <ParentDashboard />
    case "TEACHER":
      return <TeacherDashboard />
    case "ADMIN":
    case "SUPER_ADMIN":
      return <AdminDashboard />
    case "BROKER":
      return <BrokerDashboard />
    default:
      return null
  }
}

export default function Page() {
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setUserRole(user.role || null)
      } catch {
        setUserRole(null)
      }
    }
  }, [])

  const hasRoleDashboard =
    userRole === "PARENT" ||
    userRole === "TEACHER" ||
    userRole === "ADMIN" ||
    userRole === "SUPER_ADMIN" ||
    userRole === "BROKER"

  if (hasRoleDashboard && userRole) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <RoleDashboard role={userRole} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // SUPER_ADMIN or default dashboard
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
