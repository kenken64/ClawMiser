interface UploadOptions {
  accessToken: string
  repo: string       // "owner/repo"
  branch: string
  folder: string
  filename: string
  content: string
}

interface UploadResult {
  url: string
  sha: string
}

export async function uploadToGitHub(opts: UploadOptions): Promise<UploadResult> {
  const { accessToken, repo, branch, folder, filename, content } = opts
  const filePath = `${folder.replace(/\/$/, "")}/${filename}`
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`

  // Check if file exists to get its SHA (needed for updates)
  let sha: string | undefined
  const existing = await fetch(`${apiUrl}?ref=${branch}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  })
  if (existing.ok) {
    const data = await existing.json()
    sha = data.sha
  }

  const body: Record<string, string> = {
    message: `docs: add ${filename} via ClawMiser`,
    content: Buffer.from(content).toString("base64"),
    branch,
  }
  if (sha) body.sha = sha

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub API error ${res.status}: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  return {
    url: data.content.html_url as string,
    sha: data.content.sha as string,
  }
}
