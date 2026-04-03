import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import "./globals.css"

export const metadata: Metadata = {
  title: "ClawMiser — Markdown Compressor",
  description: "Convert documents to compressed markdown and push to GitHub",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0d1117] text-[#e6edf3]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
