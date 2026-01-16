"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChartIcon,
  BookOpenIcon,
  BuildingIcon,
  CreditCardIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  HeadphonesIcon,
  UserPlusIcon,
  BellIcon,
  FileTextIcon,
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

const data = {
  user: {
    name: "Super Admin",
    email: "admin@masstcampus.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Schools",
      url: "/schools",
      icon: BuildingIcon,
    },
    {
      title: "Students",
      url: "/students",
      icon: GraduationCapIcon,
    },
    {
      title: "Teachers",
      url: "/teachers",
      icon: BookOpenIcon,
    },
    {
      title: "Counselors",
      url: "/counselors",
      icon: HeadphonesIcon,
    },
    {
      title: "Partners",
      url: "/partners",
      icon: UserPlusIcon,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChartIcon,
    },
  ],
  navClouds: [
    {
      title: "Users",
      icon: UsersIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "All Users",
          url: "/users",
        },
        {
          title: "Roles & Permissions",
          url: "/users/roles",
        },
      ],
    },
    {
      title: "Subscriptions",
      icon: CreditCardIcon,
      url: "#",
      items: [
        {
          title: "Plans",
          url: "/subscriptions/plans",
        },
        {
          title: "Billing",
          url: "/subscriptions/billing",
        },
      ],
    },
    {
      title: "Notifications",
      icon: BellIcon,
      url: "#",
      items: [
        {
          title: "Send Notification",
          url: "/notifications/send",
        },
        {
          title: "History",
          url: "/notifications/history",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Help & Support",
      url: "/help",
      icon: HelpCircleIcon,
    },
  ],
  documents: [
    {
      name: "Reports",
      url: "/reports",
      icon: FileTextIcon,
    },
    {
      name: "Audit Logs",
      url: "/audit-logs",
      icon: FileTextIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
