import * as XLSX from "xlsx";
import { BOQItem, Variation } from "../types";

// Export BOQ items for a project to an Excel file (.xlsx)

// Parse imported Excel upload into BOQItems
export function parseBOQExcel(file: File): Promise<Partial<BOQItem>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: ""
        });

        const items: Partial<BOQItem>[] = [];

        rows.forEach((row) => {
          const billRef = String(row[0] || "").trim();
          const description = String(row[1] || "").trim();
          const unit = String(row[2] || "").trim();

          const qty = Number(row[3]) || 0;
          const rate = Number(row[4]) || 0;

          if (
            billRef &&
            description &&
            !description.toLowerCase().includes("bill")
          ) {
            items.push({
              billRef,
              description,
              unit,
              originalQty: qty,
              claimedQty: 0,
              remainingQty: qty,
              rate,
              totalAmount: qty * rate
            });
          }
        });

        resolve(items);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("File reading failed"));

    reader.readAsArrayBuffer(file);
  });
}
// Export Variation Orders to Excel (.xlsx)
export function exportVariationsToExcel(projectName: string, variations: Variation[]): void {
  const worksheetData = variations.map((v) => ({
    "Variation Ref": v.refNumber,
    "Title": v.title,
    "Status": v.status,
    "Net Valuation ($)": v.variationValue,
    "Core Justification": v.justification,
    "Technical Summary": v.claimSummary,
    "Date Drafted": v.createdDate,
    "Authorized Sign-off By": v.approvedBy || "Uncertified"
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Variations Audit Log");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const downloadLink = document.createElement("a");
  const url = URL.createObjectURL(dataBlob);
  downloadLink.href = url;
  downloadLink.download = `${projectName.replace(/\s+/g, "_")}_Variations_Export.xlsx`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
