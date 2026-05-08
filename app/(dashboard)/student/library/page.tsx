'use client';

import {
  Library, Search, BookOpen, User, Loader2, Filter,
  Clock, Target, BarChart3, Globe, Eye, Users, Lock, X, Plus, Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import QuizPreviewEngine from "@/app/(dashboard)/teacher/quizzes/components/QuizPreview";

interface LibraryQuiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  passingScore: number;
  creator: { id: string; name: string | null; role: string };
  _count: { questions: number };
  createdAt: string;
}

const DIFF_COLOR: Record<string, string> = {
  Easy: "text-green-500 bg-green-500/10",
  Medium: "text-orange-500 bg-orange-500/10",
  Hard: "text-red-500 bg-red-500/10",
};

const CATEGORIES = ["All", "Science", "History", "Mathematics", "English", "Technology", "Geography", "Art", "Programing", "Web", "Database", "General"];

export default function LibraryPage() {
  const [quizzes, setQuizzes] = useState<LibraryQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [previewQuiz, setPreviewQuiz] = useState<any | null>(null);

  // Report modal
  const [reportQuiz, setReportQuiz] = useState<LibraryQuiz | null>(null);
  const [reportReason, setReportReason] = useState("Inappropriate");
  const [reportDesc, setReportDesc] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportDone, setReportDone] = useState<string | null>(null); // quizId đã report

  // Study group mini-modal
  const [sgQuiz, setSgQuiz] = useState<LibraryQuiz | null>(null);
  const [sgTitle, setSgTitle] = useState("");
  const [sgPublic, setSgPublic] = useState(true);
  const [sgCreating, setSgCreating] = useState(false);
  const [sgError, setSgError] = useState("");

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (search.trim()) params.set("q", search.trim());
    const res = await fetch(`/api/library?${params}`);
    if (res.ok) setQuizzes(await res.json());
    setLoading(false);
  }, [search, category]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchQuizzes(), 300);
    return () => clearTimeout(timeout);
  }, [fetchQuizzes]);

  const openReportModal = (quiz: LibraryQuiz) => {
    setReportQuiz(quiz);
    setReportReason("Inappropriate");
    setReportDesc("");
    setReportError("");
  };

  const handleReport = async () => {
    if (!reportQuiz) return;
    setReportLoading(true);
    setReportError("");
    const res = await fetch("/api/student/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: reportQuiz.id, reason: reportReason, description: reportDesc }),
    });
    setReportLoading(false);
    if (res.ok) {
      setReportDone(reportQuiz.id);
      setReportQuiz(null);
    } else {
      const err = await res.json().catch(() => ({}));
      setReportError(err.message ?? "Failed to submit report");
    }
  };

  const openSgModal = (quiz: LibraryQuiz) => {
    setSgQuiz(quiz);
    setSgTitle(`${quiz.title} - Study Group`);
    setSgPublic(true);
    setSgError("");
  };

  const handleCreateSg = async () => {
    if (!sgQuiz || !sgTitle.trim()) return;
    setSgCreating(true);
    setSgError("");
    try {
      const res = await fetch("/api/student/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: sgQuiz.id, title: sgTitle.trim(), isPublic: sgPublic, invitedEmails: [] }),
      });
      if (res.ok) {
        setSgQuiz(null);
        window.location.href = "/student/study-group";
      } else {
        const err = await res.json().catch(() => ({}));
        setSgError(err.message ?? "Failed to create study group");
      }
    } finally {
      setSgCreating(false);
    }
  };

  if (previewQuiz) {
    return <QuizPreviewEngine quiz={previewQuiz} onExit={() => setPreviewQuiz(null)} />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Library size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Library</h1>
            <p className="text-muted-foreground text-sm">Public quizzes from teachers and students</p>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2.5 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-primary/20"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* RESULTS */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Library size={48} className="mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            No public quizzes found. Try a different search or category.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{quizzes.length}</span> quiz{quizzes.length !== 1 ? "zes" : ""} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                          DIFF_COLOR[quiz.difficulty]
                        )}>
                          {quiz.difficulty}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-green-500/10 text-green-500 flex items-center gap-1">
                          <Globe size={8} /> Public
                        </span>
                        {quiz.creator.role === "TEACHER" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-500/10 text-blue-500">
                            Teacher
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base leading-tight group-hover:text-primary transition line-clamp-2">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{quiz.category}</p>
                    </div>
                  </div>

                  {quiz.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{quiz.description}</p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium flex-wrap">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} /> {quiz._count.questions} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {quiz.timeLimit} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Target size={12} /> Pass: {quiz.passingScore}%
                    </span>
                  </div>

                  {/* Creator */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User size={11} />
                    <span>{quiz.creator.name ?? "Unknown"}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BarChart3 size={12} />
                    <span>{quiz._count.questions} Qs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openReportModal(quiz)}
                      disabled={reportDone === quiz.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                      title={reportDone === quiz.id ? "Already reported" : "Report this quiz"}
                    >
                      <Flag size={12} /> {reportDone === quiz.id ? "Reported" : "Report"}
                    </button>
                    <button
                      onClick={() => openSgModal(quiz)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-bold hover:bg-secondary transition text-muted-foreground"
                      title="Create a study group with this quiz"
                    >
                      <Users size={12} /> Practice
                    </button>
                    <button
                      disabled={quiz._count.questions === 0}
                      onClick={async () => {
                        const res = await fetch(`/api/quizzes/${quiz.id}`);
                        if (res.ok) setPreviewQuiz(await res.json());
                      }}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      title={quiz._count.questions === 0 ? "No questions yet" : "Preview this quiz"}
                    >
                      <Eye size={12} /> Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── REPORT MODAL ─────────────────────────────────────────────── */}
      {reportQuiz && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-bold flex items-center gap-2 text-red-500"><Flag size={16} /> Report Quiz</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{reportQuiz.title}</p>
              </div>
              <button onClick={() => setReportQuiz(null)} className="p-1.5 hover:bg-secondary rounded-lg transition"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              {reportError && (
                <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{reportError}</p>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  {["Inappropriate", "Spam", "Incorrect Content", "Other"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Additional details (optional)</label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                />
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3">
              <button onClick={() => setReportQuiz(null)} className="px-4 py-2 text-sm font-semibold hover:bg-secondary rounded-lg transition">Cancel</button>
              <button
                onClick={handleReport}
                disabled={reportLoading}
                className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:opacity-90 transition disabled:opacity-60"
              >
                {reportLoading ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STUDY GROUP MINI-MODAL ───────────────────────────────────── */}
      {sgQuiz && (
        <div className="fixed inset-0 z-100 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Users size={18} className="text-primary" /> Create Study Group
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  Quiz: <span className="font-semibold text-foreground">{sgQuiz.title}</span>
                </p>
              </div>
              <button onClick={() => setSgQuiz(null)} className="p-2 hover:bg-secondary rounded-full transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {sgError && (
                <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{sgError}</p>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Session Title</label>
                <input
                  value={sgTitle}
                  onChange={(e) => setSgTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateSg()}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  autoFocus
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Who Can Join</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSgPublic(true)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition",
                      sgPublic ? "border-green-500 bg-green-500/10 text-green-500" : "border-border text-muted-foreground hover:border-green-500/40"
                    )}
                  >
                    <Globe size={14} /> Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setSgPublic(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition",
                      !sgPublic ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Lock size={14} /> Invite Only
                  </button>
                </div>
                {!sgPublic && (
                  <p className="text-[11px] text-muted-foreground">
                    You can add invited emails after creating the group in Study Groups.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button onClick={() => setSgQuiz(null)} className="px-5 py-2.5 text-sm font-semibold hover:bg-secondary rounded-xl transition">
                Cancel
              </button>
              <button
                onClick={handleCreateSg}
                disabled={sgCreating || !sgTitle.trim()}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2 text-sm"
              >
                {sgCreating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Create & Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
