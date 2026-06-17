import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  UserRole, 
  QSProject, 
  QSDocument, 
  BOQItem, 
  Variation, 
  VariationItem, 
  ProcurementAlert, 
  VPRecord, 
  RiskLog, 
  QSNotification, 
  AuditLog, 
  ChatMessage 
} from "./src/types";

// Setup storage path
const DATA_FILE = path.join(process.cwd(), ".qs_data.json");

// System-level default seed data
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
  // Concrete works
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
    claimedQty: 1280, // Overclaimed slightly (Highlight in view)
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
  // Finishes
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
  // Excavation
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
  // Burj Al Shabab Items
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
    recommendedOrderQty: 100, // safety buffer
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

const DEFAULT_NOTIFICATIONS: QSNotification[] = [
  {
    id: "n-1",
    projectId: "p-1",
    title: "High Shortage Alert",
    message: "Portland cement stock is low. Shortage of 3,300 bags detected for active concrete works.",
    timestamp: "2026-06-16T12:00:00Z",
    read: false,
    type: "procurement"
  },
  {
    id: "n-2",
    projectId: "p-1",
    title: "New Variation Drafted",
    message: "Sump pump variation VO-02 values generated. Estimated addition balance: $245,000.",
    timestamp: "2026-06-15T09:30:00Z",
    read: true,
    type: "variation"
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
    content: "Greetings! I am **QS Copilot AI**, your dedicated quantity surveying commercial brain. I'm connected to the Tender BOQs, claims database, and materials log. Type a request or ask a question such as **'Show BOQ balance'**, **'Find missing items'**, or **'Explain Variation VO-02'** to begin.",
    timestamp: "2026-06-17T04:15:00Z"
  }
];

// Helper to load/save database
interface DBState {
  projects: QSProject[];
  documents: QSDocument[];
  boqItems: BOQItem[];
  variations: Variation[];
  variationItems: VariationItem[];
  procurement: ProcurementAlert[];
  vps: VPRecord[];
  risks: RiskLog[];
  notifications: QSNotification[];
  audits: AuditLog[];
  chats: ChatMessage[];
}

function loadDB(): DBState {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse database, reloading defaults.", e);
    }
  }
  
  // Set default state
  const state: DBState = {
    projects: DEFAULT_PROJECTS,
    documents: DEFAULT_DOCUMENTS,
    boqItems: DEFAULT_BOQ_ITEMS,
    variations: DEFAULT_VARIATIONS,
    variationItems: DEFAULT_VARIATION_ITEMS,
    procurement: DEFAULT_PROCUREMENT,
    vps: DEFAULT_VPS,
    risks: DEFAULT_RISKS,
    notifications: DEFAULT_NOTIFICATIONS,
    audits: DEFAULT_AUDITS,
    chats: DEFAULT_CHATS
  };
  saveDB(state);
  return state;
}

function saveDB(state: DBState) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write database file:", e);
  }
}

// Lazy Initialize Gemini API client safely
let geminiClientCache: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClientCache) return geminiClientCache;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("PLACEHOLDER")) {
    console.log("No valid GEMINI_API_KEY detected. Gemini is operating in high-fidelity simulation mode.");
    return null;
  }

  try {
    geminiClientCache = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    return geminiClientCache;
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI. AI will fall back to simulation.", e);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API - Get entire DB (for bulk sync easily or debug)
  app.get("/api/db", (req, res) => {
    res.json(loadDB());
  });

  // REST endpoints
  // Projects
  app.get("/api/projects", (req, res) => {
    res.json(loadDB().projects);
  });

  app.post("/api/projects", (req, res) => {
    const db = loadDB();
    const newProj: QSProject = {
      id: "p-" + (db.projects.length + 1),
      name: req.body.name || "Untitled Project",
      contractNumber: req.body.contractNumber || "TBD",
      client: req.body.client || "TBD",
      consultant: req.body.consultant || "TBD",
      contractValue: Number(req.body.contractValue) || 1000000,
      currency: req.body.currency || "USD",
      startDate: req.body.startDate || new Date().toISOString().split("T")[0],
      completionDate: req.body.completionDate || new Date().toISOString().split("T")[0],
      status: req.body.status || "Draft"
    };

    db.projects.push(newProj);
    
    // Add default template BOQ items to newly created project
    const defaultTemplates: Partial<BOQItem>[] = [
      { billRef: "1.0", description: "Excavation and earthworks as per tender details and structural plans.", unit: "m3", originalQty: 5000, rate: 10 },
      { billRef: "2.0", description: "Grade 35 Reinforced concrete poured in main beams & ground slabs.", unit: "m3", originalQty: 2200, rate: 120 },
      { billRef: "3.1", description: "Tension high tensile reinforcement steel bars grade 460.", unit: "ton", originalQty: 180, rate: 950 },
      { billRef: "Fin-12", description: "Polished anti-skid porcelain floor tile assembly including preparation screeds.", unit: "m2", originalQty: 1500, rate: 45 }
    ];

    defaultTemplates.forEach((t, index) => {
      db.boqItems.push({
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

    // Logging
    db.audits.unshift({
      id: "audit-" + Date.now(),
      projectId: newProj.id,
      userId: req.body.userId || "user-1",
      userName: req.body.userName || "System Operator",
      userRole: req.body.userRole || "Admin",
      action: "Project Created",
      details: `Initialized project ${newProj.name} with standard contract items.`,
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newProj);
  });

  // Get single project items
  app.get("/api/projects/:id/boq", (req, res) => {
    const db = loadDB();
    const items = db.boqItems.filter(b => b.projectId === req.params.id);
    res.json(items);
  });

  // Submit claim change / consume quantity
  app.post("/api/boq/:id/claim", (req, res) => {
    const db = loadDB();
    const item = db.boqItems.find(b => b.id === req.params.id);
    if (!item) return res.status(404).json({ error: "BOQ item not found" });

    const claimDiff = Number(req.body.claimQty);
    item.claimedQty = claimDiff;
    item.remainingQty = item.originalQty - item.claimedQty;

    // Check trigger: if remaining Qty is negative (overrun), automatically spawn a high-priority risk log & notification!
    if (item.remainingQty < 0) {
      const riskExists = db.risks.some(r => r.projectId === item.projectId && r.title.includes(item.billRef));
      if (!riskExists) {
        const riskId = "r-" + Date.now();
        db.risks.unshift({
          id: riskId,
          projectId: item.projectId,
          title: `Contract Item Overrun Detected: Ref ${item.billRef}`,
          severity: "High",
          description: `Contract bill item Ref ${item.billRef} (${item.description}) has exceeded original contract quantity of ${item.originalQty} ${item.unit}. Currently claimed quantity: ${item.claimedQty} ${item.unit}. Budget overrun occurs without active variation.`,
          identifiedDate: new Date().toISOString().split("T")[0]
        });

        db.notifications.unshift({
          id: "n-" + Date.now(),
          projectId: item.projectId,
          title: "Overclaim Budget Alert!",
          message: `Ref ${item.billRef} has overrun by ${Math.abs(item.remainingQty)} ${item.unit}. Overrun flag turned red.`,
          timestamp: new Date().toISOString(),
          read: false,
          type: "vp"
        });
      }
    }

    db.audits.unshift({
      id: "audit-" + Date.now(),
      projectId: item.projectId,
      userId: req.body.userId || "u-1",
      userName: req.body.userName || "Operator",
      userRole: req.body.userRole || "Quantity Surveyor",
      action: "Updated Claim Claimed Quantity",
      details: `Set claimed quantity for BOQ Ref ${item.billRef} to ${item.claimedQty} ${item.unit}. Remaining balance is ${item.remainingQty} ${item.unit}.`,
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(item);
  });

  // Documents
  app.get("/api/documents", (req, res) => {
    res.json(loadDB().documents);
  });

  app.post("/api/documents", (req, res) => {
    const db = loadDB();
    const newDoc: QSDocument = {
      id: "doc-" + Date.now(),
      projectId: req.body.projectId || "p-1",
      name: req.body.name || "uploaded_specs.pdf",
      type: req.body.type || "Specification",
      version: req.body.version || "v1.0",
      uploadDate: new Date().toISOString(),
      uploadedBy: req.body.uploadedBy || "Quantity Surveyor",
      fileSize: req.body.fileSize || "4.5 MB",
      extractedItemsCount: req.body.extractedItemsCount || Math.floor(Math.random() * 50) + 10
    };

    db.documents.push(newDoc);

    // If it's a CostX upload, we notify and add some extra procurement or variation items!
    if (newDoc.type === "CostX Excel") {
      db.notifications.unshift({
        id: "n-doc-" + Date.now(),
        projectId: newDoc.projectId,
        title: "CostX Excel Imported",
        message: `Successfully processed model quantities from '${newDoc.name}'. Extracted ${newDoc.extractedItemsCount} commercial line items.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "system"
      });
    }

    db.audits.unshift({
      id: "audit-" + Date.now(),
      projectId: newDoc.projectId,
      userId: "u-1",
      userName: newDoc.uploadedBy,
      userRole: (req.body.userRole as UserRole) || "Quantity Surveyor",
      action: "Document Uploaded",
      details: `Uploaded ${newDoc.type} document: ${newDoc.name} (${newDoc.fileSize})`,
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newDoc);
  });

  // Variations
  app.get("/api/variations", (req, res) => {
    res.json(loadDB().variations);
  });

  app.get("/api/variations/:id/items", (req, res) => {
    const db = loadDB();
    const items = db.variationItems.filter(vi => vi.variationId === req.params.id);
    res.json(items);
  });

  // Create new Variation
  app.post("/api/variations", (req, res) => {
    const db = loadDB();
    const { projectId, title, refNumber, items, justification } = req.body;

    const totalValue = items.reduce((acc: number, item: any) => {
      const additionQty = item.ifcQty > item.tenderQty ? item.ifcQty - item.tenderQty : 0;
      const omissionQty = item.ifcQty < item.tenderQty ? item.tenderQty - item.ifcQty : 0;
      const netQty = additionQty - omissionQty;
      return acc + (netQty * item.rate);
    }, 0);

    const newVO: Variation = {
      id: "v-" + Date.now(),
      projectId: projectId || "p-1",
      title: title || "New Revised Scope Layout",
      refNumber: refNumber || `VO-REVISED-${Date.now().toString().slice(-4)}`,
      status: "Pending",
      variationValue: totalValue,
      justification: justification || "Required as per dynamic design coordinates modifications.",
      claimSummary: `Includes addition additions and omissions for design variation layout elements. Checked mathematically.`,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    db.variations.unshift(newVO);

    // Save variation items
    items.forEach((item: any, idx: number) => {
      const adQty = item.ifcQty > item.tenderQty ? item.ifcQty - item.tenderQty : 0;
      const omQty = item.ifcQty < item.tenderQty ? item.tenderQty - item.ifcQty : 0;
      db.variationItems.push({
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

    db.audits.unshift({
      id: "audit-" + Date.now(),
      projectId: newVO.projectId,
      userId: "u-1",
      userName: req.body.userName || "Senior QS",
      userRole: "Senior Quantity Surveyor",
      action: "Created Variation Order",
      details: `Generated VO ${newVO.refNumber} with value ${newVO.variationValue} based on IFC drawings.`,
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newVO);
  });

  // Approve Variation
  app.post("/api/variations/:id/approve", (req, res) => {
    const db = loadDB();
    const vo = db.variations.find(v => v.id === req.params.id);
    if (!vo) return res.status(404).json({ error: "Variation not found" });

    const { role, userName } = req.body;
    
    // Strict Role checking
    if (role !== "Admin" && role !== "Senior Quantity Surveyor" && role !== "Project Manager") {
      return res.status(403).json({ error: `Permission Denied: User role ${role} does not have variation approval rights.` });
    }

    if (role === "Project Manager") {
      vo.status = "ClientApproved";
    } else {
      vo.status = "SqsApproved";
    }
    
    vo.lastUpdated = new Date().toISOString();
    vo.approvedBy = userName || "Authorized QS Manager";

    // Create audit log
    db.audits.unshift({
      id: "audit-" + Date.now(),
      projectId: vo.projectId,
      userId: "u-1",
      userName: userName || "Manager",
      userRole: role,
      action: "Approved Variation",
      details: `Level approved VO ${vo.refNumber} status set to: ${vo.status}.`,
      timestamp: new Date().toISOString()
    });

    // Notify other roles
    db.notifications.unshift({
      id: "n-vo-" + Date.now(),
      projectId: vo.projectId,
      title: "Variation Signed Off",
      message: `${vo.refNumber} approved to state '${vo.status}' by ${vo.approvedBy}.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "variation"
    });

    saveDB(db);
    res.json(vo);
  });

  // Procurement alerts
  app.get("/api/procurement", (req, res) => {
    res.json(loadDB().procurement);
  });

  app.post("/api/procurement", (req, res) => {
    const db = loadDB();
    const newAlert: ProcurementAlert = {
      id: "pr-" + Date.now(),
      projectId: req.body.projectId || "p-1",
      materialName: req.body.materialName,
      requiredQty: Number(req.body.requiredQty) || 0,
      currentStock: Number(req.body.currentStock) || 0,
      shortage: Math.max(0, Number(req.body.requiredQty) - Number(req.body.currentStock)),
      recommendedOrderQty: Math.max(0, Number(req.body.requiredQty) - Number(req.body.currentStock)) + Math.floor(Math.random() * 50),
      priority: req.body.priority || "Medium",
      status: "Pending Order",
      unit: req.body.unit || "units",
      boqItemRef: req.body.boqItemRef
    };

    db.procurement.unshift(newAlert);
    saveDB(db);
    res.json(newAlert);
  });

  app.post("/api/procurement/:id/status", (req, res) => {
    const db = loadDB();
    const alert = db.procurement.find(p => p.id === req.params.id);
    if (!alert) return res.status(404).json({ error: "Procurement records not found" });

    alert.status = req.body.status;
    
    // Audit Action
    db.audits.unshift({
      id: "audit-" + Date.now(),
      projectId: alert.projectId,
      userId: "u-1",
      userName: req.body.userName || "Procurement Officer",
      userRole: "Procurement Engineer",
      action: "Updated Procurement status",
      details: `Steel/OPC Material '${alert.materialName}' status changed to '${alert.status}'.`,
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(alert);
  });

  // Valuations / VP records
  app.get("/api/vps", (req, res) => {
    res.json(loadDB().vps);
  });

  // Submit new Valuation claims
  app.post("/api/vps", (req, res) => {
    const db = loadDB();
    const latestVpNum = db.vps.reduce((max, r) => r.vpNumber > max ? r.vpNumber : max, 0);
    const newVp: VPRecord = {
      id: "vp-" + Date.now(),
      projectId: req.body.projectId || "p-1",
      vpNumber: latestVpNum + 1,
      claimDate: new Date().toISOString().split("T")[0],
      claimAmount: Number(req.body.claimAmount) || 120000,
      approvedAmount: 0,
      rejectedAmount: 0,
      status: "Submitted",
      remainingBalance: Number(req.body.claimAmount),
      auditTrail: [
        `${new Date().toISOString().split("T")[0]}: Claim VP-${latestVpNum + 1} generated & compiled by surveyor.`
      ]
    };

    db.vps.unshift(newVp);
    
    db.audits.unshift({
      id: "audit-" + Date.now(),
      projectId: newVp.projectId,
      userId: "u-1",
      userName: req.body.userName || "Sarah QS",
      userRole: "Quantity Surveyor",
      action: "Created Valuation Payment Claim",
      details: `Generated interim claim VP-${newVp.vpNumber} valuing $${newVp.claimAmount}.`,
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    res.json(newVp);
  });

  // Certify/Authorize VP
  app.post("/api/vps/:id/certify", (req, res) => {
    const db = loadDB();
    const vp = db.vps.find(v => v.id === req.params.id);
    if (!vp) return res.status(404).json({ error: "VP record not found" });

    const approved = Number(req.body.approvedAmount);
    const rejected = Math.max(0, vp.claimAmount - approved);
    const role = req.body.role || "Senior Quantity Surveyor";

    if (role !== "Admin" && role !== "Senior Quantity Surveyor" && role !== "Project Manager") {
      return res.status(403).json({ error: "Certification requires Senior QS or higher credentials." });
    }

    vp.status = "Certified";
    vp.approvedAmount = approved;
    vp.rejectedAmount = rejected;
    vp.remainingBalance = rejected;
    vp.approvedDate = new Date().toISOString().split("T")[0];
    vp.auditTrail.unshift(
      `${vp.approvedDate}: Authorized & certified by Senior QS and Consultant. Approved: $${approved}. Discrepancy: $${rejected}.`
    );

    db.audits.unshift({
      id: "audit-" + Date.now(),
      projectId: vp.projectId,
      userId: "u-1",
      userName: req.body.userName || "Senior Engineer",
      userRole: role as UserRole,
      action: "Certified Valuation Payment Claim",
      details: `Certified VP-${vp.vpNumber}. Claimed: $${vp.claimAmount}, Certified and Approved: $${vp.approvedAmount}.`,
      timestamp: new Date().toISOString()
    });

    db.notifications.unshift({
      id: "n-vp-" + Date.now(),
      projectId: vp.projectId,
      title: "VP Claim Certified",
      message: `Interim Valuation Payment VP-${vp.vpNumber} signed off at $${vp.approvedAmount} currency units.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "vp"
    });

    saveDB(db);
    res.json(vp);
  });

  // Risks
  app.get("/api/risks", (req, res) => {
    res.json(loadDB().risks);
  });

  app.post("/api/risks", (req, res) => {
    const db = loadDB();
    const newRisk: RiskLog = {
      id: "risk-" + Date.now(),
      projectId: req.body.projectId || "p-1",
      title: req.body.title || "Custom Commercial Risk",
      severity: req.body.severity || "Medium",
      description: req.body.description || "Incomplete contract rates documentation.",
      identifiedDate: new Date().toISOString().split("T")[0]
    };
    db.risks.unshift(newRisk);
    saveDB(db);
    res.json(newRisk);
  });

  // Audit Logs
  app.get("/api/audits", (req, res) => {
    res.json(loadDB().audits);
  });

  // Notifications
  app.get("/api/notifications", (req, res) => {
    res.json(loadDB().notifications);
  });

  app.post("/api/notifications/read", (req, res) => {
    const db = loadDB();
    db.notifications.forEach(n => n.read = true);
    saveDB(db);
    res.json({ success: true });
  });

  // AI Chat Assistant & Document Q&A (RAG) Setup
  app.post("/api/ai/chat", async (req, res) => {
    const { message, history, projectId } = req.body;
    const db = loadDB();

    // Store user message
    const userMsg: ChatMessage = {
      id: "c-user-" + Date.now(),
      projectId: projectId || "p-1",
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };
    db.chats.push(userMsg);

    const project = db.projects.find(p => p.id === (projectId || "p-1")) || db.projects[0];
    const projectBOQ = db.boqItems.filter(b => b.projectId === project.id);
    const projectProcurement = db.procurement.filter(p => p.projectId === project.id);
    const projectVariations = db.variations.filter(v => v.projectId === project.id);
    const projectVPs = db.vps.filter(v => v.projectId === project.id);
    const projectRisks = db.risks.filter(r => r.projectId === project.id);

    // Context formatting for commercial QS dataset
    const contextStr = `
Project Name: ${project?.name}
Contract Ref: ${project?.contractNumber}
Client: ${project?.client}
Consultant: ${project?.consultant}
Contract Value: $${project?.contractValue}

BOQ Items and claim statuses:
${projectBOQ.map(b => `- Ref ${b.billRef}: ${b.description}. Unit: ${b.unit}, Original Qty: ${b.originalQty}, Claimed Qty: ${b.claimedQty}, Rate: $${b.rate}, Total Amount: $${b.totalAmount}. Remaining Qty: ${b.remainingQty}`).join("\n")}

Active Variations:
${projectVariations.map(v => `- Ref ${v.refNumber}: ${v.title}. Status: ${v.status}, Value: $${v.variationValue}. Justification: ${v.justification}`).join("\n")}

Interim Valuation claims (VPs):
${projectVPs.map(vp => `- VP-${vp.vpNumber}: Date: ${vp.claimDate}, Amount Claimed: $${vp.claimAmount}, Approved: $${vp.approvedAmount}, Status: ${vp.status}`).join("\n")}

Procurement alerts and Material shortages:
${projectProcurement.map(pr => `- ${pr.materialName}: Required: ${pr.requiredQty} ${pr.unit}, Current Stock: ${pr.currentStock} ${pr.unit}, Shortage: ${pr.shortage} ${pr.unit}, Priority: ${pr.priority}, Status: ${pr.status}`).join("\n")}

Identified critical Commercial Risks:
${projectRisks.map(r => `- [${r.severity} Severity] ${r.title}: ${r.description}`).join("\n")}
`;

    const instructions = `You are QS Copilot AI, an expert Senior Commercial Quantity Surveyor (SQS) and construction technology automation assistant.
You possess profound knowledge of construction contracts, variation claims calculations, addition and omission rules, procurement alerts, interim valuations (VPs), and financial forecasting.

Use the provided commercial context below to intelligently answer the user's queries.
Always format your math work neatly in clear tables or markdown. Avoid developer jargon or terminal code representations. Speak like a professional commercial advisor.

Rules for variations & valuations:
1. If IFC quantities > Tender quantities, it indicates an "Addition".
2. If IFC quantities < Tender quantities, it indicates an "Omission".
3. Overruns (Claimed Qty > Contract Qty) without VO must be flagged in red or reported as extreme risks.

Context of active project:
${contextStr}
`;

    let reply = "";
    const ai = getGeminiClient();

    if (ai) {
      try {
        console.log("Routing chat request to Gemini model 'gemini-3.5-flash'...");
        
        // Structure conversation history for Gemini chat (must use { role: 'user' | 'model', parts: [{ text: ... }] })
        const formattedHistory = (history || []).slice(-10).map((h: any) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }]
        }));

        // Send content
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            ...formattedHistory,
            { role: "user", parts: [{ text: `${instructions}\n\nUser Question: ${message}` }] }
          ],
          config: {
            temperature: 0.2,
            topP: 0.95
          }
        });

        reply = response.text || "I processed your request, but could not read the AI response correctly.";
      } catch (err: any) {
        console.error("Gemini API Error occurred in request:", err);
        reply = `*(Notice: Handled falling back)* I encountered a connection issue with the central model api. Let me answer with local quantity surveying logic: 

${getSimulatedReply(message, project, projectBOQ, projectVariations, projectVPs, projectProcurement, projectRisks)}`;
      }
    } else {
      // High-fidelity fallback logic
      reply = getSimulatedReply(message, project, projectBOQ, projectVariations, projectVPs, projectProcurement, projectRisks);
    }

    const assistantMsg: ChatMessage = {
      id: "c-assistant-" + Date.now(),
      projectId: projectId || "p-1",
      role: "assistant",
      content: reply,
      timestamp: new Date().toISOString()
    };
    db.chats.push(assistantMsg);

    saveDB(db);
    res.json(assistantMsg);
  });

  // Simple clean/reset chats route
  app.post("/api/ai/chat/reset", (req, res) => {
    const db = loadDB();
    const projectId = req.body.projectId || "p-1";
    // Keep only the first message
    db.chats = DEFAULT_CHATS.map(c => ({ ...c, projectId }));
    saveDB(db);
    res.json(db.chats);
  });

  // Local Quantity Surveying Intelligent Replier (Fallback Sim)
  function getSimulatedReply(msg: string, project: any, boq: BOQItem[], vos: Variation[], vps: VPRecord[], procurement: ProcurementAlert[], risks: RiskLog[]): string {
    const q = msg.toLowerCase();
    
    if (q.includes("balance") || q.includes("boq") || q.includes("consumption")) {
      const steel = boq.find(b => b.billRef === "D.01.2");
      const concrete = boq.find(b => b.billRef === "D.01.1");
      return `### Contract BOQ Balance Review

Based on current commercial evaluations for **${project.name}**:
- Overall Bill of Quantities consumption rate is at **88.4%**.
- **Critical Bill Ref D.01.2 (Concrete Reinforcement Steel)** is currently in overrun status:
  - Original Tender Quantity: **1,250 tons**
  - Claimed/Consumed: **1,280 tons**
  - Status: 🔴 **Overrun of 30 tons (Over-claimed by 2.4%)**
  - Structural Cost Difference: **+$29,400** at rate $980/ton.
- **Ref D.01.1 (Grade 40/20 Concrete)**:
  - Original Tender Quantity: **14,500 m3**
  - Claimed/Consumed: **11,200 m3**
  - Remaining Balance: **3,300 m3 (22.7% unspent)**.

*Recommendation*: Instruct the QS on site to freeze further reinforced steel claims until a formally approved Variation Order is logged.`;
    }

    if (q.includes("missing") || q.includes("find missing") || q.includes("detector")) {
      return `### Missing Items Commercial Audit Report

Our scanning module analyzed the imported IFC plans against the core Contract Tender BOQ and found **2 missing items / items requiring rate valuation**:

1. **New Sump Internal Epoxy Waterproofing (Water Storage Area)**:
   - *Detail*: Code MEP-EP-01 detected in IFC drawings but has no corresponding rate in the Tender document.
   - *Estimated Quantity*: **480 m2**.
   - *Recommended Rate*: **$35 / m2** (based on region standard).
   - *Impact*: **High** - Risk of delayed civil defense clearance.

2. **Corridor statuario Italian White Marble Selection (Lobby Corridors)**:
   - *Detail*: Substitute rate for Italian Marble is missing. Current original contract code F.03.1 pays only for $85 standard grey tiles.
   - *Shortage Priority*: **Medium**.
   - *Shortage Volume*: **2,700 m2**.

*Actions Required*: Generate a formal Request for Proposal (RFP) to supply quotation submittals.`;
    }

    if (q.includes("procurement") || q.includes("stock") || q.includes("cement") || q.includes("material")) {
      return `### Procurement Warning & Stock Reconciliation

Our inventory trackers recorded the following critical events:
1. **Grade 42.5 OPC Portland Cement**:
   - Current Stock: **1,200 bags** on site.
   - Core Volume Required: **4,500 bags** (shortfall of **3,300 bags** detected).
   - Priority level: 🔴 **High**
   - Reorder recommendation: Raise batch purchase order for **3,500 bags** immediately to sustain the structural concrete concrete pouring schedule.

2. **Heavy Duty Epoxy Compound Protective Coating**:
   - Shortage: **460 L** shortage.
   - Recommended Order Quantity: **500 L**.
   - Status: **Pending Order**.`;
    }

    if (q.includes("generate vp") || q.includes("vp-12") || q.includes("valuation") || q.includes("history")) {
      return `### Interim Valuation claim Review: VP-12 Preparation

Our commercial engine assembled the draft parameters for **Payment Certificate VP-12**:
- Target Valuation Date: **June 15, 2026**
- Accumulated Gross Claim: **$1,450,000**
- Certified to Date (VP-01 to VP-11): **$3,830,000**
- Approved amount for immediate submittal: **Draft status**.

**VP historical Performance Metrics (Last 3 claims):**
| VP Ref | Submittal Date | Claim Amount | Approved/Certified | Status | Remaining Balance / Rejections |
|---|---|---|---|---|---|
| **VP-10** | April 20, 2026 | $1,850,000 | $1,720,000 | **Paid** | $130,000 (Adjusted Steel) |
| **VP-11** | May 20, 2026 | $2,240,000 | $2,110,000 | **Certified** | $130,000 (Consultant Omissions) |
| **VP-12** | June 15, 2026 | $1,450,000 | *Review Pending* | **Submitted** | $1,450,000 (Current Bill) |

*Action plan*: Role **Senior Quantity Surveyor** credentials are required to click the "Certify Approval" to confirm the final authorized payment for this month.`;
    }

    return `### QS Copilot AI Commercial Intelligence

I am actively monitoring the civil, electrical, finishings, and structural contracts of **${project.name}**.
I noticed:
- **1 Active Budget Overrun**: Reinforcement bars (Steel) are **over-claimed by 30 tons** (+$29,400 cost impact).
- **1 Pending high-value design variation**: Enlarged Underground Sump Sizing **VO-02-ATPH2-MEP** is pending Client approval, valued at **+$245,000**.
- **Material Shortage**: Cement stock is critically low. Shortage of **3,300 bags** threatens the timeline.

Type a targeted question:
- *'Show BOQ balance'*
- *'Find missing items'*
- *'Prepare procurement report'*
- *'Verify Variation claims'*`;
  }

  // Vite + Express full-stack dynamic serving code
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QS Copilot AI Server successfully booted on http://localhost:${PORT}`);
  });
}

startServer();
