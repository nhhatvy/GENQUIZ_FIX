'use client';

import {
  MoreVertical, Search, Flag, CheckCircle2,
  XCircle, Eye, Loader2, BookOpen, X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  priority: "High" | "Medium" | "Low";
  createdAt: string;
  quiz: { id: string; title: string; category: string };
  reporter: { id: string; name: string | null; avatarUrl: string | null };
}

const TABS = ["All Reports", "Pending", "Resolved", "Rejected"];

export default function ReportsManagementPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Reports");
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [detailReport, setDetailReport] = useState<Report | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "All Reports") params.set("status", activeTab);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/reports?${params}`);
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }, [activeTab, search]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => {
    const t = setTimeout(() => fetchReports(), 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (report: Report, action: "resolve" | "reject") => {
    setActiveMenu(null);
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: report.id, action }),
    });
    if (res.ok) {
      showToast(action === "resolve" ? "Report marked as resolved" : "Report rejected");
      fetchReports();
    } else {
      showToast("Action failed", "error");
    }
  };

  const priorityStyle = (p: string) => {
    if (p === "High") return "bg-red-500/10 text-red-500";
    if (p === "Medium") return "bg-blue-500/10 text-blue-500";
    return "bg-secondary text-muted-foreground";
  };

  const statusDot = (s: string) => {
    if (s === "Resolved") return "bg-green-500";
    if (s === "Rejected") return "bg-red-500";
    return "bg-orange-500";
  };

  const avatarFallback = (name: string | null) =>
    (name ?? "?").charAt(0).toUpperCase();

  return (
    <div className="space-y-6 relative">
      {/* Overlay */}
      {(activeMenu !== null || detailReport !== null) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setActiveMenu(null); }} />
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in fade-in slide-in-from-bottom-4",
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        )}>
          {toast.msg}
        </div>
      )}

      {/* Detail Modal */}
      {detailReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Flag size={16} className="text-red-500" /> Report Details
              </h3>
              <button onClick={() => setDetailReport(null)} className="p-1.5 hover:bg-secondary rounded-lg transition cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quiz</span>
                <span className="font-semibold text-foreground text-right max-w-[60%]">{detailReport.quiz.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{detailReport.quiz.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reporter</span>
                <span className="font-medium">{detailReport.reporter.name ?? "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded", priorityStyle(detailReport.priority))}>
                  {detailReport.reason}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{detailReport.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(detailReport.createdAt).toLocaleDateString("en-GB")}</span>
              </div>
              {detailReport.description && (
                <div className="space-y-1 pt-2 border-t border-border">
                  <span className="text-muted-foreground">Description</span>
                  <p className="text-foreground bg-secondary/50 rounded-lg p-3 text-xs leading-relaxed">{detailReport.description}</p>
                </div>
              )}
            </div>
            {detailReport.status === "Pending" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { handleAction(detailReport, "resolve"); setDetailReport(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg bg-green-600 text-white hover:opacity-90 transition cursor-pointer"
                >
                  <CheckCircle2 size={14} /> Resolve
                </button>
                <button
                  onClick={() => { handleAction(detailReport, "reject"); setDetailReport(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg bg-red-500 text-white hover:opacity-90 transition cursor-pointer"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">Review and handle quiz violation reports</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-border bg-card shadow-2xl transition-colors duration-300">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Violation Reports</h2>
            <p className="text-muted-foreground text-sm">Monitor and resolve community issues</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex p-1 bg-secondary/50 rounded-lg border border-border w-fit">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm transition font-medium",
                    activeTab === tab ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by quiz, reporter or reason..."
                className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-72"
              />
            </div>
          </div>

          {/* Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                  <th className="px-4 py-4 font-semibold">Reason</th>
                  <th className="px-4 py-4 font-semibold">Reporter</th>
                  <th className="px-4 py-4 font-semibold">Reported Quiz</th>
                  <th className="px-4 py-4 font-semibold text-center">Priority</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center"><Loader2 size={24} className="animate-spin text-muted-foreground mx-auto" /></td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">No reports found</td></tr>
                ) : reports.map((report) => (
                  <tr key={report.id} className="group hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", report.priority === "High" ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500")}>
                          <Flag size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground leading-none">{report.reason}</span>
                          <span className="text-[11px] text-muted-foreground mt-1">{new Date(report.createdAt).toLocaleDateString("en-GB")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-border flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                          {report.reporter.avatarUrl
                            ? <img src={report.reporter.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : avatarFallback(report.reporter.name)
                          }
                        </div>
                        <span className="text-sm font-medium text-foreground/80">{report.reporter.name ?? "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <BookOpen size={13} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground/80 line-clamp-1">{report.quiz.title}</p>
                          <p className="text-[11px] text-muted-foreground">{report.quiz.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded", priorityStyle(report.priority))}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusDot(report.status),
                          report.status === "Pending" && "shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                        )} />
                        <span className="text-sm font-medium text-foreground/80">{report.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === report.id ? null : report.id)}
                        className={cn(
                          "p-1.5 rounded-md transition-all cursor-pointer",
                          activeMenu === report.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenu === report.id && (
                        <div className="absolute right-4 top-12 w-48 rounded-xl border border-border bg-popover shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => { setDetailReport(report); setActiveMenu(null); }}
                            className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer font-medium"
                          >
                            <Eye size={14} /> View Details
                          </button>
                          {report.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleAction(report, "resolve")}
                                className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors cursor-pointer font-medium"
                              >
                                <CheckCircle2 size={14} /> Mark as Resolved
                              </button>
                              <div className="my-1 border-t border-border" />
                              <button
                                onClick={() => handleAction(report, "reject")}
                                className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer font-medium"
                              >
                                <XCircle size={14} /> Reject Report
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
