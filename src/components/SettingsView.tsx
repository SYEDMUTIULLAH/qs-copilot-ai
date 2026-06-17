import React from "react";
import { Settings, RefreshCw, Sparkles, Sliders, AlertCircle, Coins, Heart, CheckCircle2 } from "lucide-react";
import { UserRole } from "../types";

interface SettingsViewProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onFlushDB: () => Promise<void>;
}

export default function SettingsView({
  activeRole,
  setActiveRole,
  onFlushDB
}: SettingsViewProps) {
  
  const handleReset = async () => {
    if (confirm("Are you sure you want to restore the entire Quantity Survey database to seed parameters? All dynamic claims will be reset.")) {
      await onFlushDB();
      alert("Database wiped & default Tender models restored.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-tight leading-none">Copilot preferences & specifications</h2>
        <p className="text-xs text-slate-400 mt-2">Personalize active roles, modify localized surveying currencies, and reset databases.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Preferences */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4.5 h-4.5 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Active Workspace Identity</h3>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Switching identity adjusts accessible buttons and lists in accordance with commercial role permissions (RBAC). 
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Select Active Surveyor Role</label>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded p-2 text-xs focus:border-blue-500 cursor-pointer text-cyan-400 font-bold"
              >
                <option value="Admin">Admin</option>
                <option value="Senior Quantity Surveyor">Senior Quantity Surveyor</option>
                <option value="Quantity Surveyor">Quantity Surveyor</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Procurement Engineer">Procurement Engineer</option>
                <option value="Planning Engineer">Planning Engineer</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-lg text-slate-500 text-[11px] font-medium leading-relaxed">
              - **Admin / Senior QS**: Full access to certify monthly claims (VP) and approve draft variations.
              <br />
              - **Quantity Surveyor**: Ability to adjust item consumed/claimed progress values inline.
              <br />
              - **Procurement Eng**: Permission to raise material re-orders.
            </div>
          </div>
        </div>

        {/* Card 2: Database purge */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4.5 h-4.5 text-rose-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-rose-400">Database Administration</h3>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Wipe out any uploaded Excel catalogs, material alterations and valuation certificate histories, restoring the platform back to initial tender seeds.
            </p>

            <div className="p-3 border border-rose-500/10 bg-red-500/5 text-rose-300 rounded-lg text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="font-medium text-[11px]">Warning: Wiping is permanent and cannot be undone inside this warm lifecycle container container node.</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full text-center py-2 border hover:bg-rose-500 hover:text-white transition-all border-rose-500/25 text-rose-400 rounded-lg text-xs font-bold cursor-pointer bg-rose-500/5"
          >
            Settle Database Wipeout & Re-seed
          </button>
        </div>

      </div>

      {/* Footer system details */}
      <div className="bg-slate-900/20 p-4 border border-slate-800/80 rounded-xl text-center text-[10px] text-slate-500 font-mono tracking-tight flex items-center justify-center gap-1.5 flex-wrap">
        <span>QS Copilot AI</span> | <span>Version 4.1.2</span> | <span>Active License: Enterprise Developer</span> | <span>Made with AI Tech Support</span>
      </div>

    </div>
  );
}
