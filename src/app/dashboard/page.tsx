"use client"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { FileDropzone } from "@/components/FileDropzone"
import { MarkdownViewer } from "@/components/MarkdownViewer"
import { ConversionHistory } from "@/components/ConversionHistory"
import { SignOutButton } from "@/components/SignInButton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

interface ConvertResult {
  raw: string
  compressed: string
  rawTokens: number
  compressedTokens: number
  githubUrl: string | null
}

interface Settings {
  github_repo: string
  github_branch: string
  github_folder: string
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [currentFile, setCurrentFile] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [settings, setSettings] = useState<Settings>({ github_repo: "", github_branch: "main", github_folder: "converted/" })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setSettings(d)).catch(() => {})
  }, [])

  const handleResult = useCallback((r: ConvertResult, filename: string) => {
    setResult(r)
    setCurrentFile(filename)
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((n) => n + 1)
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) })
    setSaving(false)
    setSettingsOpen(false)
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] font-mono">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-[#30363d] bg-[#161b22] shrink-0">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-[#58a6ff]">
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 018 4.25V1.5H3.75zm6.75.96V4.25c0 .138.112.25.25.25h1.79L10.5 2.46z"/>
          </svg>
          <span className="text-[#e6edf3] text-sm font-semibold">ClawMiser</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#7d8590] border border-[#30363d] rounded px-2 py-0.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-[#3fb950]">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
          </svg>
          {settings.github_repo || "no repo configured"}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <button className="text-xs text-[#7d8590] hover:text-[#e6edf3] border border-[#30363d] rounded px-2 py-0.5 transition-colors">
                Settings
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#161b22] border-[#30363d] text-[#e6edf3] font-mono">
              <DialogHeader>
                <DialogTitle className="text-[#e6edf3] font-mono text-sm">GitHub Repository Settings</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-[#7d8590]">Repository <span className="text-[#484f58]">(owner/repo)</span></Label>
                  <Input
                    value={settings.github_repo}
                    onChange={(e) => setSettings({ ...settings, github_repo: e.target.value })}
                    placeholder="username/my-docs"
                    className="bg-[#0d1117] border-[#30363d] text-[#e6edf3] font-mono text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label className="text-xs text-[#7d8590]">Branch</Label>
                    <Input
                      value={settings.github_branch}
                      onChange={(e) => setSettings({ ...settings, github_branch: e.target.value })}
                      placeholder="main"
                      className="bg-[#0d1117] border-[#30363d] text-[#e6edf3] font-mono text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Label className="text-xs text-[#7d8590]">Folder</Label>
                    <Input
                      value={settings.github_folder}
                      onChange={(e) => setSettings({ ...settings, github_folder: e.target.value })}
                      placeholder="converted/"
                      className="bg-[#0d1117] border-[#30363d] text-[#e6edf3] font-mono text-sm"
                    />
                  </div>
                </div>
                <Button
                  onClick={saveSettings}
                  disabled={saving}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white border-[#2ea043] font-mono text-sm"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <span className="text-[#7d8590] text-xs">{session?.user?.name}</span>
          <SignOutButton />
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: History */}
        <aside className="w-56 shrink-0 border-r border-[#30363d] flex flex-col">
          <ConversionHistory refreshTrigger={refreshTrigger} />
        </aside>

        {/* Center: Upload */}
        <main className="flex-1 flex flex-col gap-4 p-4 border-r border-[#30363d] min-w-0">
          <div className="text-xs text-[#7d8590] border-b border-[#30363d] pb-2">
            <span className="text-[#3fb950]">~/</span> upload file
          </div>
          <FileDropzone onResult={handleResult} onHistoryRefresh={handleRefresh} />
        </main>

        {/* Right: Viewer */}
        <aside className="flex-1 flex flex-col p-4 min-w-0">
          <div className="text-xs text-[#7d8590] border-b border-[#30363d] pb-2 mb-3">
            <span className="text-[#3fb950]">~/</span> output
          </div>
          {result ? (
            <MarkdownViewer
              raw={result.raw}
              compressed={result.compressed}
              rawTokens={result.rawTokens}
              compressedTokens={result.compressedTokens}
              githubUrl={result.githubUrl}
              filename={currentFile}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#484f58] text-xs">
              No output yet — drop a file to begin
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
