import React, { useState } from "react";
import { Plus, Briefcase, Calendar, Building2, Coins, ArrowRight, UserCheck, AlertCircle } from "lucide-react";
import { QSProject, UserRole } from "../types";

interface ProjectModuleProps {
  projects: QSProject[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  onAddProject: (project: any) => Promise<void>;
  activeRole: UserRole;
}

export default function ProjectModule({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  onAddProject,
  activeRole
}: ProjectModuleProps) {
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [client, setClient] = useState("");
  const [consultant, setConsultant] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [startDate, setStartDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [status, setStatus] = useState<"Active" | "Draft">("Active");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedProj = projects.find(p => p.id === selectedProjectId) || projects[0];

  const canCreateProject = activeRole === "Admin" || activeRole === "Senior Quantity Surveyor";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contractNumber || !client || !consultant || !contractValue) {
      setErrorMsg("Please fill in all contract-required metrics.");
      return;
    }

    try {
      setErrorMsg("");
      await onAddProject({
        name,
        contractNumber,
        client,
        consultant,
        contractValue: Number(contractValue),
        currency,
        startDate: startDate || new Date().toISOString().split("T")[0],
        completionDate: completionDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0],
        status
      });

      // Reset form
      setName("");
      setContractNumber("");
      setClient("");
      setConsultant("");
      setContractValue("");
      setStartDate("");
      setCompletionDate("");
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg("Failed to initialize project on the commercial database.");
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Active": return "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
      case "Completed": return "bg-blue-50 text-blue-700 border-blue-200 font-bold";
      case "Delayed": return "bg-rose-50 text-rose-705 text-rose-700 border-rose-200 font-bold";
      case "Draft": return "bg-slate-50 text-slate-700 border-slate-200 font-bold";
      default: return "bg-slate-100 text-slate-700 border-slate-200 font-bold";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title */}
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200 shadow-sm rounded-xl">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Engineering Projects Directory</h2>
          <p className="text-xs text-slate-500">Add, track, and load active commercial surveying workspace scopes.</p>
        </div>
        {canCreateProject ? (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Initialize Project
          </button>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Admin/SQS rights required to add
          </span>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-lg animate-fadeIn space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Initialize Contract Baseline Model</h3>
            <button 
              onClick={() => setShowAddForm(false)} 
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-semibold"
            >
              Cancel
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-750 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-wide mb-1">Project Layout Name</label>
              <input
                type="text"
                placeholder="e.g. Al Thumama Commercial Hub Phase 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-md p-2 text-xs focus:border-blue-500 focus:bg-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-wide mb-1">Contract Tender Number</label>
              <input
                type="text"
                placeholder="e.g. AT-CP-2026-09"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-md p-2 text-xs focus:border-blue-500 focus:bg-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-wide mb-1">Client Authority name</label>
              <input
                type="text"
                placeholder="e.g. National Infrastructure Authority"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-md p-2 text-xs focus:border-blue-500 focus:bg-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-wide mb-1">Appointed Consultant</label>
              <input
                type="text"
                placeholder="e.g. Triumph Design Partners"
                value={consultant}
                onChange={(e) => setConsultant(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-md p-2 text-xs focus:border-blue-500 focus:bg-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-wide mb-1">Tender Value (Numeric Amount)</label>
              <input
                type="number"
                placeholder="e.g. 48500000"
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-805 text-slate-800 rounded-md p-2 text-xs focus:border-blue-500 focus:bg-white outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-wide mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-md p-2 text-xs focus:border-blue-500 focus:bg-white outline-none transition-colors"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AED">AED (Dh)</option>
                  <option value="QAR">QAR (QR)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-wide mb-1">Draft State</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-md p-2 text-xs focus:border-blue-500 focus:bg-white outline-none transition-colors"
                >
                  <option value="Active">Active Module</option>
                  <option value="Draft">Draft Template</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-wide mb-1">Work Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-md p-2 text-xs focus:border-blue-500 focus:bg-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 uppercase font-bold tracking-wide mb-1">Contract Final Completion Date</label>
              <input
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-805 text-slate-800 rounded-md p-2 text-xs focus:border-blue-500 focus:bg-white outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2 pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Settle & Persist Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => {
          const isSelected = p.id === selectedProjectId;
          return (
            <div 
              key={p.id}
              className={`p-5 rounded-xl border transition-all relative ${
                isSelected 
                  ? "bg-white border-2 border-blue-600 shadow-md shadow-blue-500/5 rgb-glow" 
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Active workspace
                </span>
              )}

              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono leading-none">REF: {p.contractNumber}</span>
                </div>
              </div>

              {/* Specs & schedule */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Value</span>
                  <span className="font-bold text-slate-900 font-mono uppercase">
                    {p.currency} {p.contractValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Principal Client</span>
                  <span className="text-slate-800 truncate max-w-[160px] text-right font-medium">{p.client}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Schedule</span>
                  <span className="text-slate-705 text-slate-700 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {p.startDate} to {p.completionDate}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 uppercase ${getStatusBadge(p.status)}`}>
                    {p.status}
                  </span>
                </div>
              </div>

              {/* Set Workspace Link */}
              {!isSelected && (
                <button
                  onClick={() => setSelectedProjectId(p.id)}
                  className="w-full text-center text-xs text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-all font-bold border border-slate-200 bg-slate-50 rounded-lg py-2 mt-4 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Enter Commercial Project Workspace <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
