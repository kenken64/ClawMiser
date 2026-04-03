import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import db from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = db
    .prepare(
      `SELECT id, filename, file_type, raw_tokens, compressed_tokens, github_url, created_at
       FROM conversions WHERE user_email = ? ORDER BY created_at DESC LIMIT 50`
    )
    .all(session.user.email)

  return NextResponse.json(rows)
}
