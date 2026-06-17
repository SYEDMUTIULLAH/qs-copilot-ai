import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import ProjectModule from "./components/ProjectModule";
import DocumentsView from "./components/DocumentsView";
import AIExplanationEngine from "./components/AIExplanationEngine";
import ProcurementAlerts from "./components/ProcurementAlerts";
import BOQTracker from "./components/BOQTracker";
import VPReconciliation from "./components/VPReconciliation";
import CommercialReports from "./components/CommercialReports";
import AIChatAssistant from "./components/AIChatAssistant";
import AdminView from "./components/AdminView";
import SettingsView from "./components/SettingsView";

import { 
  UserRole, 
  QSProject, 
  QSDocument, 
  BOQItem, 
  Variation, 
  ProcurementAlert, 
  VPRecord, 
  RiskLog, 
  AuditLog, 
  ChatMessage 
} from "./types";

import { 
  loadProjects,
  saveProjects,
  loadVariations,
  saveVariations,
  loadDocuments,
  saveDocuments,
  loadBOQItems,
  saveBOQItems,
  loadVariationItems,
  saveVariationItems,
  loadProcurement,
  saveProcurement,
  loadVPs,
  saveVPs,
  loadRisks,
  saveRisks,
  loadAudits,
  saveAudits,
  loadChats,
  saveChats,
  initOfflineDB,
  getSimulatedReply
} from "./lib/offlineDb";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeRole, setActiveRole] = useState<UserRole>("Senior Quantity Surveyor");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // System Core Data States
  const [projects, setProjects] = useState<QSProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [documents, setDocuments] = useState<QSDocument[]>([]);
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [procurement, setProcurement] = useState<ProcurementAlert[]>([]);
  const [vps, setVps] = useState<VPRecord[]>([]);
  const [risks, setRisks] = useState<RiskLog[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch all core datasets from offline DB
  const loadWorkspaceData = async (shouldInitialRun = false) => {
    try {
      setErrorMsg("");
      
      const resProj = loadProjects();
      const resDocs = loadDocuments();
      const resBOQ = loadBOQItems();
      const resVO = loadVariations();
      const resProc = loadProcurement();
      const resVPs = loadVPs();
      const resRisks = loadRisks();
      const resAudits = loadAudits();
      const resChats = loadChats();

      setProjects(resProj || []);
      setDocuments(resDocs || []);
      setBoqItems(resBOQ || []);
      setVariations(resVO || []);
      setProcurement(resProc || []);
      setVps(resVPs || []);
      setRisks(resRisks || []);
      setAudits(resAudits || []);
      setMessages(resChats || []);

      if (shouldInitialRun && resProj && resProj.length > 0) {
        setSelectedProjectId(resProj[0].id);
      }
    } catch (err) {
      setErrorMsg("Failed to synchronize offline database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData(true);
  }, []);

  // Update selectedProjectId if it is empty but projects populated
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // INTERACTIVE ACTIONS & HANDLERS OFFLINE DATABASE ENGINE
  const handleAddProject = async (pObj: any) => {
    setLoading(true);
    try {
      const currentProjects = loadProjects();
      const newProj: QSProject = {
        id: "p-" + (currentProjects.length + 1),
        name: pObj.name || "Untitled Project",
        contractNumber: pObj.contractNumber || "TBD",
        client: pObj.client || "TBD",
        consultant: pObj.consultant || "TBD",
        contractValue: Number(pObj.contractValue) || 1000000,
        currency: pObj.currency || "USD",
        startDate: pObj.startDate || new Date().toISOString().split("T")[0],
        completionDate: pObj.completionDate || new Date().toISOString().split("T")[0],
        status: pObj.status || "Draft"
      };

      currentProjects.push(newProj);
      saveProjects(currentProjects);

      // Add default template BOQ items to newly created project
      const defaultTemplates: Partial<BOQItem>[] = [
        { billRef: "1.0", description: "Excavation and earthworks as per tender details and structural plans.", unit: "m3", originalQty: 5000, rate: 10 },
        { billRef: "2.0", description: "Grade 35 Reinforced concrete poured in main beams & ground slabs.", unit: "m3", originalQty: 2200, rate: 120 },
        { billRef: "3.1", description: "Tension high tensile reinforcement steel bars grade 460.", unit: "ton", originalQty: 180, rate: 950 },
        { billRef: "Fin-12", description: "Polished anti-skid porcelain floor tile assembly including preparation screeds.", unit: "m2", originalQty: 1500, rate: 45 }
      ];

      const currentBOQs = loadBOQItems();
      defaultTemplates.forEach((t, index) => {
        currentBOQs.push({
          id: `boq-${newProj.id}-${index + 1}`,
          projectId: newProj.id,
          billRef: t.billRef!,
          description: t.description!,
          unit: t.unit!,
          originalQty: t.originalQty!,
          claimedQty: 0,
          remainingQty: t.originalQty!,
          rate: t.rate!,
          totalAmount: t.originalQty! * t.rate!
        });
      });
      saveBOQItems(currentBOQs);

      // Logging
      const currentAudits = loadAudits();
      currentAudits.unshift({
        id: "audit-" + Date.now(),
        projectId: newProj.id,
        userId: "u-1",
        userName: activeRole + " Operator",
        userRole: activeRole,
        action: "Project Created",
        details: `Initialized project ${newProj.name} with standard contract items.`,
        timestamp: new Date().toISOString()
      });
      saveAudits(currentAudits);

      setSelectedProjectId(newProj.id);
      await loadWorkspaceData();
    } catch {
      alert("Error creating new project baseline.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (docObj: any) => {
    try {
      const currentDocs = loadDocuments();
      const newDoc: QSDocument = {
        id: "doc-" + Date.now(),
        projectId: docObj.projectId || selectedProjectId || "p-1",
        name: docObj.name || "uploaded_specs.pdf",
        type: docObj.type || "Specification",
        version: docObj.version || "v1.0",
        uploadDate: new Date().toISOString(),
        uploadedBy: docObj.uploadedBy || activeRole + " Officer",
        fileSize: docObj.fileSize || "4.5 MB",
        extractedItemsCount: docObj.extractedItemsCount || Math.floor(Math.random() * 50) + 10
      };

      currentDocs.push(newDoc);
      saveDocuments(currentDocs);

      // Auditing
      const currentAudits = loadAudits();
      currentAudits.unshift({
        id: "audit-" + Date.now(),
        projectId: newDoc.projectId,
        userId: "u-1",
        userName: newDoc.uploadedBy,
        userRole: activeRole,
        action: "Document Uploaded",
        details: `Uploaded ${newDoc.type} document: ${newDoc.name} (${newDoc.fileSize})`,
        timestamp: new Date().toISOString()
      });
      saveAudits(currentAudits);

      await loadWorkspaceData();
    } catch {
      alert("Failed to submit and scan commercial document.");
    }
  };

  const handleCreateVariation = async (voObj: any) => {
    try {
      const currentVOs = loadVariations();
      const currentVOItems = loadVariationItems();

      const items = voObj.items || [];
      const totalValue = items.reduce((acc: number, item: any) => {
        const additionQty = item.ifcQty > item.tenderQty ? item.ifcQty - item.tenderQty : 0;
        const omissionQty = item.ifcQty < item.tenderQty ? item.tenderQty - item.ifcQty : 0;
        const netQty = additionQty - omissionQty;
        return acc + (netQty * item.rate);
      }, 0);

      const newVO: Variation = {
        id: "v-" + Date.now(),
        projectId: voObj.projectId || selectedProjectId || "p-1",
        title: voObj.title || "New Revised Scope Layout",
        refNumber: voObj.refNumber || `VO-REVISED-${Date.now().toString().slice(-4)}`,
        status: "Pending",
        variationValue: totalValue,
        justification: voObj.justification || "Required as per dynamic design coordinates modifications.",
        claimSummary: `Includes additions and omissions for design variation layout elements. Checked mathematically.`,
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      currentVOs.unshift(newVO);
      saveVariations(currentVOs);

      // Save variation items
      items.forEach((item: any, idx: number) => {
        const adQty = item.ifcQty > item.tenderQty ? item.ifcQty - item.tenderQty : 0;
        const omQty = item.ifcQty < item.tenderQty ? item.tenderQty - item.ifcQty : 0;
        currentVOItems.push({
          id: `vi-${newVO.id}-${idx}`,
          variationId: newVO.id,
          boqItemRef: item.boqItemRef || "NEW",
          description: item.description,
          unit: item.unit || "m3",
          tenderQty: item.tenderQty || 0,
          ifcQty: item.ifcQty || 0,
          claimedQty: 0,
          rate: item.rate || 1,
          additionQty: adQty,
          omissionQty: omQty,
          netQty: adQty - omQty,
          amount: (adQty - omQty) * (item.rate || 1)
        });
      });
      saveVariationItems(currentVOItems);

      const currentAudits = loadAudits();
      currentAudits.unshift({
        id: "audit-" + Date.now(),
        projectId: newVO.projectId,
        userId: "u-1",
        userName: voObj.userName || "Senior QS",
        userRole: "Senior Quantity Surveyor",
        action: "Created Variation Order",
        details: `Generated VO ${newVO.refNumber} with value ${newVO.variationValue} based on IFC drawings.`,
        timestamp: new Date().toISOString()
      });
      saveAudits(currentAudits);

      await loadWorkspaceData();
    } catch {
      alert("Failed to record variation change-order.");
    }
  };

  const handleApproveVariation = async (id: string, role: UserRole, userName: string) => {
    try {
      const currentVOs = loadVariations();
      const vo = currentVOs.find(v => v.id === id);
      if (!vo) {
        alert("Variation database mismatch!");
        return;
      }

      if (role !== "Admin" && role !== "Senior Quantity Surveyor" && role !== "Project Manager") {
        alert(`Permission Denied: User role ${role} does not have variation approval rights.`);
        return;
      }

      if (role === "Project Manager") {
        vo.status = "ClientApproved";
      } else {
        vo.status = "SqsApproved";
      }

      vo.lastUpdated = new Date().toISOString();
      vo.approvedBy = userName || "Authorized QS Manager";
      saveVariations(currentVOs);

      // Audit Log
      const currentAudits = loadAudits();
      currentAudits.unshift({
        id: "audit-" + Date.now(),
        projectId: vo.projectId,
        userId: "u-1",
        userName: userName || "Manager",
        userRole: role,
        action: "Approved Variation",
        details: `Approved VO ${vo.refNumber} status set to: ${vo.status}.`,
        timestamp: new Date().toISOString()
      });
      saveAudits(currentAudits);

      await loadWorkspaceData();
    } catch {
      alert("Access authorization error approving variation.");
    }
  };

  const handleAddProcurement = async (procObj: any) => {
    try {
      const currentProc = loadProcurement();
      const newAlert: ProcurementAlert = {
        id: "pr-" + Date.now(),
        projectId: procObj.projectId || selectedProjectId || "p-1",
        materialName: procObj.materialName,
        requiredQty: Number(procObj.requiredQty) || 0,
        currentStock: Number(procObj.currentStock) || 0,
        shortage: Math.max(0, Number(procObj.requiredQty) - Number(procObj.currentStock)),
        recommendedOrderQty: Math.max(0, Number(procObj.requiredQty) - Number(procObj.currentStock)) + Math.floor(Math.random() * 50),
        priority: procObj.priority || "Medium",
        status: "Pending Order",
        unit: procObj.unit || "units",
        boqItemRef: procObj.boqItemRef
      };

      currentProc.unshift(newAlert);
      saveProcurement(currentProc);
      await loadWorkspaceData();
    } catch {
      alert("Failed to update procurement logs.");
    }
  };

  const handleChangeProcurementStatus = async (id: string, status: string, userName: string) => {
    try {
      const currentProc = loadProcurement();
      const alert = currentProc.find(p => p.id === id);
      if (!alert) return;

      alert.status = status as any;
      saveProcurement(currentProc);

      // Audit Log
      const currentAudits = loadAudits();
      currentAudits.unshift({
        id: "audit-" + Date.now(),
        projectId: alert.projectId,
        userId: "u-1",
        userName: userName || "Procurement Officer",
        userRole: "Procurement Engineer",
        action: "Updated Procurement status",
        details: `Material '${alert.materialName}' status changed to '${status}'.`,
        timestamp: new Date().toISOString()
      });
      saveAudits(currentAudits);

      await loadWorkspaceData();
    } catch {
      alert("Authorization error in updating supply chain status.");
    }
  };

  const handleUpdateClaimQty = async (id: string, qty: number, role: UserRole) => {
    try {
      const currentBOQs = loadBOQItems();
      const item = currentBOQs.find(b => b.id === id);
      if (!item) return;

      item.claimedQty = qty;
      item.remainingQty = item.originalQty - item.claimedQty;
      saveBOQItems(currentBOQs);

      // Check remaining
      if (item.remainingQty < 0) {
        const currentRisks = loadRisks();
        const riskExists = currentRisks.some(r => r.projectId === item.projectId && r.title.includes(item.billRef));
        if (!riskExists) {
          currentRisks.unshift({
            id: "r-" + Date.now(),
            projectId: item.projectId,
            title: `Contract Item Overrun Detected: Ref ${item.billRef}`,
            severity: "High",
            description: `Contract bill item Ref ${item.billRef} (${item.description}) has exceeded original quantity of ${item.originalQty} ${item.unit}. Claimed quantity is now ${item.claimedQty}. Balance turned red.`,
            identifiedDate: new Date().toISOString().split("T")[0]
          });
          saveRisks(currentRisks);
        }
      }

      // Audit
      const currentAudits = loadAudits();
      currentAudits.unshift({
        id: "audit-" + Date.now(),
        projectId: item.projectId,
        userId: "u-1",
        userName: "John QS",
        userRole: role,
        action: "Updated Claim Quantity",
        details: `Set claimed quantity for BOQ Ref ${item.billRef} to ${item.claimedQty} ${item.unit}.`,
        timestamp: new Date().toISOString()
      });
      saveAudits(currentAudits);

      await loadWorkspaceData();
    } catch {
      alert("Rejection: quantity edit exceeds contract tolerance limits.");
    }
  };

  const handleCreateVP = async (claimAmt: number, userName: string) => {
    try {
      const currentVPs = loadVPs();
      const latestVpNum = currentVPs.reduce((max, r) => r.vpNumber > max ? r.vpNumber : max, 0);
      const newVp: VPRecord = {
        id: "vp-" + Date.now(),
        projectId: selectedProjectId || "p-1",
        vpNumber: latestVpNum + 1,
        claimDate: new Date().toISOString().split("T")[0],
        claimAmount: claimAmt,
        approvedAmount: 0,
        rejectedAmount: 0,
        status: "Submitted",
        remainingBalance: claimAmt,
        auditTrail: [
          `${new Date().toISOString().split("T")[0]}: Claim VP-${latestVpNum + 1} generated & compiled.`
        ]
      };

      currentVPs.unshift(newVp);
      saveVPs(currentVPs);

      // Audits
      const currentAudits = loadAudits();
      currentAudits.unshift({
        id: "audit-" + Date.now(),
        projectId: newVp.projectId,
        userId: "u-1",
        userName: userName || "Sarah QS",
        userRole: "Quantity Surveyor",
        action: "Created Valuation Claim",
        details: `Generated interim claim VP-${newVp.vpNumber} valuing $${newVp.claimAmount}.`,
        timestamp: new Date().toISOString()
      });
      saveAudits(currentAudits);

      await loadWorkspaceData();
    } catch {
      alert("Failed to publish valuation submittal.");
    }
  };

  const handleCertifyVP = async (id: string, approvedAmt: number, role: UserRole, userName: string) => {
    try {
      const currentVPs = loadVPs();
      const vp = currentVPs.find(v => v.id === id);
      if (!vp) return;

      if (role !== "Admin" && role !== "Senior Quantity Surveyor" && role !== "Project Manager") {
        alert("Certification requires Senior QS or PM credentials.");
        return;
      }

      const rejected = Math.max(0, vp.claimAmount - approvedAmt);
      vp.status = "Certified";
      vp.approvedAmount = approvedAmt;
      vp.rejectedAmount = rejected;
      vp.remainingBalance = rejected;
      vp.approvedDate = new Date().toISOString().split("T")[0];
      vp.auditTrail.unshift(
        `${vp.approvedDate}: Certified by ${userName} (${role}). Approved: $${approvedAmt}. Discrepancy: $${rejected}.`
      );
      saveVPs(currentVPs);

      // Audit
      const currentAudits = loadAudits();
      currentAudits.unshift({
        id: "audit-" + Date.now(),
        projectId: vp.projectId,
        userId: "u-1",
        userName: userName,
        userRole: role,
        action: "Certified Payment Claim",
        details: `Certified VP-${vp.vpNumber}. Claimed: $${vp.claimAmount}, Approved: $${vp.approvedAmount}.`,
        timestamp: new Date().toISOString()
      });
      saveAudits(currentAudits);

      await loadWorkspaceData();
    } catch {
      alert("Error: Certification permissions restricted.");
    }
  };

  const handleSendMessage = async (text: string) => {
    try {
      const currentChats = loadChats();
      // User Message
      const userMsg: ChatMessage = {
        id: "c-user-" + Date.now(),
        projectId: selectedProjectId || "p-1",
        role: "user",
        content: text,
        timestamp: new Date().toISOString()
      };
      currentChats.push(userMsg);

      // Simulated Bot Reply
      const activeProj = projects.find(p => p.id === selectedProjectId) || projects[0];
      const botReply = getSimulatedReply(text, activeProj, boqItems, variations, vps, procurement, risks);
      
      const assistantMsg: ChatMessage = {
        id: "c-assistant-" + Date.now(),
        projectId: selectedProjectId || "p-1",
        role: "assistant",
        content: botReply,
        timestamp: new Date().toISOString()
      };
      currentChats.push(assistantMsg);
      saveChats(currentChats);

      await loadWorkspaceData();
    } catch {
      alert("AI Assistant error generating simulation response.");
    }
  };

  const handleResetChats = async () => {
    try {
      const defaultChats: ChatMessage[] = [
        {
          id: "c-1",
          projectId: selectedProjectId || "p-1",
          role: "assistant",
          content: `Greetings! I am **QS Copilot AI**, your offline commercial quantity surveyor companion. Ask me configuration, procurement, or discrepancy questions.`,
          timestamp: new Date().toISOString()
        }
      ];
      saveChats(defaultChats);
      await loadWorkspaceData();
    } catch {
      alert("Failed to clear chat memory.");
    }
  };

  const handleImportBOQ = async (importedItems: Partial<BOQItem>[]) => {
    try {
      const currentBOQs = loadBOQItems();
      const restBOQs = currentBOQs.filter(b => b.projectId !== selectedProjectId);
      
      const newBOQEntries: BOQItem[] = importedItems.map((item, idx) => ({
        id: `boq-${selectedProjectId}-imported-${idx}-${Date.now()}`,
        projectId: selectedProjectId,
        billRef: item.billRef || `${idx + 1}.0`,
        description: item.description || "Imported commercial line",
        unit: item.unit || "m3",
        originalQty: item.originalQty || 0,
        claimedQty: item.claimedQty || 0,
        remainingQty: (item.originalQty || 0) - (item.claimedQty || 0),
        rate: item.rate || 0,
        totalAmount: (item.originalQty || 0) * (item.rate || 0)
      }));

      const merged = [...restBOQs, ...newBOQEntries];
      saveBOQItems(merged);

      // Audits
      const currentAudits = loadAudits();
      currentAudits.unshift({
        id: "audit-" + Date.now(),
        projectId: selectedProjectId,
        userId: "u-1",
        userName: activeRole + " Officer",
        userRole: activeRole,
        action: "Imported BOQ Excel",
        details: `Imported and compiled ${newBOQEntries.length} new bill lines for project.`,
        timestamp: new Date().toISOString()
      });
      saveAudits(currentAudits);

      await loadWorkspaceData();
    } catch {
      alert("Error importing Excel content into workspace database.");
    }
  };

  const handleFlushDB = async () => {
    setLoading(true);
    try {
      initOfflineDB(true);
      await loadWorkspaceData(true);
    } catch {
      alert("Database error resetting values.");
    } finally {
      setLoading(false);
    }
  };

  // Aggregated Notification badging
  const unreadAlertsCount = procurement.filter(p => p.projectId === selectedProjectId && p.priority === "High" && p.status !== "Delivered").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 font-mono text-xs">
        <div className="w-12 h-12 border-2 border-t-blue-600 border-slate-200 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold uppercase animate-pulse">Assembling QS Copilot Commercial Brain...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* Dynamic Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        unreadNotifications={unreadAlertsCount}
      />

      {/* Main Panel Content Body */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Upper Header Status Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">QS COMMERCIAL COMPASS</span>
            <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-semibold">
              FIDIC Method of Measurement
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="block text-slate-800 font-bold leading-none">{activeRole} Mode</span>
              <span className="text-[10px] text-slate-400 font-mono">Workspace session active</span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-white"></div>
          </div>
        </header>

        {/* Selected Tab Layout Router */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-rose-400 text-xs rounded-xl font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {activeTab === "dashboard" && activeProject && (
            <DashboardView
              project={activeProject}
              boqItems={boqItems}
              variations={variations}
              procurement={procurement}
              vps={vps}
              risks={risks}
              audits={audits}
              onNavigate={setActiveTab}
              activeRole={activeRole}
            />
          )}

          {activeTab === "projects" && (
            <ProjectModule
              projects={projects}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              onAddProject={handleAddProject}
              activeRole={activeRole}
            />
          )}

          {activeTab === "documents" && activeProject && (
            <DocumentsView
              documents={documents}
              project={activeProject}
              onAddDocument={handleAddDocument}
              activeRole={activeRole}
            />
          )}

          {activeTab === "variations" && activeProject && (
            <AIExplanationEngine
              variations={variations}
              project={activeProject}
              onCreateVariation={handleCreateVariation}
              onApproveVariation={handleApproveVariation}
              activeRole={activeRole}
            />
          )}

          {activeTab === "procurement" && activeProject && (
            <ProcurementAlerts
              procurement={procurement}
              project={activeProject}
              onAddProcurement={handleAddProcurement}
              onChangeStatus={handleChangeProcurementStatus}
              activeRole={activeRole}
            />
          )}

          {activeTab === "boq-tracker" && activeProject && (
            <BOQTracker
              boqItems={boqItems}
              project={activeProject}
              onUpdateClaimQty={handleUpdateClaimQty}
              onImportBOQ={handleImportBOQ}
              activeRole={activeRole}
            />
          )}

          {activeTab === "vp-history" && activeProject && (
            <VPReconciliation
              vps={vps}
              project={activeProject}
              onCreateVP={handleCreateVP}
              onCertifyVP={handleCertifyVP}
              activeRole={activeRole}
            />
          )}

          {activeTab === "reports" && activeProject && (
            <CommercialReports
              project={activeProject}
              boqItems={boqItems}
              variations={variations}
              procurement={procurement}
              vps={vps}
              risks={risks}
            />
          )}

          {activeTab === "chat" && activeProject && (
            <AIChatAssistant
              project={activeProject}
              messages={messages}
              onSendMessage={handleSendMessage}
              onResetChats={handleResetChats}
              activeRole={activeRole}
            />
          )}

          {activeTab === "admin" && (
            <AdminView
              audits={audits}
              activeRole={activeRole}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              onFlushDB={handleFlushDB}
            />
          )}
        </div>

      </main>

    </div>
  );
}
