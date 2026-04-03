# ClawMiser — Plan

## Context
Build a new Next.js mini-app in `D:\Projects\ClawMiser` (empty directory). The app lets users log in with GitHub OAuth, upload documents (PDF, DOCX, XLSX, PPTX, TXT), converts them to Markdown, then compresses/optimizes the Markdown using repomix. Inspired by the newsclaw repo architecture (Next.js App Router + SQLite + shadcn/ui) but with a distinct **GitHub Dark + Compression Terminal theme** and a completely different purpose.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 + TypeScript + App Router | Same as newsclaw, proven pattern |
| Auth | Auth.js v5 (next-auth) + GitHub provider | Simplest GitHub OAuth in 2025 |
| UI | Tailwind CSS v4 + shadcn/ui | Rapid component building |
| Theme | GitHub Dark + Compression Terminal | GitHub palette + monospace, commit-log style |
| DB | SQLite + better-sqlite3 | Lightweight, zero-setup persistence for history |
| PDF→MD | `pdf-parse` | Pure TS, Node 20+, actively maintained |
| DOCX→MD | `mammoth` | Has `convertToMarkdown()` directly |
| XLSX→MD | `xlsx` (SheetJS) | Reads sheets, format as MD tables |
| PPTX→MD | `office-parser` | Multi-format text extraction |
| Repomix | `repomix` npm package via `runCli()` API | Programmatic markdown compression |

---

## Theme — GitHub Dark + Compression Terminal

Inspired by GitHub's own dark UI color system (github.com/dark), layered with a code-density / diff-terminal aesthetic that echoes the compression workflow.

- **Background**: `#0d1117` (GitHub dark canvas)
- **Surface/Card**: `#161b22` (GitHub dark overlay)
- **Border**: `#30363d` (GitHub dark border), highlight `#58a6ff` (GitHub blue)
- **Primary accent**: `#58a6ff` (GitHub link blue) — buttons, active states
- **Success/commit**: `#3fb950` (GitHub green) — upload complete, GitHub push success
- **Warning/repomix**: `#d29922` (GitHub yellow) — processing / compressing state
- **Danger**: `#f85149` (GitHub red) — errors
- **Text primary**: `#e6edf3`, **muted**: `#7d8590` (exact GitHub dark text palette)
- **Font**: `ui-monospace, SFMono-Regular, Menlo, monospace` — code-editor feel throughout
- **Code blocks**: GitHub-style diff coloring (`+` green, `-` red, unchanged grey)
- **File tabs**: Mimic GitHub file viewer tabs (filename breadcrumb + raw/preview toggle)
- **Progress bar**: Terminal-style fill bar that animates during compression
- **Icons**: GitHub Octicons style (folder, file, repo, commit, check icons)
- **Compression badge**: Shows token count before vs after (e.g. `12,400 → 4,100 tokens ↓66%`)
- **History list**: Styled like a GitHub commit log — hash, message, time, branch badge

---

## File Structure

```
D:\Projects\ClawMiser\
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   ← Auth.js catch-all handler
│   │   │   ├── convert/route.ts              ← POST: upload + convert + repomix
│   │   │   ├── history/route.ts              ← GET: list user's conversions
│   │   │   └── settings/route.ts             ← GET/POST: user GitHub repo config
│   │   ├── dashboard/
│   │   │   └── page.tsx                      ← Main authenticated page
│   │   ├── page.tsx                          ← Landing / login page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── FileDropzone.tsx                  ← Drag-and-drop upload UI
│   │   ├── MarkdownViewer.tsx                ← Syntax-highlighted MD display
│   │   ├── ConversionHistory.tsx             ← Past conversions sidebar
│   │   └── SignInButton.tsx                  ← GitHub OAuth button
│   └── lib/
│       ├── auth.ts                           ← Auth.js config with GitHub provider
│       ├── db.ts                             ← SQLite init + schema
│       ├── converters/
│       │   ├── pdf.ts                        ← pdf-parse → markdown
│       │   ├── docx.ts                       ← mammoth → markdown
│       │   ├── excel.ts                      ← xlsx (SheetJS) → MD tables
│       │   ├── pptx.ts                       ← office-parser → markdown
│       │   └── txt.ts                        ← raw text → markdown
│       ├── repomix-runner.ts                 ← wraps repomix runCli()
│       └── github-upload.ts                  ← GitHub Contents API (PUT file)
├── middleware.ts                             ← protects /dashboard
├── .env.local                               ← AUTH_GITHUB_ID/SECRET, AUTH_SECRET
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

---

## Key Implementation Details

### 1. Auth (auth.ts + middleware.ts)
```ts
// lib/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
export const { handlers, auth, signIn, signOut } = NextAuth({ providers: [GitHub] })

// middleware.ts — protect /dashboard
export { auth as middleware } from "@/lib/auth"
export const config = { matcher: ["/dashboard/:path*"] }
```
Env vars: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET`

Auth.js must include `repo` scope in the GitHub provider so the access token can push files:
```ts
GitHub({ authorization: { params: { scope: "read:user user:email repo" } } })
```
The access token is stored in the JWT session and forwarded to `github-upload.ts`.

### 2. SQLite Schema (lib/db.ts)
```sql
CREATE TABLE IF NOT EXISTS conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  raw_markdown TEXT,
  compressed_markdown TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_email TEXT PRIMARY KEY,
  github_repo TEXT,        -- e.g. "username/my-docs"
  github_branch TEXT DEFAULT 'main',
  github_folder TEXT DEFAULT 'converted/'
);
```

### 3. Conversion API (api/convert/route.ts)
- Accept `multipart/form-data` with file
- Detect MIME type → route to correct converter in `lib/converters/`
- Write markdown to temp file → call `repomix-runner.ts`
- Store result in SQLite
- Return `{ raw, compressed }` JSON

### 4. Repomix Runner (lib/repomix-runner.ts)
- Write raw markdown to `os.tmpdir()/input.md`
- Call `runCli(['--style', 'markdown', '--compress', inputPath], cwd, opts)`
- Read back compressed output file
- Delete temp files

### 5. File Converters
- `pdf.ts`: `pdf-parse(buffer)` → `.text` → wrap in markdown headings
- `docx.ts`: `mammoth.convertToMarkdown({buffer})` → `.value`
- `excel.ts`: `XLSX.read(buffer)` → iterate sheets → build `| col | col |` MD tables
- `pptx.ts`: `officeParser.parseOfficeAsync(buffer)` → text → markdown
- `txt.ts`: wrap raw text in markdown code block or passthrough

### 6. GitHub Upload (lib/github-upload.ts)
After repomix compression, automatically push the compressed markdown to a GitHub repo using the user's OAuth access token (stored in Auth.js session).

- Auth.js GitHub provider must request `repo` scope so the token can write to repos
- User configures target repo + branch in dashboard settings (stored in SQLite `user_settings` table)
- `PUT /repos/{owner}/{repo}/contents/{path}` GitHub API — creates or updates file
- Filename: `{original-filename}-{timestamp}.md`
- Dashboard shows a GitHub link to the uploaded file after conversion

### 7. Dashboard Page
Three-panel layout:
- **Left sidebar**: Conversion history list (fetched from `/api/history`) with GitHub links
- **Center**: FileDropzone with animated upload area + progress
- **Right panel**: Split view — Raw MD tab / Compressed MD tab with copy/download buttons + GitHub upload status badge
- **Settings modal**: Configure target GitHub repo/branch/folder

---

## Build Steps (in order)

1. `npx create-next-app@latest clawmiser` — TypeScript, App Router, Tailwind, src/
2. Install deps: `next-auth`, `better-sqlite3`, `@types/better-sqlite3`, `pdf-parse`, `mammoth`, `xlsx`, `office-parser`, `repomix`, `react-dropzone`, `react-syntax-highlighter`
3. Install shadcn/ui: `npx shadcn@latest init` + add: button, card, badge, tabs, toast, progress, separator, scroll-area
4. Build `globals.css` with GitHub dark theme tokens
5. Implement `lib/auth.ts` + `middleware.ts`
6. Implement `lib/db.ts`
7. Implement `lib/converters/*.ts`
8. Implement `lib/repomix-runner.ts`
9. Implement `app/api/convert/route.ts` + `app/api/history/route.ts`
10. Build `app/page.tsx` (landing + sign-in)
11. Build `lib/github-upload.ts` (GitHub Contents API PUT)
12. Update `api/convert/route.ts` to call github-upload after repomix
13. Build `app/dashboard/page.tsx` + components (with settings modal for repo config)
14. Add `app/api/settings/route.ts` (GET/POST user GitHub repo settings)

---

## Environment Variables Setup

### `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`

1. Go to **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name**: ClawMiser
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**
4. Copy **Client ID** → `AUTH_GITHUB_ID`
5. Click **Generate a new client secret** → copy it → `AUTH_GITHUB_SECRET`

> Direct link: https://github.com/settings/developers

### `AUTH_SECRET`

Random 32-byte secret used to sign session cookies.

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### `.env.local`
```env
AUTH_GITHUB_ID=Ov23liXXXXXXXXXXXXXX
AUTH_GITHUB_SECRET=abc123...your_secret...
AUTH_SECRET=base64_random_string_here
```

---

## Verification

1. `npm run dev` — app starts on localhost:3000
2. Click "Sign in with GitHub" — redirects to GitHub OAuth, returns authenticated
3. Upload a PDF → see raw markdown + compressed markdown in tabs
4. Upload DOCX, XLSX, PPTX, TXT — each converts correctly
5. Conversion appears in history sidebar
6. Copy / Download buttons work for both raw and compressed markdown
7. Navigating to /dashboard without auth redirects to home
8. Set target repo in settings → upload PDF → GitHub link appears in result panel and history
9. GitHub repo shows the committed compressed markdown file
