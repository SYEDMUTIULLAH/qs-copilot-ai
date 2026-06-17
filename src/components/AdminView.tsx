import React from "react";
import { ShieldCheck, Calendar, Info, ShieldAlert, Lock, Terminal, Activity } from "lucide-react";
import { AuditLog, UserRole } from "../types";

interface AdminViewProps {
  audits: AuditLog[];
  activeRole: UserRole;
  onNavigate: (tab: string) => void;
}

export default function AdminView({
  audits,
  activeRole,
  onNavigate
}: AdminViewProps) {
  
  // RBAC Access Restriction
  const hasAccess = activeRole === "Admin" || activeRole === "Senior Quantity Surveyor";

  if (!hasAccess) {
    return (
      <div className="h-[calc(100vh-180px)] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 animate-fadeIn">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-rose-400">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-md font-bold text-slate-200">Access Restricted (RBAC Protection)</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          The Admin auditing module requires Admin or Senior Quantity Surveyor credentials. Your current role is set to <strong>{activeRole}</strong>.
        </p>
        <div className="pt-2">
          <p className="text-[10px] text-slate-500 font-mono">
            *To bypass, use the live role selector in the lower left corner of the sidebar panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Prime Header Block */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-tight">Active Audit logs & system diagnostics</h2>
          <p className="text-xs text-slate-400">Complete immutable record of all changes, valuations, and variation modifications.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Terminal className="w-4 h-4 text-cyan-400" /> Active Operator: {activeRole}
        </div>
      </div>

      {/* Audit Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-lg">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 block">Total Audited Events</span>
            <span className="text-lg font-bold text-slate-100 font-mono mt-0.5">{audits.length}</span>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 block">RBAC Protection level</span>
            <span className="text-xs text-slate-300 font-bold mt-1 block">Active (FIDIC Class)</span>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/15 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 block">Current Ledger Date</span>
            <span className="text-xs text-slate-300 font-bold mt-1 block">June 17, 2026 (Active)</span>
          </div>
        </div>
      </div>

      {/* Interactive Logs Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Workspace Event Ledger</h3>
        </div>

        <div className="divide-y divide-slate-800 text-xs text-slate-300 max-h-125 overflow-y-auto">
          {audits.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-950/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="font-bold text-cyan-400">{log.userName}</span>
                  <span className="text-slate-500">({log.userRole})</span>
                  <span className="text-[10px] bg-slate-850 px-1.5 py-0.2 rounded font-mono text-slate-500 uppercase">
                    ID: {log.id.slice(-6)}
                  </span>
                </div>
                <p className="font-bold text-slate-100">{log.action}</p>
                <p className="text-slate-400 font-medium">{log.details}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
