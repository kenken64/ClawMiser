"use client"

import { useEffect, useState, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Conversion {
  id: number
  filename: string
  file_type: string
  raw_tokens: number
  compressed_tokens: number
  github_url: string | null
  created_at: string
}

const TYPE_COLORS: Record<string, string> = {
  pdf: "text-[#f85149]",
  docx: "text-[#58a6ff]",
  xlsx: "text-[#3fb950]",
  pptx: "text-[#d29922]",
  txt: "text-[#7d8590]",
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function ConversionHistory({ refreshTrigger }: { refreshTrigger: number }) {
  const [items, setItems] = useState<Conversion[]>([])

  const load = useCallback(async () => {
    const res = await fetch("/api/history")
    if (res.ok) setItems(await res.json())
  }, [])

  useEffect(() => { load() }, [load, refreshTrigger])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#30363d]">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-[#7d8590]">
          <path d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/>
        </svg>
        <span className="text-[#7d8590] text-xs font-mono">History</span>
        <Badge className="ml-auto bg-[#21262d] text-[#7d8590] text-xs font-mono border-[#30363d]">
          {items.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <p className="text-[#484f58] text-xs font-mono text-center py-8">No conversions yet</p>
        ) : (
          <div className="divide-y divide-[#21262d]">
            {items.map((item) => {
              const reduction = item.raw_tokens > 0
                ? Math.round((1 - item.compressed_tokens / item.raw_tokens) * 100)
                : 0
              const shortHash = String(item.id).padStart(7, "0")
              return (
                <div key={item.id} className="px-3 py-2.5 hover:bg-[#161b22] transition-colors">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[#58a6ff] text-xs font-mono">{shortHash}</span>
                    <span className={`text-xs font-mono uppercase ${TYPE_COLORS[item.file_type] ?? "text-[#7d8590]"}`}>
                      .{item.file_type}
                    </span>
                  </div>
                  <p className="text-[#e6edf3] text-xs font-mono truncate">{item.filename}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[#3fb950] text-xs font-mono">↓{reduction}%</span>
                    <span className="text-[#484f58] text-xs font-mono">{timeAgo(item.created_at)}</span>
                    {item.github_url && (
                      <a
                        href={item.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#58a6ff] text-xs font-mono hover:underline ml-auto"
                      >
                        ↑ GH
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
