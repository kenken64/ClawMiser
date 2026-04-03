"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MarkdownViewerProps {
  raw: string
  compressed: string
  rawTokens: number
  compressedTokens: number
  githubUrl: string | null
  filename: string
}

export function MarkdownViewer({ raw, compressed, rawTokens, compressedTokens, githubUrl, filename }: MarkdownViewerProps) {
  const [copied, setCopied] = useState<"raw" | "compressed" | null>(null)

  const copy = async (text: string, type: "raw" | "compressed") => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 1500)
  }

  const download = (text: string, name: string) => {
    const blob = new Blob([text], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const reduction = rawTokens > 0 ? Math.round((1 - compressedTokens / rawTokens) * 100) : 0

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* File breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#7d8590] font-mono border-b border-[#30363d] pb-2">
        <span className="text-[#58a6ff]">{filename}</span>
        <span>·</span>
        <Badge className="bg-[#1f6feb22] text-[#58a6ff] border border-[#1f6feb] text-xs font-mono">
          {rawTokens.toLocaleString()} tokens raw
        </Badge>
        <span>→</span>
        <Badge className="bg-[#1a3a2a] text-[#3fb950] border border-[#2ea043] text-xs font-mono">
          {compressedTokens.toLocaleString()} tokens
        </Badge>
        {reduction > 0 && (
          <Badge className="bg-[#2a1a1a] text-[#d29922] border border-[#d29922] text-xs font-mono">
            ↓{reduction}%
          </Badge>
        )}
      </div>

      <Tabs defaultValue="compressed" className="flex flex-col flex-1 min-h-0">
        <TabsList className="bg-[#161b22] border border-[#30363d] w-fit">
          <TabsTrigger value="compressed" className="font-mono text-xs data-[state=active]:bg-[#21262d] data-[state=active]:text-[#e6edf3]">
            Compressed
          </TabsTrigger>
          <TabsTrigger value="raw" className="font-mono text-xs data-[state=active]:bg-[#21262d] data-[state=active]:text-[#e6edf3]">
            Raw
          </TabsTrigger>
        </TabsList>

        {(["compressed", "raw"] as const).map((type) => {
          const text = type === "compressed" ? compressed : raw
          const name = `${filename.replace(/\.[^.]+$/, "")}-${type}.md`
          return (
            <TabsContent key={type} value={type} className="flex-1 min-h-0 mt-2">
              <div className="flex flex-col gap-2 h-full">
                <div className="flex gap-2">
                  <button
                    onClick={() => copy(text, type)}
                    className="text-xs font-mono text-[#7d8590] hover:text-[#e6edf3] border border-[#30363d] rounded px-2 py-0.5 transition-colors"
                  >
                    {copied === type ? "✓ Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => download(text, name)}
                    className="text-xs font-mono text-[#7d8590] hover:text-[#e6edf3] border border-[#30363d] rounded px-2 py-0.5 transition-colors"
                  >
                    Download
                  </button>
                  {type === "compressed" && githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-[#58a6ff] hover:underline border border-[#30363d] rounded px-2 py-0.5 flex items-center gap-1"
                    >
                      <span>↑</span> View on GitHub
                    </a>
                  )}
                </div>
                <ScrollArea className="flex-1 border border-[#30363d] rounded-md overflow-hidden">
                  <SyntaxHighlighter
                    language="markdown"
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, background: "#0d1117", fontSize: "12px", minHeight: "300px" }}
                    wrapLongLines
                  >
                    {text || "No content"}
                  </SyntaxHighlighter>
                </ScrollArea>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
