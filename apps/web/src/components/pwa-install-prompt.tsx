"use client"

import { useEffect, useState } from "react"
import { XIcon, DownloadIcon } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    const timer = setTimeout(() => {
      setVisible(false)
    }, 10000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (!visible || !deferredPrompt) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] md:hidden">
      <div className="flex items-center justify-between gap-2 bg-primary px-4 py-2.5 text-primary-foreground">
        <div className="flex items-center gap-2 text-sm">
          <DownloadIcon className="h-4 w-4 shrink-0" />
          <span>Install MasstCampus for a better experience</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstall}
            className="rounded-md bg-primary-foreground/20 px-3 py-1 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-primary-foreground/30"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-full p-1 transition-colors hover:bg-primary-foreground/20"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
