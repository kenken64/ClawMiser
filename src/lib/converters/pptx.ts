import { parseOffice } from "officeparser"

export async function convertPptxToMarkdown(buffer: Buffer): Promise<string> {
  const text = String(await parseOffice(buffer, {}))
  const slides = text.split(/\n{3,}/).filter((s) => s.trim())
  return slides
    .map((slide, i) => `## Slide ${i + 1}\n\n${slide.trim()}`)
    .join("\n\n")
}
