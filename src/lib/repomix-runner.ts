import { runCli } from "repomix"
import fs from "fs/promises"
import path from "path"
import os from "os"
import { randomUUID } from "crypto"

export async function compressMarkdown(rawMarkdown: string): Promise<string> {
  const id = randomUUID()
  const tmpDir = path.join(os.tmpdir(), `clawmiser-${id}`)
  const inputPath = path.join(tmpDir, "input.md")
  const outputPath = path.join(tmpDir, "output.md")

  await fs.mkdir(tmpDir, { recursive: true })
  await fs.writeFile(inputPath, rawMarkdown, "utf-8")

  try {
    await runCli(
      [inputPath, "--style", "markdown", "--compress", "--output", outputPath],
      tmpDir,
      {}
    )

    const compressed = await fs.readFile(outputPath, "utf-8").catch(() => rawMarkdown)
    return compressed
  } catch {
    return rawMarkdown
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
