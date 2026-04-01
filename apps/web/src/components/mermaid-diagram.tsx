"use client"

import { useEffect, useRef, useState } from "react"

// Singleton mermaid instance + render queue to prevent concurrent render conflicts
let mermaidInstance: typeof import("mermaid").default | null = null
let initPromise: Promise<typeof import("mermaid").default> | null = null
let renderCounter = 0

// Queue system: mermaid.render() cannot run concurrently
const renderQueue: Array<{
  id: string
  chart: string
  resolve: (svg: string) => void
  reject: (err: unknown) => void
}> = []
let isProcessing = false

function getMermaid(): Promise<typeof import("mermaid").default> {
  if (mermaidInstance) return Promise.resolve(mermaidInstance)
  if (initPromise) return initPromise

  initPromise = import("mermaid").then((mod) => {
    const mermaid = mod.default
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#3b82f6",
        primaryTextColor: "#e2e8f0",
        primaryBorderColor: "#475569",
        lineColor: "#64748b",
        secondaryColor: "#1e293b",
        tertiaryColor: "#0f172a",
        background: "#020617",
        mainBkg: "#1e293b",
        nodeBorder: "#475569",
        clusterBkg: "#0f172a",
        clusterBorder: "#334155",
        titleColor: "#e2e8f0",
        edgeLabelBackground: "#1e293b",
        nodeTextColor: "#e2e8f0",
      },
      er: {
        diagramPadding: 20,
        layoutDirection: "TB",
        minEntityWidth: 120,
        minEntityHeight: 60,
        entityPadding: 12,
        useMaxWidth: true,
      },
      journey: {
        diagramMarginX: 15,
        diagramMarginY: 10,
        leftMargin: 60,
        width: 180,
        height: 40,
        useMaxWidth: true,
      },
      fontSize: 13,
      securityLevel: "loose",
    })
    mermaidInstance = mermaid
    return mermaid
  })

  return initPromise
}

async function processQueue() {
  if (isProcessing) return
  isProcessing = true

  while (renderQueue.length > 0) {
    const item = renderQueue.shift()!
    try {
      const mermaid = await getMermaid()
      const { svg } = await mermaid.render(item.id, item.chart)
      item.resolve(svg)
    } catch (error) {
      console.error("Mermaid render error for", item.id, ":", error)
      item.reject(error)
    }
  }

  isProcessing = false
}

function queueRender(chart: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = `mermaid-${++renderCounter}-${Math.random().toString(36).slice(2, 8)}`
    renderQueue.push({ id, chart, resolve, reject })
    processQueue()
  })
}

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className = "" }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>("")

  useEffect(() => {
    let cancelled = false

    queueRender(chart)
      .then((renderedSvg) => {
        if (!cancelled) setSvg(renderedSvg)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [chart])

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
