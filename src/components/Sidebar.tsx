import React from "react";
import { 
  Building2, 
  Briefcase, 
  FileText, 
  GitCompare, 
  AlertTriangle, 
  ShoppingBag, 
  TrendingUp, 
  Coins, 
  FileSpreadsheet, 
  MessageSquare, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  Bell,
  Clock
} from "lucide-react";
import { UserRole, QSProject } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  projects: QSProject[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  unreadNotifications: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  unreadNotifications
}: SidebarProps) {
  
  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Building2 },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "variations", label: "AI Variation Engine", icon: GitCompare, highlight: true },
    { id: "procurement", label: "Procurement Alerts", icon: ShoppingBag },
    { id: "boq-tracker", label: "BOQ Consumption", icon: TrendingUp },
    { id: "vp-history", label: "VP Reconciliation", icon: Coins },
    { id: "reports", label: "Commercial Reports", icon: FileSpreadsheet },
    { id: "chat", label: "AI Chat Assistant", icon: MessageSquare, sparkle: true },
  ];

  const adminNavItems = [
    { id: "admin", label: "Audit Logs", icon: ShieldCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Colors based on roles
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "Admin": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Senior Quantity Surveyor": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Quantity Surveyor": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Planning Engineer": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Procurement Engineer": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Project Manager": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <aside className="w-68 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-850 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-500/25">
          <GitCompare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-md tracking-tight leading-none text-white">QS Copilot AI</h1>
          <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Commercial Brain</span>
        </div>
      </div>

      {/* Project Selector */}
      <div className="p-4 border-b border-slate-850/60">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">
          Active Workspace
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 px-3 text-xs text-slate-200 outline-none focus:border-blue-500 font-medium transition-colors"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name.length > 22 ? p.name.substring(0, 22) + "..." : p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Management Modules
        </span>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 group ${
                isActive
                  ? "bg-slate-800 text-white shadow-sm border-l-2 border-blue-500"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300"
              } ${item.sparkle ? "animate-pulse" : ""}`} />
              
              <span className="flex-1 text-left">{item.label}</span>

              {item.id === "procurement" && unreadNotifications > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadNotifications}
                </span>
              )}

              {item.sparkle && (
                <span className="bg-blue-600 text-white font-bold text-[8px] px-1 rounded-sm uppercase tracking-wide flex items-center gap-0.5 animate-bounce">
                  <Sparkles className="w-2 h-2" /> AI
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-6">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            System Administration
          </span>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm border-l-2 border-blue-500"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-500" : "text-slate-500"}`} />
                <span className="text-left">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Role Switcher & Profile Widget */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
            <Clock className="w-3 h-3 text-slate-500" /> Switch Live Role (RBAC)
          </div>
          <select
            value={activeRole}
            onChange={(e) => {
              setActiveRole(e.target.value as UserRole);
            }}
            className={`w-full border rounded-md py-1 px-2 text-[11px] outline-none font-bold transition-all cursor-pointer ${getRoleColor(activeRole)}`}
          >
            <option value="Admin">Admin (Access All)</option>
            <option value="Senior Quantity Surveyor">Senior QS (Audits & Claims)</option>
            <option value="Quantity Surveyor">QS (Claim Inputs)</option>
            <option value="Project Manager">Project Manager (VO Signoff)</option>
            <option value="Procurement Engineer">Procurement Eng (Stocks)</option>
            <option value="Planning Engineer">Planning Eng (IFC Upload)</option>
          </select>
        </div>

        {/* Profile Card */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs">
            {activeRole.split(" ").map(w => w[0]).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-100 truncate">Survey Executive</p>
            <p className="text-[10px] text-slate-500 truncate font-mono">mutip379@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
