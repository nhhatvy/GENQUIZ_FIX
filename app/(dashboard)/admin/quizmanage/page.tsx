'use client';

import {
  MoreVertical, Search, Trash2, ExternalLink,
  ShieldCheck, Funnel, ChevronDown, BookOpen, Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Quiz {
  id: string;
  title: string;
  category: string;
  status: string;
  visibility: string;
  createdAt: string;
  creator: { id: string; name: string | null };
  _count: { questions: number; reports: number };
}

const TABS = ["All Quizzes", "Reported", "Drafts"];

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Quizzes");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Quiz | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "All Quizzes") params.set("tab", activeTab);
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const res = await fetch(`/api/admin/quizzes?${params}`);
    if (res.ok) {
      const data = await res.json();
      setQuizzes(data.quizzes);
      setCategories(data.categories);
    }
    setLoading(false);
  }, [activeTab, search, category]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  useEffect(() => {
    const t = setTimeout(() => fetchQuizzes(), 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleVisibility = async (quiz: Quiz) => {
    setActiveMenu(null);
    const res = await fetch("/api/admin/quizzes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: quiz.id, action: "toggleVisibility" }),
    });
    if (res.ok) {
      showToast(`Visibility changed to ${quiz.visibility === "Public" ? "Private" : "Public"}`);
      fetchQuizzes();
    } else {
      showToast("Failed to change visibility", "error");
    }
  };

  const handleDelete = async (quiz: Quiz) => {
    setConfirmDelete(null);
    const res = await fetch(`/api/admin/quizzes?quizId=${quiz.id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Quiz deleted");
      fetchQuizzes();
    } else {
      showToast("Failed to delete quiz", "error");
    }
  };

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">

      {/* Overlay */}
      {(activeMenu !== null || catOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setActiveMenu(null); setCatOpen(false); }} />
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

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-foreground">Delete Quiz</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{confirmDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-secondary transition cursor-pointer font-medium">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-5 py-2 text-sm rounded-lg bg-red-500 text-white hover:opacity-90 transition font-bold cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Quiz Management</h2>
        <p className="text-muted-foreground mt-1 text-sm">Monitor all quizzes and handle community reports</p>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="p-6 space-y-6">
          <div className="border-b border-border/50 pb-4">
            <h2 className="text-xl font-semibold text-foreground">Content Directory</h2>
            <p className="text-muted-foreground text-sm font-medium">Review and moderate quiz content</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex p-1 bg-secondary/50 rounded-lg border border-border w-fit">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-semibold transition",
                    activeTab === tab ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search quiz title or author..."
                  className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setCatOpen((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition cursor-pointer"
                >
                  <Funnel size={16} />
                  {category || "Category"}
                  <ChevronDown size={14} className={cn("transition-transform", catOpen && "rotate-180")} />
                </button>
                {catOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-popover border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => { setCategory(""); setCatOpen(false); }}
                      className={cn("w-full text-left px-4 py-2 text-sm transition font-medium", !category ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary")}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setCategory(c); setCatOpen(false); }}
                        className={cn("w-full text-left px-4 py-2 text-sm transition font-medium", category === c ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-muted-foreground text-xs font-semibold uppercase border-b border-border">
                  <th className="px-4 py-4">Quiz</th>
                  <th className="px-4 py-4">Author</th>
                  <th className="px-4 py-4 text-center">Questions</th>
                  <th className="px-4 py-4 text-center">Reports</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Visibility</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Loader2 size={24} className="animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : quizzes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm">No quizzes found</td>
                  </tr>
                ) : quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                          <BookOpen size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">{quiz.title}</span>
                          <span className="text-xs text-muted-foreground">{quiz.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-foreground/80">
                      {quiz.creator.name ?? "Unknown"}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium">
                      {quiz._count.questions}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        quiz._count.reports > 0 ? "bg-red-500/10 text-red-500" : "text-muted-foreground"
                      )}>
                        {quiz._count.reports > 0 ? `${quiz._count.reports} Reports` : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={quiz.status === "Published"
                            ? { backgroundColor: "#22c55e" }
                            : { backgroundColor: "#facc15", boxShadow: "0 0 6px rgba(250,204,21,0.7)" }
                          }
                        />
                        <span className="text-xs font-semibold uppercase">{quiz.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        quiz.visibility === "Public" ? "bg-green-500/10 text-green-500" : "bg-secondary text-muted-foreground"
                      )}>
                        {quiz.visibility}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === quiz.id ? null : quiz.id)}
                        className={cn(
                          "p-1.5 rounded-md transition cursor-pointer",
                          activeMenu === quiz.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenu === quiz.id && (
                        <div className="absolute right-4 top-12 w-52 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100">
                          <a
                            href={`/admin/quizzes/${quiz.id}`}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition cursor-pointer"
                            onClick={() => setActiveMenu(null)}
                          >
                            <ExternalLink size={14} />
                            View Quiz
                          </a>
                          <button
                            onClick={() => handleToggleVisibility(quiz)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary transition cursor-pointer"
                          >
                            <ShieldCheck size={14} />
                            {quiz.visibility === "Public" ? "Set Private" : "Set Public"}
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => { setConfirmDelete(quiz); setActiveMenu(null); }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                            Delete Quiz
                          </button>
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
