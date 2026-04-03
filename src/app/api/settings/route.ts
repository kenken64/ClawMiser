import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import db from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const row = db.prepare("SELECT * FROM user_settings WHERE user_email = ?").get(session.user.email)
  return NextResponse.json(row ?? { github_repo: "", github_branch: "main", github_folder: "converted/" })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { github_repo, github_branch, github_folder } = await req.json()

  db.prepare(
    `INSERT INTO user_settings (user_email, github_repo, github_branch, github_folder)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_email) DO UPDATE SET
       github_repo = excluded.github_repo,
       github_branch = excluded.github_branch,
       github_folder = excluded.github_folder`
  ).run(session.user.email, github_repo, github_branch ?? "main", github_folder ?? "converted/")

  return NextResponse.json({ ok: true })
}
