"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
}

type Stage = "idle" | "converting" | "compressing" | "uploading" | "done" | "error"

interface ConvertResult {
  raw: string
  compressed: string
  rawTokens: number
  compressedTokens: number
  githubUrl: string | null
}

interface FileDropzoneProps {
  onResult: (result: ConvertResult, filename: string) => void
  onHistoryRefresh: () => void
}

const STAGE_LABELS: Record<Stage, string> = {
  idle: "",
  converting: "Converting to markdown...",
  compressing: "Running repomix compression...",
  uploading: "Pushing to GitHub...",
  done: "Done",
  error: "Error",
}

const STAGE_PROGRESS: Record<Stage, number> = {
  idle: 0, converting: 30, compressing: 65, uploading: 90, done: 100, error: 0,
}

export function FileDropzone({ onResult, onHistoryRefresh }: FileDropzoneProps) {
  const [stage, setStage] = useState<Stage>("idle")
  const [error, setError] = useState("")

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return
      const file = accepted[0]
      setError("")
      setStage("converting")

      const formData = new FormData()
      formData.append("file", file)

      try {
        setStage("compressing")
        const res = await fetch("/api/convert", { method: "POST", body: formData })
        if (!res.ok) {
          const e = await res.json()
          throw new Error(e.error ?? "Conversion failed")
        }
        setStage("uploading")
        const data: ConvertResult = await res.json()
        setStage("done")
        onResult(data, file.name)
        onHistoryRefresh()
        setTimeout(() => setStage("idle"), 2000)
      } catch (err: unknown) {
        setStage("error")
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    },
    [onResult, onHistoryRefresh]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    disabled: stage !== "idle" && stage !== "done" && stage !== "error",
  })

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-all
          ${isDragActive ? "border-[#58a6ff] bg-[#1f6feb22]" : "border-[#30363d] hover:border-[#58a6ff] hover:bg-[#161b22]"}
          ${stage !== "idle" && stage !== "done" && stage !== "error" ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" className="text-[#7d8590]">
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 018 4.25V1.5H3.75zm6.75.96V4.25c0 .138.112.25.25.25h1.79L10.5 2.46z"/>
          </svg>
          <div>
            <p className="text-[#e6edf3] font-mono">
              {isDragActive ? "Drop file here" : "Drag & drop a file here"}
            </p>
            <p className="text-[#7d8590] text-xs mt-1">
              PDF · DOCX · XLSX · PPTX · TXT · MD
            </p>
          </div>
          <span className="text-xs text-[#58a6ff] border border-[#30363d] rounded px-2 py-0.5">
            Browse
          </span>
        </div>
      </div>

      {stage !== "idle" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-[#7d8590] font-mono">
            <span>{STAGE_LABELS[stage]}</span>
            <span>{STAGE_PROGRESS[stage]}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#21262d] rounded overflow-hidden">
            {stage !== "error" ? (
              <div
                className={`h-full rounded transition-all duration-500 ${stage === "done" ? "bg-[#3fb950]" : "progress-shimmer"}`}
                style={{ width: `${STAGE_PROGRESS[stage]}%` }}
              />
            ) : (
              <div className="h-full bg-[#f85149] w-full rounded" />
            )}
          </div>
          {stage === "error" && (
            <p className="text-[#f85149] text-xs font-mono">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
