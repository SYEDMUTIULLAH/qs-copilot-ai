import React, { useState, useRef } from "react";
import { CloudUpload, FileText, Calendar, User, Database, AlertCircle, CheckCircle2, ChevronRight, HardDrive, Trash2 } from "lucide-react";
import { QSDocument, QSProject, UserRole } from "../types";

interface DocumentsViewProps {
  documents: QSDocument[];
  project: QSProject;
  onAddDocument: (doc: any) => Promise<void>;
  activeRole: UserRole;
}

export default function DocumentsView({
  documents,
  project,
  onAddDocument,
  activeRole
}: DocumentsViewProps) {
  
  const [docType, setDocType] = useState<QSDocument["type"]>("CostX Excel");
  const [fileVersion, setFileVersion] = useState("v1.0");
  const [dragActive, setDragActive] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectDocs = documents.filter(d => d.projectId === project?.id);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      await simulateUpload(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await simulateUpload(file);
    }
  };

  const simulateFormUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadMessage({ type: "error", text: "Please select or drop a file to process." });
      return;
    }
    await simulateUpload(selectedFile);
  };

  const simulateUpload = async (file: File) => {
    try {
      setUploadMessage(null);
      // Simulate reading/parsing file with Tesseract/PaddleOCR rules virtually
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const randomExtracted = Math.floor(Math.random() * 150) + 20;

      await onAddDocument({
        projectId: project.id,
        name: file.name,
        type: docType,
        version: fileVersion,
        fileSize: sizeStr,
        extractedItemsCount: randomExtracted,
        uploadedBy: activeRole,
      });

      setUploadMessage({
        type: "success",
        text: `Successfully processed '${file.name}'. AI parsed & extracted ${randomExtracted} commercial records into workspace.`
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadMessage({ type: "error", text: "Failed to upload document into project storage." });
    }
  };

  const getTypeBadge = (type: QSDocument["type"]) => {
    switch (type) {
      case "Tender BOQ": return "bg-blue-500/10 text-blue-400 border-blue-500/25";
      case "CostX Excel": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/25";
      case "Previous VP": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/25";
      case "IFC Revision": return "bg-rose-500/10 text-rose-400 border-rose-500/25";
      case "Quotation": return "bg-purple-500/10 text-purple-400 border-purple-500/25";
      case "Specification": return "bg-amber-500/10 text-amber-500 border-amber-500/25";
      case "Invoice": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      default: return "bg-slate-700 text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Prime Header Block */}
      <div>
        <h2 className="text-sm font-bold text-slate-200">Commercial Document & Version Index</h2>
        <p className="text-xs text-slate-400">Manage, version, and upload commercial contracts, CostX logs, and IFC blueprints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Document Parser Section */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CloudUpload className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Intelligent OCR Parser</h3>
            </div>
            
            <p className="text-xs text-slate-500 font-medium">
              Drop spreadsheets or layouts here. Our background engine automatically extracts rates, bills of quantities, and revisions.
            </p>

            <form onSubmit={simulateFormUpload} className="space-y-4">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase font-bold mb-1">Document Classification</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-1.5 focus:border-blue-500 cursor-pointer"
                >
                  <option value="Tender BOQ">Tender BOQ Document</option>
                  <option value="CostX Excel">CostX Quantity Export</option>
                  <option value="IFC Revision">IFC Revision Blueprint</option>
                  <option value="Previous VP">Previous Valuations Payment</option>
                  <option value="Quotation">Material Quotation</option>
                  <option value="Specification">Technical Specification</option>
                  <option value="Invoice">Supplier Invoice</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase font-bold mb-1">Revision Level / Version tag</label>
                <input
                  type="text"
                  value={fileVersion}
                  onChange={(e) => setFileVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-1.5 focus:border-blue-500 font-mono"
                  placeholder="e.g. Rev 03, v1.2"
                />
              </div>

              {/* Drag/Drop Box */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "bg-cyan-500/10 border-cyan-500/60" 
                    : selectedFile 
                      ? "bg-slate-900 border-slate-700" 
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <Database className={`w-8 h-8 ${selectedFile ? "text-emerald-400" : "text-slate-500 animate-pulse"} mb-2`} />
                <p className="text-xs font-semibold text-slate-300">
                  {selectedFile ? selectedFile.name : "Drag & drop files here"}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Supports .XLSX, .CSV, .PDF, .XML (Max 100MB)
                </p>
              </div>

              {selectedFile && (
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-md transition-colors"
                >
                  Confirm Upload & Process OCR
                </button>
              )}
            </form>

            {uploadMessage && (
              <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                uploadMessage.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                {uploadMessage.type === "success" ? <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0" />}
                <p>{uploadMessage.text}</p>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-slate-800 mt-4 text-[10px] text-slate-500 font-medium">
            *Documents automatically feed into RAG (Retrieval Augmented Generation) context for the AI Chat Assistant panel.
          </div>
        </div>

        {/* List of Documents and Version History */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-5 rounded-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Vault Files and extracted catalogs</h3>
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" /> Total Items: {projectDocs.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-125 space-y-2">
            {projectDocs.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No documents uploaded. Drag-and-drop a Tender Contract Excel or CostX file to populate values.
              </div>
            ) : (
              projectDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-lg flex items-center justify-between hover:bg-slate-950/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-cyan-400">
                      <FileText className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200 leading-tight">{doc.name}</h4>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/5 px-1.5 rounded uppercase">
                          {doc.version}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 font-medium">
                        <span className={`text-[10px] font-bold border rounded px-1.5 py-0.2 ${getTypeBadge(doc.type)}`}>
                          {doc.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(doc.uploadDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {doc.uploadedBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-300 font-mono">{doc.fileSize}</span>
                    {doc.extractedItemsCount && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 mt-1 font-mono">
                        {doc.extractedItemsCount} lines parsed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
