"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  CalendarCheckIcon,
  UsersIcon,
  SettingsIcon,
  MenuIcon,
  IndianRupeeIcon,
  ClipboardCheckIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type UserRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "PARENT" | "BROKER" | "STUDENT" | "AGENT"

interface TabItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const tabsByRole: Record<string, TabItem[]> = {
  PARENT: [
    { label: "Home", href: "/dashboard", icon: HomeIcon },
    { label: "Attendance", href: "/attendance", icon: CalendarCheckIcon },
    { label: "Fees", href: "/fees", icon: IndianRupeeIcon },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
  ],
  TEACHER: [
    { label: "Home", href: "/dashboard", icon: HomeIcon },
    { label: "Attendance", href: "/attendance", icon: ClipboardCheckIcon },
    { label: "Students", href: "/students", icon: UsersIcon },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
  ],
  ADMIN: [
    { label: "Home", href: "/dashboard", icon: HomeIcon },
    { label: "Students", href: "/students", icon: UsersIcon },
    { label: "Fees", href: "/fees", icon: IndianRupeeIcon },
    { label: "More", href: "/settings", icon: MenuIcon },
  ],
  SUPER_ADMIN: [
    { label: "Home", href: "/dashboard", icon: HomeIcon },
    { label: "Students", href: "/students", icon: UsersIcon },
    { label: "Fees", href: "/fees", icon: IndianRupeeIcon },
    { label: "More", href: "/settings", icon: MenuIcon },
  ],
  BROKER: [
    { label: "Home", href: "/dashboard", icon: HomeIcon },
    { label: "Partners", href: "/partners", icon: UsersIcon },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
  ],
}

const defaultTabs: TabItem[] = [
  { label: "Home", href: "/dashboard", icon: HomeIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
]

export function MobileNav({ role }: { role?: string }) {
  const pathname = usePathname()
  const tabs = (role && tabsByRole[role]) || defaultTabs

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
