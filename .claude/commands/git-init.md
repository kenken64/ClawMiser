---
description: Initialize a local git repo and push it to a new GitHub repository
allowed-tools: Bash(git init:*), Bash(git add:*), Bash(git commit:*), Bash(git remote:*), Bash(git push:*), Bash(git branch:*), Bash(gh repo create:*), Bash(gh auth status:*), Bash(ls:*), Bash(cat:*)
argument-hint: "<repo-name> [public|private] (e.g. my-project private)"
---

# Context (auto-collected)
- Current directory: !`pwd`
- Git status: !`git status 2>&1 | head -5`
- GitHub CLI auth: !`gh auth status 2>&1 | head -3`
- Existing remotes: !`git remote -v 2>/dev/null || echo "no remotes"`

# Task
Initialize this directory as a GitHub repository. Arguments: `$ARGUMENTS`
Parse `$ARGUMENTS` as: first token = repo name, second token = visibility (`public` or `private`, default `private`).

Follow these steps exactly — no prompts, no explanations mid-way.

## Step 1 — Local git init (skip if already a git repo)
```bash
git init
git branch -M main
```

## Step 2 — Initial commit (skip if commits already exist)
```bash
git add -A
git commit -m "chore: initial commit"
```

## Step 3 — Create GitHub repo via CLI
```bash
gh repo create <repo-name> --<visibility> --source=. --remote=origin --push
```
- If `gh` is not authenticated (detected above) → stop and print:
  ```
  ❌ Run: gh auth login
  Then re-run /git-init
  ```
- If repo name already exists on GitHub → append `-2` to name and retry once

## Step 4 — Verify
```bash
git remote -v
git log --oneline -1
```

## Step 5 — Output (concise, nothing else):
```
✅ Repo created:   https://github.com/<user>/<repo-name>
✅ Branch:         main
✅ Visibility:     <public|private>
✅ Initial commit: <message>
```

# Rules
- Do NOT run `git diff` or read file contents
- Do NOT create a `.gitignore` unless one is already present in the directory
- Do NOT push sensitive files — if `.env` exists with no `.gitignore`, stop and warn:
  ```
  ⚠️  .env detected with no .gitignore. Add it to .gitignore first.
  ```
- Repo name defaults to the current directory name if `$ARGUMENTS` is empty
- Visibility defaults to `private` if not specified
