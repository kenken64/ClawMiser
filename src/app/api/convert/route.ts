import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { convertPdfToMarkdown } from "@/lib/converters/pdf"
import { convertDocxToMarkdown } from "@/lib/converters/docx"
import { convertExcelToMarkdown } from "@/lib/converters/excel"
import { convertPptxToMarkdown } from "@/lib/converters/pptx"
import { convertTxtToMarkdown } from "@/lib/converters/txt"
import { compressMarkdown, estimateTokens } from "@/lib/repomix-runner"
import { uploadToGitHub } from "@/lib/github-upload"
import db from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const mime = file.type
  const filename = file.name

  let rawMarkdown = ""
  let fileType = ""

  try {
    if (mime === "application/pdf" || filename.endsWith(".pdf")) {
      fileType = "pdf"
      rawMarkdown = await convertPdfToMarkdown(buffer)
    } else if (mime.includes("wordprocessingml") || filename.endsWith(".docx")) {
      fileType = "docx"
      rawMarkdown = await convertDocxToMarkdown(buffer)
    } else if (mime.includes("spreadsheetml") || filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      fileType = "xlsx"
      rawMarkdown = convertExcelToMarkdown(buffer)
    } else if (mime.includes("presentationml") || filename.endsWith(".pptx")) {
      fileType = "pptx"
      rawMarkdown = await convertPptxToMarkdown(buffer)
    } else if (mime.startsWith("text/") || filename.endsWith(".txt") || filename.endsWith(".md")) {
      fileType = "txt"
      rawMarkdown = convertTxtToMarkdown(buffer)
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: `Conversion failed: ${err}` }, { status: 500 })
  }

  const compressedMarkdown = await compressMarkdown(rawMarkdown)
  const rawTokens = estimateTokens(rawMarkdown)
  const compressedTokens = estimateTokens(compressedMarkdown)

  // Push to GitHub if user has settings configured
  let githubUrl: string | null = null
  const settings = db.prepare("SELECT * FROM user_settings WHERE user_email = ?").get(session.user.email) as {
    github_repo: string; github_branch: string; github_folder: string
  } | undefined

  if (settings?.github_repo && session.accessToken) {
    const ts = Date.now()
    const baseName = filename.replace(/\.[^.]+$/, "")
    try {
      const result = await uploadToGitHub({
        accessToken: session.accessToken as string,
        repo: settings.github_repo,
        branch: settings.github_branch,
        folder: settings.github_folder,
        filename: `${baseName}-${ts}.md`,
        content: compressedMarkdown,
      })
      githubUrl = result.url
    } catch {
      // Non-fatal — still return conversion result
    }
  }

  db.prepare(
    `INSERT INTO conversions (user_email, filename, file_type, raw_markdown, compressed_markdown, raw_tokens, compressed_tokens, github_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(session.user.email, filename, fileType, rawMarkdown, compressedMarkdown, rawTokens, compressedTokens, githubUrl)

  return NextResponse.json({ raw: rawMarkdown, compressed: compressedMarkdown, rawTokens, compressedTokens, githubUrl })
}
