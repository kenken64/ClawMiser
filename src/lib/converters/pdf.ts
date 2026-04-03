// pdf-parse has no ESM default export — use require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse")

export async function convertPdfToMarkdown(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  const lines = (data.text as string).split("\n").filter((l: string) => l.trim())
  return `# Document\n\n${lines.join("\n\n")}`
}
