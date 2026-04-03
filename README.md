# ClawMiser

> Convert documents to compressed Markdown and push them to GitHub — automatically.

Sign in with GitHub, drop a file, and ClawMiser converts it to Markdown, compresses it with [repomix](https://github.com/yamadashy/repomix) to reduce token count, then pushes the result directly to a GitHub repository of your choice.

---

## Features

- **GitHub OAuth login** — Auth.js v5 with `repo` scope; the same token is used to push files
- **Multi-format conversion** — PDF, DOCX, XLSX, PPTX, TXT → Markdown
- **Repomix compression** — strips redundancy, shows token reduction (e.g. `12,400 → 4,100 tokens ↓66%`)
- **Auto GitHub push** — compressed `.md` committed to your configured repo/branch/folder
- **Conversion history** — commit-log style sidebar with direct GitHub links
- **GitHub Dark theme** — exact GitHub palette, monospace font throughout

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 + TypeScript + App Router |
| Auth | Auth.js v5 (GitHub OAuth) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Database | SQLite via `better-sqlite3` |
| PDF | `pdf-parse` |
| DOCX | `mammoth` |
| XLSX | `xlsx` (SheetJS) |
| PPTX | `officeparser` |
| Compression | `repomix` |
| GitHub sync | GitHub Contents API |

---

## Getting Started

### 1. Create a GitHub OAuth App

Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**

| Field | Value |
|-------|-------|
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3000/api/auth/callback/github` |

Copy the **Client ID** and generate a **Client Secret**.

### 2. Configure environment variables

```env
# .env.local
AUTH_GITHUB_ID=your_client_id
AUTH_GITHUB_SECRET=your_client_secret
AUTH_SECRET=your_random_32_byte_secret   # openssl rand -base64 32
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with GitHub, and start converting.

---

## Usage

1. **Sign in** with GitHub
2. **Settings** → enter a target repo (`owner/repo`), branch, and folder
3. **Drop a file** (PDF, DOCX, XLSX, PPTX, or TXT)
4. View **Raw** and **Compressed** Markdown side by side
5. The compressed file is automatically **committed to your GitHub repo**

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   ← Auth.js handler
│   │   ├── convert/              ← Upload, convert, compress, push
│   │   ├── history/              ← Conversion history
│   │   └── settings/             ← GitHub repo config
│   ├── dashboard/                ← Main 3-panel UI
│   └── page.tsx                  ← Landing / sign-in
├── components/
│   ├── FileDropzone.tsx
│   ├── MarkdownViewer.tsx
│   ├── ConversionHistory.tsx
│   └── SignInButton.tsx
└── lib/
    ├── auth.ts
    ├── db.ts
    ├── converters/               ← pdf, docx, excel, pptx, txt
    ├── repomix-runner.ts
    └── github-upload.ts
middleware.ts                     ← Protects /dashboard
```
