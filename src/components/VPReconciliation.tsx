import React, { useState } from "react";
import { Coins, Plus, CheckCircle, HelpCircle, ArrowUpRight, ShieldCheck, FileSpreadsheet, KeyRound, ListTodo } from "lucide-react";
import { VPRecord, QSProject, UserRole } from "../types";

interface VPReconciliationProps {
  vps: VPRecord[];
  project: QSProject;
  onCreateVP: (claimAmount: number, userName: string) => Promise<void>;
  onCertifyVP: (id: string, approvedAmount: number, role: UserRole, userName: string) => Promise<void>;
  activeRole: UserRole;
}

export default function VPReconciliation({
  vps,
  project,
  onCreateVP,
  onCertifyVP,
  activeRole
}: VPReconciliationProps) {
  
  const [showAdd, setShowAdd] = useState(false);
  const [claimAmount, setClaimAmount] = useState("");
  const [certifyingVpId, setCertifyingVpId] = useState<string | null>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter vps belonging to active project
  const projectVPs = vps.filter(v => v.projectId === project?.id);

  const canCertify = activeRole === "Admin" || activeRole === "Senior Quantity Surveyor" || activeRole === "Project Manager";

  const handleCreateVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimAmount) return;
    await onCreateVP(Number(claimAmount), activeRole);
    setClaimAmount("");
    setShowAdd(false);
  };

  const handleStartCertify = (v: VPRecord) => {
    if (!canCertify) return;
    setCertifyingVpId(v.id);
    setApprovedAmount(v.claimAmount.toString());
  };

  const handleSaveCertification = async (id: string) => {
    if (!canCertify) return;
    setSubmitting(true);
    try {
      await onCertifyVP(id, Number(approvedAmount), activeRole, activeRole);
      setCertifyingVpId(null);
    } catch {
      alert("Failed to certify interim valuation certificate.");
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

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Paid": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
      case "Certified": return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25";
      case "Submitted": return "bg-amber-500/10 text-amber-500 border border-amber-500/25";
      case "Draft": return "bg-slate-500/10 text-slate-400 border border-slate-500/25";
      default: return "bg-slate-800 text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-tight font-mono">Valuation Payment (VP) Reconciliation Table</h2>
          <p className="text-xs text-slate-400">Certify monthly claims, adjust rejections, analyze balances, and maintain comprehensive audit trails.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Submit Interim Claim
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleCreateVP} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 animate-fadeIn max-w-md">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Publish Monthly Progress Claim</h3>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Claim Value (Numeric Amount)</label>
            <input
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              placeholder="e.g. 1450000"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs p-2 rounded focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3.5 py-1.5 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-505 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Publish Claim
            </button>
          </div>
        </form>
      )}

      {/* Main List Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="min-w-0 overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-500 font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">VP Ref No</th>
                <th className="p-3.5">Valuation Submittal Date</th>
                <th className="p-3.5 text-right">Claimed Valuation</th>
                <th className="p-3.5 text-right">Certified/Approved</th>
                <th className="p-3.5 text-right">Rejected/Deducted</th>
                <th className="p-3.5 text-center">Reconciliation Status</th>
                <th className="p-3.5 text-right">Retention balance</th>
                <th className="p-3.5 text-center">Verify Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {projectVPs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500 text-xs">
                    No valuation claims prepared for this project workspace. Open sidebar claims template.
                  </td>
                </tr>
              ) : (
                projectVPs.map((v) => {
                  const isCertifying = certifyingVpId === v.id;
                  return (
                    <tr key={v.id} className="hover:bg-slate-900/20">
                      <td className="p-3.5 font-bold text-slate-200 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-500/80" /> VP-{v.vpNumber}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{v.claimDate}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-300">{formatCurrency(v.claimAmount)}</td>
                      
                      <td className="p-3.5 text-right font-mono text-emerald-400 font-bold">
                        {isCertifying ? (
                          <input
                            type="number"
                            value={approvedAmount}
                            onChange={(e) => setApprovedAmount(e.target.value)}
                            className="bg-slate-950 border border-slate-700 text-xs text-right rounded p-1 font-mono outline-none text-emerald-400 w-28"
                          />
                        ) : v.status === "Submitted" ? (
                          <span className="text-slate-500 italic">Review Ongoing</span>
                        ) : (
                          formatCurrency(v.approvedAmount)
                        )}
                      </td>

                      <td className="p-3.5 text-right font-mono text-rose-400 font-semibold">
                        {v.status === "Submitted" ? (
                          <span className="text-slate-500 italic">-</span>
                        ) : (
                          v.rejectedAmount > 0 ? `-${formatCurrency(v.rejectedAmount)}` : "$0"
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`text-[10px] font-bold border rounded px-2 py-0.5 uppercase ${getStatusBadge(v.status)}`}>
                          {v.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono text-slate-300">
                        {v.status === "Submitted" ? "-" : formatCurrency(v.remainingBalance)}
                      </td>

                      <td className="p-3.5 text-center">
                        {isCertifying ? (
                          <button
                            onClick={() => handleSaveCertification(v.id)}
                            className="px-2.5 py-1 bg-gradient-to-tr from-emerald-600 to-green-500 text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Sign Certificate
                          </button>
                        ) : v.status === "Submitted" ? (
                          <button
                            onClick={() => handleStartCertify(v)}
                            disabled={!canCertify}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase transition-all ${
                              canCertify 
                                ? "bg-slate-800 hover:border-cyan-500/40 text-cyan-400 border-slate-700 cursor-pointer" 
                                : "bg-slate-900 border-slate-950 text-slate-600 cursor-not-allowed"
                            }`}
                            title={canCertify ? "Certify this valuation" : "SQS role required to certify"}
                          >
                            Certify
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500 font-medium">Certified Audited</span>
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

      {/* History and Audit Trail */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Claims Historical Audit Trail Logs</h3>
        </div>

        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {projectVPs.flatMap(vp => vp.auditTrail).length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">No historical reviews logged.</div>
          ) : (
            projectVPs.flatMap((vp, idx) => vp.auditTrail.map((trail, tIdx) => (
              <div key={`${idx}-${tIdx}`} className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 text-xs flex items-start gap-2.5 font-medium text-slate-300">
                <span className="p-1 rounded bg-slate-900 text-amber-500 border border-slate-800 font-bold shrink-0 text-[9px] font-mono uppercase">
                  VP-{vp.vpNumber} Action
                </span>
                <p className="leading-relaxed leading-6">{trail}</p>
              </div>
            )))
          )}
        </div>
      </div>

    </div>
  );
}
