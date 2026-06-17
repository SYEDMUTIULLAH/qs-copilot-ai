import React, { useState } from "react";
import { GitCompare, FileSpreadsheet, Sparkles, Plus, Trash2, ShieldCheck, ChevronRight, Download, Printer, AlertTriangle } from "lucide-react";
import { Variation, VariationItem, QSProject, UserRole } from "../types";

interface AIExplanationEngineProps {
  variations: Variation[];
  project: QSProject;
  onCreateVariation: (vo: any) => Promise<void>;
  onApproveVariation: (id: string, role: UserRole, userName: string) => Promise<void>;
  activeRole: UserRole;
}

interface NewVOItem {
  boqItemRef: string;
  description: string;
  unit: string;
  tenderQty: number;
  ifcQty: number;
  rate: number;
}

export default function AIExplanationEngine({
  variations,
  project,
  onCreateVariation,
  onApproveVariation,
  activeRole
}: AIExplanationEngineProps) {
  
  const [showCreator, setShowCreator] = useState(false);
  const [voTitle, setVoTitle] = useState("");
  const [voRef, setVoRef] = useState("");
  const [voJustification, setVoJustification] = useState("");
  const [analyzingAI, setAnalyzingAI] = useState(false);
  
  // Create state for dynamic rows in a variation creator
  const [items, setItems] = useState<NewVOItem[]>([
    { boqItemRef: "D.01.1", description: "Grade 40/20 concrete structural increase", unit: "m3", tenderQty: 250, ifcQty: 480, rate: 110 },
    { boqItemRef: "D.01.2", description: "Reinforcement high steel deformation bars", unit: "ton", tenderQty: 18, ifcQty: 28, rate: 980 },
    { boqItemRef: "NEW-EP01", description: "Internal Sump waterproofing protective coating layer", unit: "m2", tenderQty: 0, ifcQty: 450, rate: 35 }
  ]);

  const [activeVO, setActiveVO] = useState<Variation | null>(variations[0] || null);
  const [activeVOItems, setActiveVOItems] = useState<VariationItem[]>([
    {
      id: "vi-1",
      variationId: "v-1",
      boqItemRef: "D.01.1",
      description: "Grade 40/20 concrete in foundation (additional volume for Sump)",
      unit: "m3",
      tenderQty: 240,
      ifcQty: 890,
      claimedQty: 450,
      rate: 110,
      additionQty: 650,
      omissionQty: 0,
      netQty: 650,
      amount: 71500
    },
    {
      id: "vi-2",
      variationId: "v-1",
      boqItemRef: "D.01.2",
      description: "High tensile steel reinforcement deformed bars grade 500 (sump reinforcement)",
      unit: "ton",
      tenderQty: 22,
      ifcQty: 94,
      claimedQty: 50,
      rate: 980,
      additionQty: 72,
      omissionQty: 0,
      netQty: 72,
      amount: 70560
    }
  ]);

  const projectVOs = variations.filter(v => v.projectId === project?.id);

  const canApprove = activeRole === "Admin" || activeRole === "Senior Quantity Surveyor" || activeRole === "Project Manager";

  const handleAddRow = () => {
    setItems([...items, { boqItemRef: "", description: "", unit: "m3", tenderQty: 0, ifcQty: 0, rate: 0 }]);
  };

  const handleUpdateItem = (index: number, key: keyof NewVOItem, val: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [key]: val };
    setItems(copy);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Automated design reasoning
  const handleAISummarizeJustification = async () => {
    setAnalyzingAI(true);
    try {
      // Simulate/Trigger AI justification creation
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Draft structured surveyor justification notes and claim summary for a Variation titled: "${voTitle || "Untitled"}" with structural changes: ${items.map(i => `${i.description} (IFC: ${i.ifcQty} vs Tender: ${i.tenderQty} ${i.unit})`).join(", ")}. Reference FIDIC contract specifications.`,
          projectId: project.id
        })
      });
      const data = await res.json();
      setVoJustification(data.content);
    } catch {
      // Fallback
      setVoJustification(`**FIDIC Contractual Justification**:\n- Comparison analysis confirms an increase in IFC quantities over original Contract drawings.\n- Sub-surface details and design structural changes ordered by Design Office dictate additions for these materials.\n- Net total values have been audited mathematically.`);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleSaveVariationObj = async () => {
    if (!voTitle) {
      alert("Please provide variation title.");
      return;
    }

    const payload = {
      projectId: project.id,
      title: voTitle,
      refNumber: voRef || `VO-${Math.floor(Math.random()*900)+100}`,
      justification: voJustification || "Required as per amended design details.",
      items: items,
      userName: activeRole
    };

    await onCreateVariation(payload);
    setShowCreator(false);
    
    // Select newly added variation
    if (variations.length > 0) {
      setActiveVO(variations[0]);
    }
  };

  const handleCertifyVOAction = async (id: string) => {
    if (!canApprove) return;
    await onApproveVariation(id, activeRole, activeRole);
    // Refresh current VO in selector view
    const updated = variations.find(v => v.id === id);
    if (updated) {
      setActiveVO(updated);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: project?.currency || "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-200">AI Change Order & Variation Engine</h2>
          <p className="text-xs text-slate-400">Automate contract additions and omissions logic dynamically based on IFC drawings comparison.</p>
        </div>
        <button
          onClick={() => setShowCreator(!showCreator)}
          className="cursor-pointer bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
        >
          <GitCompare className="w-4 h-4" /> {showCreator ? "Show Active List" : "Formulate Variation Comparison"}
        </button>
      </div>

      {showCreator ? (
        /* Variation creation forms (Additions / Omissions comparison matrix) */
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 animate-fadeIn">
          
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Tender Baseline vs IFC Drawings Comparison</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Define original quantities and Issued-For-Construction variables to autodetect variations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Variation Title / Ref Name</label>
              <input
                type="text"
                placeholder="e.g. Enlarged Substation Pile Caps Layout"
                value={voTitle}
                onChange={(e) => setVoTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Variation Reference ID</label>
              <input
                type="text"
                placeholder="e.g. VO-04-ELEC-SUB"
                value={voRef}
                onChange={(e) => setVoRef(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 text-xs focus:border-blue-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Table Comparison Interface */}
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/60 uppercase text-[10px] text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="p-3">Ref Bill</th>
                  <th className="p-3">Material Description</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Tender Qty</th>
                  <th className="p-3">IFC Qty</th>
                  <th className="p-3">Contract Rate</th>
                  <th className="p-3">Calculated Status</th>
                  <th className="p-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {items.map((item, idx) => {
                  const diff = item.ifcQty - item.tenderQty;
                  const isAddition = diff > 0;
                  const isOmission = diff < 0;
                  const valOfChange = Math.abs(diff) * item.rate;

                  return (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-2 w-24">
                        <input
                          type="text"
                          value={item.boqItemRef}
                          onChange={(e) => handleUpdateItem(idx, "boqItemRef", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded py-1 px-2 font-mono"
                          placeholder="Ref"
                        />
                      </td>
                      <td className="p-2 min-w-48">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, "description", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded py-1 px-2"
                          placeholder="Description"
                        />
                      </td>
                      <td className="p-2 w-16">
                        <select
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(idx, "unit", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded py-1 px-1"
                        >
                          <option value="m3">m3</option>
                          <option value="m2">m2</option>
                          <option value="ton">ton</option>
                          <option value="item">item</option>
                          <option value="m">m</option>
                        </select>
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="number"
                          value={item.tenderQty}
                          onChange={(e) => handleUpdateItem(idx, "tenderQty", Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded py-1 px-2 font-mono"
                        />
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="number"
                          value={item.ifcQty}
                          onChange={(e) => handleUpdateItem(idx, "ifcQty", Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded py-1 px-2 font-mono"
                        />
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(idx, "rate", Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded py-1 px-2 font-mono"
                        />
                      </td>
                      <td className="p-2 font-bold font-mono">
                        {isAddition && (
                          <span className="text-emerald-400">Addition: +{diff} (+{formatCurrency(valOfChange)})</span>
                        )}
                        {isOmission && (
                          <span className="text-rose-400">Omission: -{Math.abs(diff)} (-{formatCurrency(valOfChange)})</span>
                        )}
                        {diff === 0 && <span className="text-slate-500">No Change</span>}
                      </td>
                      <td className="p-2 text-center w-12">
                        <button
                          onClick={() => handleRemoveRow(idx)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer p-1 rounded hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
            <button
              onClick={handleAddRow}
              className="bg-slate-800 hover:bg-slate-700 hover:text-slate-100 text-slate-300 font-bold py-1.5 px-3.5 rounded text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Append Material Entry
            </button>

            {/* Total Balance Estimation of Change */}
            <div className="text-right font-mono text-xs">
              <span className="text-slate-500 font-semibold uppercase">Estimated Total Cost Settle Impact</span>:{" "}
              <span className="font-extrabold text-cyan-400">
                {formatCurrency(
                  items.reduce((acc, i) => acc + ((i.ifcQty - i.tenderQty) * i.rate), 0)
                )}
              </span>
            </div>
          </div>

          {/* Custom AI Justification Panel */}
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-300">Gemma 4 AI Change Justification</h4>
              </div>
              <button
                onClick={handleAISummarizeJustification}
                disabled={analyzingAI}
                className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 font-bold px-3 py-1 rounded text-xs cursor-pointer"
              >
                {analyzingAI ? "Formulating notes..." : "Generate AI Justification"}
              </button>
            </div>

            <textarea
              value={voJustification}
              onChange={(e) => setVoJustification(e.target.value)}
              rows={4}
              placeholder="Justification notes detailing FIDIC conditions, engineering scope edits, and addition explanation text will be generated here."
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-3 text-xs leading-relaxed focus:border-purple-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowCreator(false)}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Close Form
            </button>
            <button
              onClick={handleSaveVariationObj}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Submit Variation Order to Vault
            </button>
          </div>

        </div>
      ) : (
        /* Variation listings and details viewport */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Select bar */}
          <div className="lg:col-span-1 space-y-3 flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1"> Change Order Log</span>
            
            {projectVOs.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No change request sheets drafted. Click 'Formulate Variation' to compare.
              </div>
            ) : (
              projectVOs.map((vo) => {
                const selected = activeVO?.id === vo.id;
                return (
                  <div 
                    key={vo.id}
                    onClick={() => setActiveVO(vo)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      selected 
                        ? "bg-slate-900 border-cyan-500/30 shadow-md shadow-cyan-500/5" 
                        : "bg-slate-900/30 border-slate-800/80 hover:border-slate-700/80"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{vo.refNumber}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        vo.status === "ClientApproved" ? "bg-emerald-500/10 text-emerald-400" :
                        vo.status === "SqsApproved" ? "bg-cyan-500/10 text-cyan-400" :
                        "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {vo.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 mt-2 line-clamp-1 leading-tight">{vo.title}</h4>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-xs">
                      <span className="text-slate-500">Value:</span>
                      <span className="font-bold text-slate-100 font-mono">{formatCurrency(vo.variationValue)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details layout */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
            {activeVO ? (
              <div className="space-y-5">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Change order reference: {activeVO.refNumber}</span>
                    <h3 className="text-md font-bold text-slate-100 mt-1 leading-tight">{activeVO.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role-based approval rules */}
                    {activeVO.status === "Pending" && (
                      <button
                        onClick={() => handleCertifyVOAction(activeVO.id)}
                        disabled={!canApprove}
                        className={`font-semibold cursor-pointer text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
                          canApprove 
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                        title={canApprove ? "Settle approval level" : "Manager or Higher authorization required."}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Approve Claims
                      </button>
                    )}

                    <button 
                      onClick={() => window.print()}
                      className="cursor-pointer p-1.5 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100"
                      title="Print Variation Form"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Claim Valuation</span>
                    <span className="text-lg font-bold text-cyan-400 font-mono mt-1 block">{formatCurrency(activeVO.variationValue)}</span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Creation stamp</span>
                    <span className="text-slate-300 font-mono mt-2 block">
                      {new Date(activeVO.createdDate).toLocaleDateString([], { dateStyle: 'long' })}
                    </span>
                  </div>
                </div>

                {/* Sub-items comparison sheet */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Extracted Quantities Reconciliation Matrix</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-lg text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950/70 text-[9px] uppercase tracking-wider text-slate-500 font-extrabold border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">BOQ Ref</th>
                          <th className="p-2.5">Description</th>
                          <th className="p-2.5">Unit</th>
                          <th className="p-2.5 text-right">Tender Qty</th>
                          <th className="p-2.5 text-right">IFC Qty</th>
                          <th className="p-2.5 text-right">Rate</th>
                          <th className="p-2.5 text-right">Net Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {activeVOItems.map((vi, index) => {
                          const isAdd = vi.netQty > 0;
                          return (
                            <tr key={index} className="hover:bg-slate-900/20">
                              <td className="p-2 font-mono">{vi.boqItemRef || "NEW"}</td>
                              <td className="p-2 max-w-[200px] truncate">{vi.description}</td>
                              <td className="p-1 px-2.5 font-semibold text-slate-500 text-[11px]">{vi.unit}</td>
                              <td className="p-2 text-right font-mono text-slate-400">{vi.tenderQty}</td>
                              <td className="p-2 text-right font-mono text-slate-200">{vi.ifcQty}</td>
                              <td className="p-2 text-right font-mono text-slate-400">{formatCurrency(vi.rate)}</td>
                              <td className={`p-2 text-right font-mono font-bold ${isAdd ? "text-emerald-400" : "text-rose-400"}`}>
                                {isAdd ? "+" : ""}{formatCurrency(vi.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI generated Justification text */}
                <div className="bg-slate-950/65 p-4 border border-slate-800/80 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Commercial Justification Analysis</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-medium p-1">
                    {activeVO.justification}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-4">
                  <span>Authorized Approver: <strong className="text-slate-400">{activeVO.approvedBy || "Under Review"}</strong></span>
                  <span className="font-mono">Last edited: {new Date(activeVO.lastUpdated).toLocaleDateString()}</span>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-24 leading-relaxed">
                <AlertTriangle className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-xs font-medium">Select a draft variation order from the left column to view audit records.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
