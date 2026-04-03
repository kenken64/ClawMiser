import * as XLSX from "xlsx"

export function convertExcelToMarkdown(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const sections: string[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })

    if (rows.length === 0) continue

    sections.push(`## ${sheetName}`)

    const header = rows[0].map((c) => String(c))
    const divider = header.map(() => "---")
    const dataRows = rows.slice(1).map((r) => r.map((c) => String(c)))

    const toRow = (cells: string[]) => `| ${cells.join(" | ")} |`
    sections.push([toRow(header), toRow(divider), ...dataRows.map(toRow)].join("\n"))
  }

  return sections.join("\n\n")
}
