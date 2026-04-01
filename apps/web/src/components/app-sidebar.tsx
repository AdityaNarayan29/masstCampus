"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChartIcon,
  BookOpenIcon,
  BuildingIcon,
  CalendarCheckIcon,
  CreditCardIcon,
  DollarSignIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  HeadphonesIcon,
  UserPlusIcon,
  BellIcon,
  FileTextIcon,
  LayersIcon,
  Users2Icon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'BROKER' | 'STUDENT' | 'AGENT'

const allNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT', 'BROKER'] as UserRole[] },
  { title: "Schools", url: "/schools", icon: BuildingIcon, roles: ['SUPER_ADMIN'] as UserRole[] },
  { title: "Classes", url: "/classes", icon: LayersIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] as UserRole[] },
  { title: "Students", url: "/students", icon: GraduationCapIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] as UserRole[] },
  { title: "Teachers", url: "/teachers", icon: BookOpenIcon, roles: ['SUPER_ADMIN', 'ADMIN'] as UserRole[] },
  { title: "Counselors", url: "/counselors", icon: HeadphonesIcon, roles: ['SUPER_ADMIN', 'ADMIN'] as UserRole[] },
  { title: "Brokers", url: "/partners", icon: UserPlusIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'BROKER'] as UserRole[] },
  { title: "Parents", url: "/parents", icon: Users2Icon, roles: ['SUPER_ADMIN', 'ADMIN'] as UserRole[] },
  { title: "Attendance", url: "/attendance", icon: CalendarCheckIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT'] as UserRole[] },
  { title: "Fees", url: "/fees", icon: DollarSignIcon, roles: ['SUPER_ADMIN', 'ADMIN', 'PARENT'] as UserRole[] },
  { title: "Analytics", url: "/analytics", icon: BarChartIcon, roles: ['SUPER_ADMIN', 'ADMIN'] as UserRole[] },
]

const allDocuments = [
  { name: "Reports", url: "/reports", icon: FileTextIcon, roles: ['SUPER_ADMIN', 'ADMIN'] as UserRole[] },
  { name: "Audit Logs", url: "/audit-logs", icon: FileTextIcon, roles: ['SUPER_ADMIN', 'ADMIN'] as UserRole[] },
]

const navSecondary = [
  { title: "Settings", url: "/settings", icon: SettingsIcon },
  { title: "Help & Support", url: "/help", icon: HelpCircleIcon },
]

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'School Admin',
    TEACHER: 'Teacher',
    PARENT: 'Parent',
    BROKER: 'Broker',
    STUDENT: 'Student',
    AGENT: 'Agent',
  }
  return labels[role] || role
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{ name: string; email: string; avatar: string; role: UserRole }>({
    name: "",
    email: "",
    avatar: "",
    role: "ADMIN",
  })

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const profile = parsed.profile || {}
        const firstName = profile.firstName || ''
        const lastName = profile.lastName || ''
        setUser({
          name: `${firstName} ${lastName}`.trim() || parsed.email,
          email: parsed.email || '',
          avatar: '',
          role: parsed.role || 'ADMIN',
        })
      } catch {}
    }
  }, [])

  const navMain = allNavItems.filter(item => item.roles.includes(user.role))
  const documents = allDocuments.filter(item => item.roles.includes(user.role))

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <GraduationCapIcon className="h-5 w-5 text-primary" />
                <span className="text-base font-semibold">MasstCampus</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {documents.length > 0 && <NavDocuments items={documents} />}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user.name || getRoleLabel(user.role),
          email: user.email,
          avatar: user.avatar,
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
