import { 
  QSProject, 
  QSDocument, 
  BOQItem, 
  Variation, 
  VariationItem, 
  ProcurementAlert, 
  VPRecord, 
  RiskLog, 
  AuditLog, 
  ChatMessage,
  QSNotification
} from "../types";

// Seed/Initial Data
const DEFAULT_PROJECTS: QSProject[] = [
  {
    id: "p-1",
    name: "Al Thumama Commercial Hub Phase 2",
    contractNumber: "AT-CP-2026-09",
    client: "National Infrastructure Authority",
    consultant: "Triumph Design Partners",
    contractValue: 48500000,
    currency: "USD",
    startDate: "2026-01-15",
    completionDate: "2027-08-30",
    status: "Active"
  },
  {
    id: "p-2",
    name: "Burj Al Shabab Premium Hotel Interiors",
    contractNumber: "BASH-INT-2025-04",
    client: "Elegance Hospitality Group",
    consultant: "ArchiStudio Premium Eng",
    contractValue: 12400000,
    currency: "USD",
    startDate: "2025-06-01",
    completionDate: "2026-11-20",
    status: "Active"
  },
  {
    id: "p-3",
    name: "New Zayed Industrial Warehouse Complex",
    contractNumber: "NZ-IWC-0012",
    client: "Zayed Logistics Hubs",
    consultant: "Universal Structures consultancy",
    contractValue: 8900000,
    currency: "USD",
    startDate: "2026-03-10",
    completionDate: "2026-12-15",
    status: "Draft"
  }
];

const DEFAULT_DOCUMENTS: QSDocument[] = [
  {
    id: "doc-1",
    projectId: "p-1",
    name: "Tender_BOQ_Final_Signed.xlsx",
    type: "Tender BOQ",
    version: "v1.0",
    uploadDate: "2026-01-16T08:30:00Z",
    uploadedBy: "Senior QS (John)",
    fileSize: "14.2 MB",
    extractedItemsCount: 412
  },
  {
    id: "doc-2",
    projectId: "p-1",
    name: "CostX_Export_Reval_V4.xlsx",
    type: "CostX Excel",
    version: "v1.2",
    uploadDate: "2026-05-10T11:20:00Z",
    uploadedBy: "QS (Sarah)",
    fileSize: "8.7 MB",
    extractedItemsCount: 384
  },
  {
    id: "doc-3",
    projectId: "p-1",
    name: "IFC_Structural_Rev_03.pdf",
    type: "IFC Revision",
    version: "Rev 03",
    uploadDate: "2026-06-01T14:45:00Z",
    uploadedBy: "Planning Eng (Ahmed)",
    fileSize: "22.4 MB",
    extractedItemsCount: 15
  },
  {
    id: "doc-4",
    projectId: "p-1",
    name: "VP-11_Certified_Commercial_Record.xlsx",
    type: "Previous VP",
    version: "v11.0",
    uploadDate: "2026-05-25T09:12:00Z",
    uploadedBy: "SQS (John)",
    fileSize: "4.1 MB",
    extractedItemsCount: 180
  }
];

const DEFAULT_BOQ_ITEMS: BOQItem[] = [
  {
    id: "boq-1",
    projectId: "p-1",
    billRef: "D.01.1",
    description: "Provide & pour grade 40/20 concrete in foundation including consolidation, vibro-compaction & curing as per specs.",
    unit: "m3",
    originalQty: 14500,
    claimedQty: 11200,
    remainingQty: 3300,
    rate: 110,
    totalAmount: 1595000
  },
  {
    id: "boq-2",
    projectId: "p-1",
    billRef: "D.01.2",
    description: "High tensile steel reinforcement deformed bars grade 500 for foundations, cut, bent & tied in place.",
    unit: "ton",
    originalQty: 1250,
    claimedQty: 1280,
    remainingQty: -30,
    rate: 980,
    totalAmount: 1225000
  },
  {
    id: "boq-3",
    projectId: "p-1",
    billRef: "D.02.1",
    description: "Supply and pour concrete grade 30/20 in reinforced columns and shear walls up to third floor level.",
    unit: "m3",
    originalQty: 8900,
    claimedQty: 8400,
    remainingQty: 500,
    rate: 135,
    totalAmount: 1201500
  },
  {
    id: "boq-4",
    projectId: "p-1",
    billRef: "F.03.1",
    description: "Supply & install premium Italian grey marble floor tiles (600x600x20mm) including thick mortar bed & grouting.",
    unit: "m2",
    originalQty: 5400,
    claimedQty: 2500,
    remainingQty: 2900,
    rate: 85,
    totalAmount: 459000
  },
  {
    id: "boq-5",
    projectId: "p-1",
    billRef: "A.01.1",
    description: "Excavate in any soil except rock for basement and pile cap foundations, backfill with approved materials.",
    unit: "m3",
    originalQty: 42000,
    claimedQty: 42000,
    remainingQty: 0,
    rate: 12,
    totalAmount: 504000
  },
  {
    id: "boq-6",
    projectId: "p-2",
    billRef: "INT.01",
    description: "Custom designed walnut paneling system for lobby feature walls including structural timber framework and backing.",
    unit: "m2",
    originalQty: 1200,
    claimedQty: 950,
    remainingQty: 250,
    rate: 220,
    totalAmount: 264000
  },
  {
    id: "boq-7",
    projectId: "p-2",
    billRef: "INT.04",
    description: "Premium brass modular suspended chandeliers with LED light fixtures including master dimmer control integrations.",
    unit: "item",
    originalQty: 45,
    claimedQty: 12,
    remainingQty: 33,
    rate: 1540,
    totalAmount: 69300
  }
];

const DEFAULT_VARIATIONS: Variation[] = [
  {
    id: "v-1",
    projectId: "p-1",
    title: "Enlarged Underground Sump Sizing per Civil Defense",
    refNumber: "VO-02-ATPH2-MEP",
    status: "SqsApproved",
    variationValue: 245000,
    justification: "Client requested an update in civil defense parameters leading to larger firefighting water storage requirements. Under IFC Revision 03, overall sump foundation and concrete structures increased structurally.",
    claimSummary: "This variation includes additional excavation, concrete grade 40/20, additional reinforcement steel, and special epoxy internal lining.",
    createdDate: "2026-06-02T10:00:00Z",
    lastUpdated: "2026-06-12T15:30:00Z"
  },
  {
    id: "v-2",
    projectId: "p-1",
    title: "Premium Grade Lobby Marble Upgrades",
    refNumber: "VO-03-ATPH2-INT",
    status: "Pending",
    variationValue: 124500,
    justification: "Architect substituted standard Spanish marble with Statuario Italian white marble in premium customer lounge corridors.",
    claimSummary: "Replacement of item F.03.1. Net difference of 45 USD per m2 over 2,700 m2 including custom diamond polish sequence.",
    createdDate: "2026-06-10T16:20:00Z",
    lastUpdated: "2026-06-15T11:00:00Z"
  }
];

const DEFAULT_VARIATION_ITEMS: VariationItem[] = [
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
];

const DEFAULT_PROCUREMENT: ProcurementAlert[] = [
  {
    id: "pr-1",
    projectId: "p-1",
    materialName: "Grade 42.5 OPC Portland Cement",
    requiredQty: 4500,
    currentStock: 1200,
    shortage: 3300,
    recommendedOrderQty: 3500,
    priority: "High",
    status: "Pending Order",
    unit: "bags",
    boqItemRef: "D.01.1"
  },
  {
    id: "pr-2",
    projectId: "p-1",
    materialName: "Deformed Steel Reinforcement Bars (25mm)",
    requiredQty: 450,
    currentStock: 520,
    shortage: 0,
    recommendedOrderQty: 100,
    priority: "Low",
    status: "Delivered",
    unit: "ton",
    boqItemRef: "D.01.2"
  },
  {
    id: "pr-3",
    projectId: "p-1",
    materialName: "Italian Statuario White Marble slabs",
    requiredQty: 2700,
    currentStock: 250,
    shortage: 2450,
    recommendedOrderQty: 2700,
    priority: "Medium",
    status: "In Procurement",
    unit: "m2",
    boqItemRef: "F.03.1"
  },
  {
    id: "pr-4",
    projectId: "p-1",
    materialName: "Heavy Duty Epoxy Compound Protective Coating",
    requiredQty: 480,
    currentStock: 20,
    shortage: 460,
    recommendedOrderQty: 500,
    priority: "High",
    status: "Pending Order",
    unit: "liters",
    boqItemRef: "VO-02-ATPH2-MEP"
  }
];

const DEFAULT_VPS: VPRecord[] = [
  {
    id: "vp-1",
    projectId: "p-1",
    vpNumber: 10,
    claimDate: "2026-04-20",
    claimAmount: 1850000,
    approvedAmount: 1720000,
    rejectedAmount: 130000,
    status: "Paid",
    remainingBalance: 0,
    approvedDate: "2026-05-10",
    auditTrail: [
      "2026-04-20: Claim submitted by QS (Ahmed)",
      "2026-04-25: Internal audit completed by SQS (John)",
      "2026-05-02: Certified by triumph Partners Consultant (Paul)",
      "2026-05-10: Payment disbursed by client finance"
    ]
  },
  {
    id: "vp-2",
    projectId: "p-1",
    vpNumber: 11,
    claimDate: "2026-05-20",
    claimAmount: 2240000,
    approvedAmount: 2110000,
    rejectedAmount: 130000,
    status: "Certified",
    remainingBalance: 130000,
    approvedDate: "2026-06-12",
    auditTrail: [
      "2026-05-20: Claim submitted by QS (Sarah)",
      "2026-05-22: Backing structural reports uploaded",
      "2026-06-01: Corrected steel tonnage omissions adjusted by SQS",
      "2026-06-12: Certificate Signed for Approved Amount $2,110,000"
    ]
  },
  {
    id: "vp-3",
    projectId: "p-1",
    vpNumber: 12,
    claimDate: "2026-06-15",
    claimAmount: 1450000,
    approvedAmount: 0,
    rejectedAmount: 0,
    status: "Submitted",
    remainingBalance: 1450000,
    auditTrail: [
      "2026-06-15: Claim prepared by Automated CostX engine",
      "2026-06-15: Internal draft submitted to Client Portal"
    ]
  }
];

const DEFAULT_RISKS: RiskLog[] = [
  {
    id: "r-1",
    projectId: "p-1",
    title: "Steel reinforcement overrun in Grade 500 foundations",
    severity: "High",
    description: "Actual claimed Steel quantity (1,280 tons) is currently exceeding the contract original quantity (1,250 tons) by 30 tons without an signed variation order.",
    identifiedDate: "2026-06-12"
  },
  {
    id: "r-2",
    projectId: "p-1",
    title: "Pending marble premium rate agreement",
    severity: "Medium",
    description: "Substitute Italian white marble selection has been laid in corridor lobbies, but the variation order VO-03 is pending approved signed rate from architect.",
    identifiedDate: "2026-06-14"
  }
];

const DEFAULT_AUDITS: AuditLog[] = [
  {
    id: "a-1",
    projectId: "p-1",
    userId: "u-1",
    userName: "Johnathan Smith",
    userRole: "Senior Quantity Surveyor",
    action: "Approved Variation Draft",
    details: "Checked and authorized VO-02 underground sump pump sizing increase.",
    timestamp: "2026-06-12T14:22:00Z"
  }
];

const DEFAULT_CHATS: ChatMessage[] = [
  {
    id: "c-1",
    projectId: "p-1",
    role: "assistant",
    content: "Greetings! I am **QS Copilot AI**, your offline-capable Quantity Surveying brain. I am running 100% in-browser using local storage, disconnected from external mainframes. Ask about **'Show BOQ balance'**, **'Find missing items'**, or **'Explain VO-02'** to begin.",
    timestamp: "2026-06-17T04:15:00Z"
  }
];

// In-memory global store backed by localStorage 
interface AppDBState {
  projects: QSProject[];
  documents: QSDocument[];
  boqItems: BOQItem[];
  variations: Variation[];
  variationItems: VariationItem[];
  procurement: ProcurementAlert[];
  vps: VPRecord[];
  risks: RiskLog[];
  audits: AuditLog[];
  chats: ChatMessage[];
}

const STORAGE_KEYS = {
  PROJECTS: "qs_projects",
  DOCUMENTS: "qs_documents",
  BOQ_ITEMS: "qs_boq_items",
  VARIATIONS: "qs_variations",
  VARIATION_ITEMS: "qs_variation_items",
  PROCUREMENT: "qs_procurement",
  VPS: "qs_vps",
  RISKS: "qs_risks",
  AUDITS: "qs_audits",
  CHATS: "qs_chats"
};

const getStorageItem = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error("Localstorage load error:", e);
    return defaultVal;
  }
};

const setStorageItem = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Localstorage save error:", e);
  }
};

// INITIALIZE OFF-LINE DB IF EMPTY
export const initOfflineDB = (force = false) => {
  if (force || !localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    setStorageItem(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    setStorageItem(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
    setStorageItem(STORAGE_KEYS.BOQ_ITEMS, DEFAULT_BOQ_ITEMS);
    setStorageItem(STORAGE_KEYS.VARIATIONS, DEFAULT_VARIATIONS);
    setStorageItem(STORAGE_KEYS.VARIATION_ITEMS, DEFAULT_VARIATION_ITEMS);
    setStorageItem(STORAGE_KEYS.PROCUREMENT, DEFAULT_PROCUREMENT);
    setStorageItem(STORAGE_KEYS.VPS, DEFAULT_VPS);
    setStorageItem(STORAGE_KEYS.RISKS, DEFAULT_RISKS);
    setStorageItem(STORAGE_KEYS.AUDITS, DEFAULT_AUDITS);
    setStorageItem(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
  }
};

// LAZY LOAD FIRST
initOfflineDB(true);

// 1. Projects API
export const loadProjects = (): QSProject[] => {
  return getStorageItem<QSProject[]>(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
};

export const saveProjects = (projects: QSProject[]): void => {
  setStorageItem(STORAGE_KEYS.PROJECTS, projects);
};

// 2. Variations API
export const loadVariations = (): Variation[] => {
  return getStorageItem<Variation[]>(STORAGE_KEYS.VARIATIONS, DEFAULT_VARIATIONS);
};

export const saveVariations = (variations: Variation[]): void => {
  setStorageItem(STORAGE_KEYS.VARIATIONS, variations);
};

// 3. Other Core datasets
export const loadDocuments = (): QSDocument[] => {
  return getStorageItem<QSDocument[]>(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS);
};

export const saveDocuments = (docs: QSDocument[]): void => {
  setStorageItem(STORAGE_KEYS.DOCUMENTS, docs);
};

export const loadBOQItems = (): BOQItem[] => {
  return getStorageItem<BOQItem[]>(STORAGE_KEYS.BOQ_ITEMS, DEFAULT_BOQ_ITEMS);
};

export const saveBOQItems = (items: BOQItem[]): void => {
  setStorageItem(STORAGE_KEYS.BOQ_ITEMS, items);
};

export const loadVariationItems = (): VariationItem[] => {
  return getStorageItem<VariationItem[]>(STORAGE_KEYS.VARIATION_ITEMS, DEFAULT_VARIATION_ITEMS);
};

export const saveVariationItems = (items: VariationItem[]): void => {
  setStorageItem(STORAGE_KEYS.VARIATION_ITEMS, items);
};

export const loadProcurement = (): ProcurementAlert[] => {
  return getStorageItem<ProcurementAlert[]>(STORAGE_KEYS.PROCUREMENT, DEFAULT_PROCUREMENT);
};

export const saveProcurement = (proc: ProcurementAlert[]): void => {
  setStorageItem(STORAGE_KEYS.PROCUREMENT, proc);
};

export const loadVPs = (): VPRecord[] => {
  return getStorageItem<VPRecord[]>(STORAGE_KEYS.VPS, DEFAULT_VPS);
};

export const saveVPs = (vps: VPRecord[]): void => {
  setStorageItem(STORAGE_KEYS.VPS, vps);
};

export const loadRisks = (): RiskLog[] => {
  return getStorageItem<RiskLog[]>(STORAGE_KEYS.RISKS, DEFAULT_RISKS);
};

export const saveRisks = (risks: RiskLog[]): void => {
  setStorageItem(STORAGE_KEYS.RISKS, risks);
};

export const loadAudits = (): AuditLog[] => {
  return getStorageItem<AuditLog[]>(STORAGE_KEYS.AUDITS, DEFAULT_AUDITS);
};

export const saveAudits = (audits: AuditLog[]): void => {
  setStorageItem(STORAGE_KEYS.AUDITS, audits);
};

export const loadChats = (): ChatMessage[] => {
  return getStorageItem<ChatMessage[]>(STORAGE_KEYS.CHATS, DEFAULT_CHATS);
};

export const saveChats = (chats: ChatMessage[]): void => {
  setStorageItem(STORAGE_KEYS.CHATS, chats);
};

// AI OFFLINE REPLY SIMULATOR
export const getSimulatedReply = (
  msg: string, 
  project: QSProject, 
  boq: BOQItem[], 
  vos: Variation[], 
  vps: VPRecord[], 
  procurement: ProcurementAlert[], 
  risks: RiskLog[]
): string => {
  const q = msg.toLowerCase();
  
  if (q.includes("balance") || q.includes("boq") || q.includes("consumption") || q.includes("utilization")) {
    const steel = boq.find(b => b.billRef === "D.01.2");
    const concrete = boq.find(b => b.billRef === "D.01.1");
    return `### 📊 Contract BOQ Balance Review

Based on current commercial assessments for the active project **${project.name}**:
- Overall Bill of Quantities consumption rate is estimated around **81.5%**.
- **Critical Item Ref D.01.2 (Concrete Steel Reinforcement)** is currently overclaimed:
  - Original Tender Quantity: **1,250 tons**
  - Concurrently Claimed: **1,280 tons**
  - Status: 🔴 **Overrun of 30 tons (Exceeded budget allowance by 2.4%)**
  - Financial Cost Variance: **+$29,400** at rate $980/ton.
- **Ref D.01.1 (Grade 40/20 Concrete)**:
  - Original Tender Quantity: **14,500 m3**
  - Claimed/Consumed: **11,200 m3**
  - Remaining Balance: **3,300 m3 (22.7% unspent)**.

*Advisory Recommendation*: Request a freeze on reinforced steel submittals until an authorized Variation Order is verified and registered.`;
  }

  if (q.includes("missing") || q.includes("find missing") || q.includes("detector") || q.includes("audit")) {
    return `### 🔍 Missing Items & Discrepancy Survey

Our intelligent scanning module analyzed standard drawing metrics against your core Tender BOQ list and uncovered **2 rates anomalies**:

1. **New Sump Sizing Epoxy Waterproofing Protection**:
   - *Issue*: Core code MEP-EP-01 detected in design revision parameters has no corresponding rate items in the master Tender BOQ.
   - *Est. Volume*: **480 m2**.
   - *Suggested Rate*: **$35 / m2** (based on nearby standard benchmarks).
   - *Variance Severity*: 🔴 **High Priority** — potential delays to civil defense submittals.

2. **Corridor Italian White Marble Upgrades (Lobby Zone)**:
   - *Issue*: Italian marble grade substituted on layout plans, but F.03.1 pays only $85/m2 standard slate tiles.
   - *Est. Volume*: **2,700 m2**.
   - *Current Valuation State*: VO-03 is pending rate validation.

*Next Action*: Generate RFIs for supplier quotation submissions immediately.`;
  }

  if (q.includes("procurement") || q.includes("stock") || q.includes("cement") || q.includes("material") || q.includes("shortage")) {
    const activeShortages = procurement.filter(p => p.shortage > 0);
    return `### 🛒 Supply Chain Stock & Procurement Status

Analysis of connected material stocks indicates:
${activeShortages.map(p => `1. **${p.materialName}**:
   - Needed count: **${p.requiredQty} ${p.unit}**
   - Current stock count: **${p.currentStock} ${p.unit}**
   - Deficit shortfall: ⚠️ **${p.shortage} ${p.unit}**
   - Status: **${p.status}** | Priority: **${p.priority}**
   - Associated BOQ item: **${p.boqItemRef}**`).join("\n\n")}

*Recommendation*: Prioritize signing the purchase requisition for Portland cement bags as active grade concrete pouring requires sustained flow.`;
  }

  if (q.includes("valuation") || q.includes("vp") || q.includes("claims") || q.includes("payment") || q.includes("certify")) {
    return `### 💰 Interim Valuation & Payment Reconciliation

Interim claim performance analysis for **${project.name}**:
- Total Certified VPs to Date: **3 VPs**
- Gross Outstanding Claim prepared for current period: **$1,450,000** (VP-12 submittal draft).

**VP Audit Flow Status Trails:**
| Claims Certificate | Claimed Amount | Approved Amount | Discrepancy Log | Status |
|---|---|---|---|---|
| **VP-10** | $1,850,000 | $1,720,000 | $130,000 (Omissions) | **Paid** |
| **VP-11** | $2,240,000 | $2,110,000 | $130,000 (Steel adjustment) | **Certified** |
| **VP-12** (Latest) | $1,450,000 | *Certification Pending* | - | **Submitted** |

*Instruction*: Quantity Surveyors must log in as **Senior Quantity Surveyor** or **Project Manager** in settings to use the "Certify VP" functions directly.`;
  }

  return `### 🧠 QS Copilot AI Commercial Reasoning Brain

I have completed scanning the active project parameters for **${project.name}**. Here are the critical points to address:
- **1 Steel Item Overrun**: Ref D.01.2 has exceeded its tender limit by **+30 tons** (+$29,400 budget risk).
- **1 Large Design Variation**: VO-02 underground sump sizing alteration is pending client sign-off, valued at **+$245,000**.
- **Procurement Stock Gap**: Low stock alert for Portland cement is flagged. Shortage of **3,300 bags** threatens active casting works.

Ask me a custom question or try these suggested queries:
- **"Show BOQ balance"** — Check cost consumption patterns
- **"Find missing items"** — Survey potential omissions or drawing misfits
- **"Reconcile payment certificate"** — View certified VPs audit sheets
- **"Show material shortages"** — Audit cement and marble deficits`;
};
