import React, { useState } from "react";
import { FileSpreadsheet, Download, Printer, FileText, CheckCircle2, Coins, GitCompare, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { BOQItem, Variation, ProcurementAlert, VPRecord, RiskLog, QSProject } from "../types";

interface CommercialReportsProps {
  project: QSProject;
  boqItems: BOQItem[];
  variations: Variation[];
  procurement: ProcurementAlert[];
  vps: VPRecord[];
  risks: RiskLog[];
}

export default function CommercialReports({
  project,
  boqItems,
  variations,
  procurement,
  vps,
  risks
}: CommercialReportsProps) {
  
  const [activeReport, setActiveReport] = useState<"variation" | "cost" | "boq_balance" | "procurement">("cost");

  // Project-specific datasets
  const pBoq = boqItems.filter(b => b.projectId === project?.id);
  const pVos = variations.filter(v => v.projectId === project?.id);
  const pProc = procurement.filter(p => p.projectId === project?.id);
  const pVps = vps.filter(v => v.projectId === project?.id);
  const pRisks = risks.filter(r => r.projectId === project?.id);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: project?.currency || "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const approvedVOsValue = pVos
    .filter(v => v.status === "SqsApproved" || v.status === "ClientApproved")
    .reduce((sum, v) => sum + v.variationValue, 0);

  const pendingVOsValue = pVos
    .filter(v => v.status === "Pending")
    .reduce((sum, v) => sum + v.variationValue, 0);

  // Download Mock CSV files
  const triggerCSVExport = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCostImpactCSV = () => {
    let csv = "Report,Commercial Cost Impact Report\n";
    csv += `Project Name,${project.name}\n`;
    csv += `Contract Number,${project.contractNumber}\n`;
    csv += `Base Tender Value,${project.contractValue}\n`;
    csv += `Approved Variations Value,${approvedVOsValue}\n`;
    csv += `Pending Variations Value,${pendingVOsValue}\n\n`;
    csv += "Metrics,Value,Status\n";
    csv += `Certified Valuation,${pVps.reduce((sum, v) => sum + v.approvedAmount, 0)},Active\n`;
    csv += `Identified High Risks Count,${pRisks.filter(r => r.severity === "High").length},Critical\n`;

    triggerCSVExport(`${project.id}_cost_impact_report.csv`, csv);
  };

  return (
    <div className="space-y-6">
      
      {/* Prime Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-200 font-mono tracking-tight uppercase">Executive commercial statements & reports</h2>
          <p className="text-xs text-slate-400">Generate executive-ready Variation summarization decks, budget balances, and risk assessments.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="cursor-pointer bg-slate-800 hover:bg-slate-700 hover:text-slate-100 text-slate-300 font-bold text-xs p-2.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print PDF Report
          </button>
          <button
            onClick={handleExportCostImpactCSV}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-xs text-white p-2.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-500/10"
          >
            <Download className="w-4 h-4" /> Export CSV dataset
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800/80 gap-4 overflow-x-auto text-xs pb-1">
        {[
          { id: "cost", label: "Cost Impact Report", icon: TrendingUp },
          { id: "variation", label: "Variation Summary", icon: GitCompare },
          { id: "boq_balance", label: "BOQ Contract Balance", icon: Coins },
          { id: "procurement", label: "Materials Supply Report", icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`pb-3 px-1 font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                active 
                  ? "border-cyan-400 text-cyan-400" 
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content layout based on activeReport */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-6">
        
        {activeReport === "cost" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Overall project commercial model summary</h3>
              <p className="text-xs text-slate-500">Consolidating Baseline tender, change-order values, certified payments, and current margins.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 font-mono text-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Original tender package value</span>
                <span className="text-xl font-bold text-slate-100 block mt-1.5">{formatCurrency(project.contractValue)}</span>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 font-mono text-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Approved design variation additions</span>
                <span className="text-xl font-bold text-emerald-400 block mt-1.5">+{formatCurrency(approvedVOsValue)}</span>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 font-mono text-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Forecasted commercial margin value</span>
                <span className="text-xl font-bold text-cyan-400 block mt-1.5">{formatCurrency(project.contractValue + approvedVOsValue)}</span>
              </div>
            </div>

            {/* Reconciliation table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Detailed commercial perform index</h4>
              <div className="border border-slate-800 rounded-lg text-xs font-medium">
                <div className="grid grid-cols-3 p-3 bg-slate-950/50 uppercase text-[9px] text-slate-500 font-extrabold border-b border-slate-800">
                  <span>Audit metric</span>
                  <span className="text-right">Baseline Amount</span>
                  <span className="text-right">Settle Percentage</span>
                </div>
                <div className="divide-y divide-slate-800">
                  <div className="grid grid-cols-3 p-3 text-slate-300">
                    <span>Base Contract Sum</span>
                    <span className="text-right font-mono text-slate-400">{formatCurrency(project.contractValue)}</span>
                    <span className="text-right font-mono">100.0%</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 text-slate-300">
                    <span>Signed Change Orders</span>
                    <span className="text-right font-mono text-emerald-400">+{formatCurrency(approvedVOsValue)}</span>
                    <span className="text-right font-mono text-emerald-400">+{((approvedVOsValue / project.contractValue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 text-slate-300">
                    <span>Outstanding Claims</span>
                    <span className="text-right font-mono text-amber-500">+{formatCurrency(pendingVOsValue)}</span>
                    <span className="text-right font-mono text-amber-500">+{((pendingVOsValue / project.contractValue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 text-slate-300 bg-slate-950/20">
                    <span>Client Interim Valuations Certified</span>
                    <span className="text-right font-mono text-cyan-400">{formatCurrency(pVps.reduce((sum, v) => sum + v.approvedAmount, 0))}</span>
                    <span className="text-right font-mono text-cyan-400">
                      {((pVps.reduce((sum, v) => sum + v.approvedAmount, 0) / (project.contractValue + approvedVOsValue)) * 100).toFixed(1)}% of margin
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Risk summaries */}
            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-200">Pending change order liabilities alert</p>
                <p className="text-slate-400">
                  There are currently **{pRisks.length} unapproved items** representing potential overclaim risks on site. We advise immediate certification of VO-03 Statuario marble rate values before materials are completely tiled.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeReport === "variation" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Change order variation logs summary</h3>
              <p className="text-xs text-slate-500">Detailed list of all draft scope modifications, addition values, and client certified checks.</p>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden text-xs font-semibold">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 uppercase text-[9px] text-slate-550 font-bold tracking-wider">
                  <tr className="border-b border-slate-800">
                    <th className="p-3">Ref Code</th>
                    <th className="p-3">Variation Title</th>
                    <th className="p-3">Justification Summary</th>
                    <th className="p-3 text-right">Estimate Cost</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {pVos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-500 text-xs">No variations initialized.</td>
                    </tr>
                  ) : (
                    pVos.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-900/20">
                        <td className="p-3 font-mono font-bold text-slate-400">{v.refNumber}</td>
                        <td className="p-3 font-bold text-slate-200">{v.title}</td>
                        <td className="p-3 text-slate-400 font-medium max-w-[320px] truncate">{v.claimSummary}</td>
                        <td className="p-3 text-right font-mono font-bold text-cyan-400">{formatCurrency(v.variationValue)}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded uppercase ${
                            v.status === "ClientApproved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" :
                            v.status === "SqsApproved" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/25" :
                            "bg-yellow-500/10 text-yellow-500 border-yellow-500/25"
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === "boq_balance" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">BOQ contract item depletion summary</h3>
              <p className="text-xs text-slate-500">Monitoring overclaims and remaining budgets for core structural elements.</p>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 uppercase text-[9px] text-slate-500 font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Bill Ref</th>
                    <th className="p-3">Material Scope</th>
                    <th className="p-3 text-right">Tender Quantity</th>
                    <th className="p-3 text-right">Claimed Quantity</th>
                    <th className="p-3 text-right">Remaining Quantity</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Current Claim Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {pBoq.map((b) => {
                    const hasOverrun = b.remainingQty < 0;
                    return (
                      <tr key={b.id} className={hasOverrun ? "bg-red-500/5" : ""}>
                        <td className="p-3 font-mono font-bold text-slate-300">{b.billRef}</td>
                        <td className="p-3 truncate max-w-[220px] font-medium text-slate-300">{b.description}</td>
                        <td className="p-3 text-right font-mono text-slate-400">{b.originalQty.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-slate-200">{b.claimedQty.toLocaleString()}</td>
                        <td className={`p-3 text-right font-mono font-bold ${hasOverrun ? "text-rose-400" : "text-emerald-400"}`}>
                          {b.remainingQty.toLocaleString()} {b.unit}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-400">{formatCurrency(b.rate)}</td>
                        <td className="p-3 text-right font-mono font-extrabold text-slate-100">{formatCurrency(b.claimedQty * b.rate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === "procurement" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Materials deficit alerts summary</h3>
              <p className="text-xs text-slate-500">Active reorder recommendations and stock coverage status across site structures.</p>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 uppercase text-[9px] text-slate-500 font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Material Designation</th>
                    <th className="p-3 text-right">Required Quantity</th>
                    <th className="p-3 text-right">Present Site Stock</th>
                    <th className="p-3 text-right">Stock Gap Deficit</th>
                    <th className="p-3 text-right font-bold">Priority</th>
                    <th className="p-3 text-center">Fulfillment State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {pProc.map((p) => {
                    const shortage = Math.max(0, p.requiredQty - p.currentStock);
                    return (
                      <tr key={p.id} className="hover:bg-slate-900/20">
                        <td className="p-3 font-bold text-slate-200">{p.materialName}</td>
                        <td className="p-3 text-right font-mono text-slate-400">{p.requiredQty} {p.unit}</td>
                        <td className="p-3 text-right font-mono text-slate-400">{p.currentStock} {p.unit}</td>
                        <td className={`p-3 text-right font-mono font-bold ${shortage > 0 ? "text-rose-450 text-rose-400" : "text-emerald-400"}`}>
                          {shortage > 0 ? `-${shortage}` : "Fully Covered"}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-300">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            p.priority === "High" ? "bg-red-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"
                          }`}>
                            {p.priority}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
