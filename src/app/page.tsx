import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SignInButton } from "@/components/SignInButton"

export default async function Home() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117] px-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #58a6ff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#161b22] border border-[#30363d] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="text-[#58a6ff]">
              <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 018 4.25V1.5H3.75zm6.75.96V4.25c0 .138.112.25.25.25h1.79L10.5 2.46z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-[#e6edf3] font-mono text-lg font-semibold tracking-tight">ClawMiser</h1>
            <p className="text-[#7d8590] font-mono text-xs">markdown compression · github sync</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
          <div className="border-b border-[#30363d] px-4 py-2.5 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#d29922]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
            <span className="ml-2 text-[#7d8590] text-xs font-mono">clawmiser — sign in</span>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <div className="font-mono text-xs text-[#7d8590] space-y-1">
              <p><span className="text-[#3fb950]">$</span> clawmiser <span className="text-[#58a6ff]">--help</span></p>
              <p className="pl-2 text-[#484f58]">Upload PDF, DOCX, XLSX, PPTX, TXT</p>
              <p className="pl-2 text-[#484f58]">→ Convert to Markdown</p>
              <p className="pl-2 text-[#484f58]">→ Compress with repomix</p>
              <p className="pl-2 text-[#484f58]">→ Push to GitHub</p>
            </div>

            <div className="border-t border-[#30363d] pt-4">
              <SignInButton />
            </div>

            <p className="text-[#484f58] text-xs font-mono text-center">
              Requires GitHub OAuth · <span className="text-[#7d8590]">repo</span> scope for push
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
