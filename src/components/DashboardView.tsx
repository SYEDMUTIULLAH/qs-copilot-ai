import React from "react";
import { 
  TrendingUp, 
  AlertTriangle, 
  Coins, 
  GitCompare, 
  Clock, 
  ArrowUpRight, 
  Building2, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { 
  BOQItem, 
  Variation, 
  ProcurementAlert, 
  VPRecord, 
  RiskLog, 
  AuditLog, 
  QSProject,
  UserRole
} from "../types";

interface DashboardViewProps {
  project: QSProject;
  boqItems: BOQItem[];
  variations: Variation[];
  procurement: ProcurementAlert[];
  vps: VPRecord[];
  risks: RiskLog[];
  audits: AuditLog[];
  onNavigate: (tab: string) => void;
  activeRole: UserRole;
}

export default function DashboardView({
  project,
  boqItems,
  variations,
  procurement,
  vps,
  risks,
  audits,
  onNavigate,
  activeRole
}: DashboardViewProps) {
  
  // Calculations based on currently selected project
  const currency = project?.currency || "USD";
  const projectBoq = boqItems.filter(b => b.projectId === project?.id);
  const projectVPs = vps.filter(v => v.projectId === project?.id);
  const projectVariations = variations.filter(v => v.projectId === project?.id);
  const projectProcurement = procurement.filter(p => p.projectId === project?.id);
  const projectRisks = risks.filter(r => r.projectId === project?.id);

  // 1. Contract Value
  const contractValue = project?.contractValue || 0;

  // 2. Total Variation Values (Approved vs Pending)
  const approvedVariationsVal = projectVariations
    .filter(v => v.status === "SqsApproved" || v.status === "ClientApproved")
    .reduce((sum, v) => sum + v.variationValue, 0);

  const pendingVariationsVal = projectVariations
    .filter(v => v.status === "Pending")
    .reduce((sum, v) => sum + v.variationValue, 0);

  // 3. Claims Statistics
  const totalClaimedAmount = projectVPs.reduce((sum, v) => sum + v.claimAmount, 0);
  const totalApprovedAmount = projectVPs.reduce((sum, v) => sum + v.approvedAmount, 0);

  // 4. BOQ Utilization rate
  const totalBOQAmount = projectBoq.reduce((sum, b) => sum + b.totalAmount, 0);
  const consumedBOQAmount = projectBoq.reduce((sum, b) => sum + (b.claimedQty * b.rate), 0);
  const boqUtilPercent = totalBOQAmount > 0 ? (consumedBOQAmount / totalBOQAmount) * 100 : 0;

  // 5. Critical procurement shortages quantity
  const highShortageCount = projectProcurement.filter(p => p.priority === "High" && p.status !== "Delivered").length;

  // Chart Data: Valuation Claim Performance
  const chartData = projectVPs
    .slice()
    .reverse() // Chronological order
    .map(vp => ({
      name: `VP-${vp.vpNumber}`,
      Claimed: vp.claimAmount,
      Approved: vp.approvedAmount,
      Rejected: vp.rejectedAmount
    }));

  // Chart Data: BOQ items claim status
  const boqChartData = projectBoq.slice(0, 5).map(b => ({
    name: b.billRef,
    Original: b.originalQty * b.rate,
    Claimed: b.claimedQty * b.rate
  }));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Prime Header Dashboard Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-6 rounded-xl border border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              {project?.status || "Active"} Workspace
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {project?.id}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1.5">{project?.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tender Ref: <span className="font-mono text-slate-300">{project?.contractNumber}</span> | Consultant: <span className="text-slate-300 font-medium">{project?.consultant}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate("chat")}
            className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/10 transition-all font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Consultant Brain
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Contract Baseline */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Baseline Value</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><Building2 className="w-4 h-4" /></span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(contractValue)}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
              <span>Client: {project?.client}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Variations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Claims & Variations</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <GitCompare className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(approvedVariationsVal)}
            </span>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
              <span className="text-rose-600 font-bold">Pending: {formatCurrency(pendingVariationsVal)}</span>
              <span>Count: {projectVariations.length}</span>
            </div>
          </div>
        </div>

        {/* Card 3: BOQ Utilization */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BOQ Utilization</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {boqUtilPercent.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ({formatCurrency(consumedBOQAmount)})
              </span>
            </div>
            {/* Minimal Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-550 ${boqUtilPercent > 90 ? "bg-red-500" : "bg-blue-600"}`}
                style={{ width: `${Math.min(100, boqUtilPercent)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 4: Certified VP Cashflow */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certified Valuation Recs</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalApprovedAmount)}
            </span>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
              <span className="text-blue-600 font-bold">Loss/Reject difference: {formatCurrency(totalClaimedAmount - totalApprovedAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Modules Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Valuation Certificates History */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Interim Valuations Audit Performance (Claim vs Approved)</h3>
              <p className="text-xs text-slate-500 font-medium">Reconciling certified amounts, rejections, and financial outstanding limits.</p>
            </div>
            <button 
              onClick={() => onNavigate("vp-history")}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              VP Engine <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-68 w-full mt-2 text-xs">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                No Valuation claims found for this project yet. Submit a new VP to begin.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v/1000}k`} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    itemStyle={{ fontSize: 12 }}
                    labelStyle={{ color: "#334155", fontWeight: "bold" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="Claimed" fill="#2563eb" radius={[4, 4, 0, 0]} name="Claimed Amount" />
                  <Bar dataKey="Approved" fill="#10b981" radius={[4, 4, 0, 0]} name="Consultant Approved" />
                  <Bar dataKey="Rejected" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Rejected Amount" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Procurement Shortages & High Priorities Side Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Pending Procurement Alarms</h3>
              <p className="text-xs text-slate-500">Materials stock status vs contract requirements.</p>
            </div>
            <button 
              onClick={() => onNavigate("procurement")}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              All Stocks <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-68 pr-1">
            {projectProcurement.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs py-12">
                No active procurement shortages. All clear.
              </div>
            ) : (
              projectProcurement.map((p) => (
                <div 
                  key={p.id}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2.5 justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{p.materialName}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      BOQ Item: {p.boqItemRef || "N/A"} | Needed: {p.requiredQty} {p.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        p.priority === "High" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {p.priority} Priority
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">Stock: {p.currentStock} {p.unit}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end shrink-0 justify-between h-full">
                    {p.shortage > 0 ? (
                      <span className="text-xs text-rose-600 font-bold font-mono">-{p.shortage} deficit</span>
                    ) : (
                      <span className="text-xs text-emerald-600 font-bold font-mono">Covered</span>
                    )}
                    <span className="text-[10px] text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded mt-3 text-[9px] font-bold leading-none">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Risks of Active Projects & Quick Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Commercial Risks Logger */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-850 text-slate-800">Active Commercial Risks Log</h3>
              <p className="text-xs text-slate-500">Unapproved overrun limits, missing contract rates, or pending Client signoffs.</p>
            </div>
            <span className="bg-red-50 text-red-750 border border-red-200/40 px-2 py-0.5 rounded text-[10px] font-bold">
              {projectRisks.length} Identified Risks
            </span>
          </div>

          <div className="space-y-2.5">
            {projectRisks.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No critical commercial risks recorded on budget trackers.
              </div>
            ) : (
              projectRisks.map((risk) => (
                <div 
                  key={risk.id}
                  className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                    risk.severity === "High" 
                      ? "bg-red-50 border-red-100 text-red-800"
                      : "bg-amber-50 border-amber-100 text-amber-800"
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                    risk.severity === "High" ? "text-red-500 animate-pulse" : "text-amber-600"
                  }`} />
                  <div className="flex-1 text-slate-800">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900">{risk.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{risk.identifiedDate}</span>
                    </div>
                    <p className="text-xs text-slate-650 text-slate-600 font-medium mt-1 leading-relaxed">{risk.description}</p>
                    {risk.resolution && (
                      <p className="text-xs text-slate-500 font-mono mt-2 pt-1 border-t border-slate-200/60">
                        Resolution path: {risk.resolution}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Recent Audit Activity log (Admin view gets richer details) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Commercial Changes</h3>
              <p className="text-xs text-slate-500 font-medium">Live audits and survey task activities.</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-68 pr-1 text-slate-705 text-slate-700">
            {audits.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No recent workspace modifications logged.
              </div>
            ) : (
              audits.slice(0, 5).map((log) => (
                <div key={log.id} className="relative pl-5 border-l border-slate-200 text-xs">
                  {/* Glowing vertical point */}
                  <span className="absolute left-[-5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 border border-white shadow-sm shadow-blue-500/20"></span>
                  
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>{log.userName} ({log.userRole})</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="font-bold text-slate-800 mt-0.5">{log.action}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate pr-2">{log.details}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-200">
            <button 
              onClick={() => onNavigate("admin")}
              className="w-full text-center text-xs text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1.5 font-bold py-1.5 border border-slate-200 bg-slate-50 rounded-md cursor-pointer hover:bg-slate-100"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Open General Audit Trail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
