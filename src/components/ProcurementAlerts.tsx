import React, { useState } from "react";
import { ShoppingBag, ShoppingCart, CheckCircle, RefreshCw, AlertCircle, Plus, Sparkles, Filter, ShieldAlert } from "lucide-react";
import { ProcurementAlert, QSProject, UserRole } from "../types";

interface ProcurementAlertsProps {
  procurement: ProcurementAlert[];
  project: QSProject;
  onAddProcurement: (alert: any) => Promise<void>;
  onChangeStatus: (id: string, status: string, userName: string) => Promise<void>;
  activeRole: UserRole;
}

export default function ProcurementAlerts({
  procurement,
  project,
  onAddProcurement,
  onChangeStatus,
  activeRole
}: ProcurementAlertsProps) {
  
  const [showAdd, setShowAdd] = useState(false);
  const [materialName, setMaterialName] = useState("");
  const [requiredQty, setRequiredQty] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("High");
  const [unit, setUnit] = useState("bags");
  const [boqItemRef, setBoqItemRef] = useState("");

  const projectProc = procurement.filter(p => p.projectId === project?.id);

  const isProcurementEngineer = activeRole === "Admin" || activeRole === "Procurement Engineer" || activeRole === "Senior Quantity Surveyor";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName || !requiredQty || !currentStock) {
      alert("Missing required fields.");
      return;
    }

    await onAddProcurement({
      projectId: project.id,
      materialName,
      requiredQty: Number(requiredQty),
      currentStock: Number(currentStock),
      priority,
      unit,
      boqItemRef
    });

    setMaterialName("");
    setRequiredQty("");
    setCurrentStock("");
    setBoqItemRef("");
    setShowAdd(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!isProcurementEngineer) return;
    await onChangeStatus(id, status, activeRole);
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "High": return "bg-red-500/10 text-rose-400 border-red-500/20";
      case "Medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Low": return "bg-slate-800 text-slate-400 border-slate-700/60";
      default: return "bg-slate-700 text-slate-300";
    }
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case "Delivered": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Ordered": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "In Procurement": return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "Pending Order": return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default: return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Prime Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-200 font-mono tracking-tight uppercase">Procurement shortfalls & supply chain alarms</h2>
          <p className="text-xs text-slate-400">Reconcile current material stock balances against contract BOQ design parameters.</p>
        </div>
        {isProcurementEngineer ? (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Log Material Tracker
          </button>
        ) : (
          <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Procurement Engineer role required
          </span>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 animate-fadeIn">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Register New Procurement Tracking Block</h3>
            <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-slate-400 hover:text-slate-200">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Material Name</label>
              <input
                type="text"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="e.g. Portland Cement Grade 42.5"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 text-xs rounded focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Unit Typology</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 text-xs rounded focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="bags">bags</option>
                <option value="ton">ton</option>
                <option value="m2">m2</option>
                <option value="m3">m3</option>
                <option value="liters">liters</option>
                <option value="items">items</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Associated BOQ Item code</label>
              <input
                type="text"
                value={boqItemRef}
                onChange={(e) => setBoqItemRef(e.target.value)}
                placeholder="e.g. D.01.1"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 text-xs rounded focus:border-blue-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Design Required Qty</label>
              <input
                type="number"
                value={requiredQty}
                onChange={(e) => setRequiredQty(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 text-xs rounded focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Present on-site stock</label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                placeholder="e.g. 1200"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 text-xs rounded focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Impact Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 text-xs rounded focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="High">🔴 High Priority (Concrete pouring blockage)</option>
                <option value="Medium">🟡 Medium Priority (Finishes / marble)</option>
                <option value="Low">⚪ Low Priority (Safety / equipment)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-505 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Save Tracker Block
            </button>
          </div>
        </form>
      )}

      {/* Grid of Procurement Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectProc.map((p) => {
          const shortageDiff = Math.max(0, p.requiredQty - p.currentStock);
          const coveragePercent = p.requiredQty > 0 ? (p.currentStock / p.requiredQty) * 100 : 0;

          return (
            <div key={p.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold border px-2 py-0.5 rounded uppercase ${getPriorityColor(p.priority)}`}>
                      {p.priority} Priority
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">Bill Ref: {p.boqItemRef || "NEW"}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-100 text-sm mt-2 leading-snug truncate">{p.materialName}</h3>
                </div>

                <div className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(p.status)}`}>
                  {p.status}
                </div>
              </div>

              {/* Progress bars of present stock */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Stock Coverage: {coveragePercent.toFixed(1)}%</span>
                  <span className="font-mono">{p.currentStock} / {p.requiredQty} {p.unit}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${coveragePercent < 30 ? "bg-red-500" : coveragePercent < 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(100, coveragePercent)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/60 font-mono text-center text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Shortage</span>
                  <span className={`font-bold mt-1.5 block ${shortageDiff > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {shortageDiff > 0 ? `-${shortageDiff}` : "Fully Spared"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Recommended reorder</span>
                  <span className="font-bold text-slate-300 mt-1.5 block">
                    {p.recommendedOrderQty} {p.unit}
                  </span>
                </div>
                <div className="bg-slate-950/20 border border-slate-800/40 rounded py-1">
                  <span className="text-[8px] font-bold text-slate-500 uppercase block">Present Unit</span>
                  <span className="font-bold text-slate-300 mt-0.5 block">{p.unit}</span>
                </div>
              </div>

              {/* Order Flow Controls (Only available for authorized roles) */}
              {isProcurementEngineer && p.status !== "Delivered" && (
                <div className="flex justify-end gap-1.5 pt-2 flex-wrap">
                  {p.status === "Pending Order" && (
                    <button
                      onClick={() => handleUpdateStatus(p.id, "In Procurement")}
                      className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded border border-slate-700 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3 text-purple-400 animate-spin" /> Initiate Procurement
                    </button>
                  )}
                  {(p.status === "Pending Order" || p.status === "In Procurement") && (
                    <button
                      onClick={() => handleUpdateStatus(p.id, "Ordered")}
                      className="cursor-pointer bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 text-[10px] font-bold px-2.5 py-1.5 rounded border border-cyan-500/20 flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Mark as Ordered
                    </button>
                  )}
                  {p.status === "Ordered" && (
                    <button
                      onClick={() => handleUpdateStatus(p.id, "Delivered")}
                      className="cursor-pointer bg-gradient-to-r from-emerald-600 to-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Acknowledge Delivery on Site
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
