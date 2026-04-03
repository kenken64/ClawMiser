---
description: Stage, commit, and push changes to GitHub with minimal token usage
allowed-tools: Bash(git status:), Bash(git diff:), Bash(git add:), Bash(git commit:), Bash(git push:), Bash(git branch:), Bash(git remote:*)
argument-hint: "[commit message] (optional - auto-generates if omitted)"
---

## Context (auto-collected — do not ask user)

- Staged/unstaged files: `!git status --short`
- What changed: `!git diff --stat HEAD 2>/dev/null || git diff --stat`
- Current branch: `!git branch --show-current`
- Remote: `!git remote -v | head -4`

## Task

Push current changes to GitHub. Follow these steps exactly — no commentary, no confirmation prompts unless a step fails.

1. **Stage all changes**
   ```
   git add -A
   ```

2. **Commit**
   - If `$ARGUMENTS` is provided → use it as the commit message verbatim
   - If empty → generate a single-line conventional commit message from the diff stat above (format: `type(scope): short description`)

3. **Push**
   ```
   git push origin <current-branch>
   ```
   - If push is rejected (non-fast-forward) → run `git pull --rebase origin <branch>` then push again
   - If upstream not set → run `git push --set-upstream origin <branch>`

4. **Output** (one line each, nothing else):
   ```
   ✅ Committed: <message>
   ✅ Pushed to: origin/<branch>
   ```

## Rules

- Do NOT run `git diff` on full file contents — use `--stat` only (already collected above)
- Do NOT explain what you're doing step by step — just run the commands
- Do NOT ask for confirmation unless `git status` showed 0 changed files (then stop and say "Nothing to commit")
- Treat merge conflicts as a hard stop: print the conflicting files and exit
