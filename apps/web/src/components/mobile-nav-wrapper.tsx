"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"

const EXCLUDED_PATHS = ["/login", "/home", "/onboarding", "/"]

export function MobileNavWrapper() {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)
  const [hasUser, setHasUser] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setRole(user.role || null)
        setHasUser(true)
      } catch {
        setHasUser(false)
      }
    } else {
      setHasUser(false)
    }
  }, [pathname])

  const isExcluded = EXCLUDED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/onboarding")
  )

  if (!hasUser || isExcluded) return null

  return <MobileNav role={role || undefined} />
}
