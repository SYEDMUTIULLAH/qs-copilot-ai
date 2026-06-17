import React, { useState, useRef } from "react";
import { TrendingUp, AlertTriangle, AlertCircle, RefreshCw, Save, CheckCircle2, Download, Upload } from "lucide-react";
import { BOQItem, QSProject, UserRole } from "../types";
import { exportBOQToExcel, parseBOQExcel } from "../lib/excelUtils";

interface BOQTrackerProps {
  boqItems: BOQItem[];
  project: QSProject;
  onUpdateClaimQty: (id: string, qty: number, role: UserRole) => Promise<void>;
  onImportBOQ?: (importedItems: Partial<BOQItem>[]) => Promise<void>;
  activeRole: UserRole;
}

export default function BOQTracker({
  boqItems,
  project,
  onUpdateClaimQty,
  onImportBOQ,
  activeRole
}: BOQTrackerProps) {
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter items for active project
  const projectItems = boqItems.filter(b => b.projectId === project?.id);

  const canEditClaims = activeRole === "Admin" || activeRole === "Quantity Surveyor" || activeRole === "Senior Quantity Surveyor";

  const handleStartEdit = (b: BOQItem) => {
    if (!canEditClaims) return;
    setEditingItemId(b.id);
    setEditQty(b.claimedQty.toString());
  };

  const handleSaveClaim = async (id: string) => {
    if (!canEditClaims) return;
    setSubmitting(true);
    try {
      await onUpdateClaimQty(id, Number(editQty), activeRole);
      setEditingItemId(null);
    } catch {
      alert("Failed to record claimed quantities on contract baseline.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: project?.currency || "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleExportExcel = () => {
    if (projectItems.length === 0) {
      alert("No active items to export in this project.");
      return;
    }
    exportBOQToExcel(project?.name || "Project", projectItems);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportBOQ) return;
    try {
      const parsed = await parseBOQExcel(file);
      if (parsed.length === 0) {
        alert("No valid BOQ items (with required header titles) parsed from Excel.");
        return;
      }
      if (confirm(`Do you want to overwrite current project baseline with ${parsed.length} items parsed from Excel file?`)) {
        await onImportBOQ(parsed);
        alert("BOQ schedule successfully updated from Excel template.");
      }
    } catch (err) {
      alert("Failed to parse the uploaded Excel file. Ensure headers match template format.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-tight font-mono">Bill Of Quantities (BOQ) Consumption Tracker</h2>
          <p className="text-xs text-slate-400">Guard against client overclaiming with active budget depletion bars & overrun warnings.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onImportBOQ && canEditClaims && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .xls" 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:border-cyan-500/20 transition-all font-mono"
              >
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                Import Excel
              </button>
            </>
          )}

          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:border-cyan-500/20 transition-all font-mono"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Excel
          </button>

          <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 p-2 rounded-lg font-mono">
            QS Claim Status: {canEditClaims ? "🟢 ACTIVE" : "🔒 LOCKED"}
          </div>
        </div>
      </div>

      {/* Main BOQ lines list */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="min-w-0 overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-500 font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Bill Ref</th>
                <th className="p-3.5 max-w-[320px]">Description & Specs</th>
                <th className="p-3.5">Unit</th>
                <th className="p-3.5 text-right">Original Tender Qty</th>
                <th className="p-3.5 text-right">Rate</th>
                <th className="p-3.5 text-right">Tender Total</th>
                <th className="p-3.5 text-center">Current Progress Claim %</th>
                <th className="p-3.5 text-right">Remaining Balance</th>
                <th className="p-3.5 text-center">Valuation Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {projectItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-500 text-xs">
                    No active BOQ contract records found in the database. Create a project to populate default templates.
                  </td>
                </tr>
              ) : (
                projectItems.map((b) => {
                  const percentUsed = b.originalQty > 0 ? (b.claimedQty / b.originalQty) * 100 : 0;
                  const hasOverrun = b.remainingQty < 0;
                  const isEditing = editingItemId === b.id;

                  return (
                    <tr 
                      key={b.id} 
                      className={`hover:bg-slate-900/20 transition-colors ${
                        hasOverrun ? "bg-red-500/5 hover:bg-red-500/10" : ""
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-slate-300">{b.billRef}</td>
                      <td className="p-3 max-w-[320px] truncate-2-lines leading-snug font-medium text-slate-300">
                        {b.description}
                      </td>
                      <td className="p-3 uppercase font-semibold text-[11px] text-slate-500 text-center">{b.unit}</td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-400">{b.originalQty.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-400">{formatCurrency(b.rate)}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-200">{formatCurrency(b.totalAmount)}</td>
                      
                      {/* Percent utilized progress bar */}
                      <td className="p-3">
                        <div className="space-y-1 mx-auto max-w-[150px]">
                          <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                            <span className={hasOverrun ? "text-rose-400 font-bold" : "text-slate-400"}>
                              {percentUsed.toFixed(1)}% Used
                            </span>
                            <span className="text-slate-500 font-medium">({b.claimedQty.toLocaleString()} claimed)</span>
                          </div>
                          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                hasOverrun 
                                  ? "bg-red-500" 
                                  : percentUsed > 90 
                                    ? "bg-amber-500 animate-pulse" 
                                    : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, percentUsed)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Remaining balances alerts */}
                      <td className="p-3 text-right font-mono font-bold">
                        {hasOverrun ? (
                          <div className="text-red-400 text-xs flex flex-col items-end">
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Over-Claim
                            </span>
                            <span className="text-[10px] font-mono font-bold mt-0.5">
                              {Math.abs(b.remainingQty).toLocaleString()} {b.unit} over budget
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-semibold">
                            {b.remainingQty.toLocaleString()} {b.unit}
                          </span>
                        )}
                      </td>

                      {/* Edit Claim Column */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 justify-center">
                            <input
                              type="number"
                              value={editQty}
                              onChange={(e) => setEditQty(e.target.value)}
                              className="w-18 bg-slate-950 border border-slate-700 text-slate-200 text-xs text-center rounded focus:border-cyan-500 p-0.5 font-mono outline-none"
                              min="0"
                            />
                            <button
                              onClick={() => handleSaveClaim(b.id)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                              title="Commit claim"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(b)}
                            disabled={!canEditClaims}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                              canEditClaims 
                                ? "bg-slate-800 hover:border-cyan-500/30 text-cyan-400 border-slate-700 cursor-pointer" 
                                : "bg-slate-95% text-slate-600 border-slate-900 cursor-not-allowed"
                            }`}
                          >
                            Update
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
