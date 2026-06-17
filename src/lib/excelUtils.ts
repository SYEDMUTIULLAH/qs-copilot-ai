import * as XLSX from "xlsx";
import { BOQItem, Variation } from "../types";

// Export BOQ items for a project to an Excel file (.xlsx)
export function exportBOQToExcel(projectName: string, items: BOQItem[]): void {
  const worksheetData = items.map((item) => ({
    "Bill Ref": item.billRef,
    "Description": item.description,
    "Unit": item.unit,
    "Original Tender Qty": item.originalQty,
    "Claimed/Consumed Qty": item.claimedQty,
    "Remaining Qty": item.remainingQty,
    "Contract Rate ($)": item.rate,
    "Total Original Amount ($)": item.totalAmount,
    "Total Claimed Amount ($)": item.claimedQty * item.rate
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BOQ Tracker");

  // Generate buffer and save
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const downloadLink = document.createElement("a");
  const url = URL.createObjectURL(dataBlob);
  downloadLink.href = url;
  downloadLink.download = `${projectName.replace(/\s+/g, "_")}_BOQ_Audit_Sheet.xlsx`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

// Parse imported Excel upload into BOQItems
export function parseBOQExcel(file: File): Promise<Partial<BOQItem>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const mappedItems: Partial<BOQItem>[] = jsonData.map((row) => {
          const billRef = String(row["Bill Ref"] || row["Bill Reference"] || row["Ref"] || "").trim();
          const description = String(row["Description"] || row["Item Description"] || row["Detail"] || "Imported Item").trim();
          const unit = String(row["Unit"] || row["Measurement Unit"] || "m3").trim();
          const originalQty = Number(row["Original Tender Qty"] || row["Quantity"] || row["Qty"] || 0);
          const claimedQty = Number(row["Claimed/Consumed Qty"] || row["Claimed Qty"] || 0);
          const rate = Number(row["Contract Rate ($)"] || row["Rate"] || row["Unit Cost"] || 0);

          return {
            billRef: billRef || "1.0",
            description,
            unit,
            originalQty,
            claimedQty,
            remainingQty: originalQty - claimedQty,
            rate,
            totalAmount: originalQty * rate
          };
        });

        resolve(mappedItems.filter(item => item.billRef));
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
