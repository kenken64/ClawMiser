// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth = require("mammoth")

export async function convertDocxToMarkdown(buffer: Buffer): Promise<string> {
  const result = await mammoth.convertToMarkdown({ buffer })
  return result.value as string
}
