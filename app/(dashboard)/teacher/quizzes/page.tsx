"use client";

import {
  BookOpen, Copy, Edit2, Eye,
  MoreVertical, Search, Trash2, Plus,
  CheckCircle2, CalendarClock, Loader2, Globe, Lock, Sparkles,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/app/_components/ConfirmModal";
import { cn } from "@/lib/utils";
import QuizAnalytics from "./components/QuizAnalytics";
import QuizCreator from "@/app/_components/quiz-creator";
import QuizPreviewEngine from "./components/QuizPreview";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  passingScore: number;
  status: "Draft" | "Published";
  visibility: string;
  creationMethod: "MANUAL" | "AI";
  createdAt: string;
  _count: { questions: number };
};

const DIFFICULTY_COLOR = {
  Easy: "text-green-500",
  Medium: "text-orange-500",
  Hard: "text-red-500",
};

export default function QuizPage() {
  const router = useRouter();
  const { confirmModal, askConfirm } = useConfirm();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCreated, setLastCreated] = useState<Quiz | null>(null);
  const [activeTab, setActiveTab] = useState("All Quizzes");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearch(searchQuery.trim());
  }, 300);
  return () => clearTimeout(handler);
}, [searchQuery]);

useEffect(() => {
  setPage(1);
}, [debouncedSearch, activeTab]);

 const fetchQuizzes = useCallback(async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: debouncedSearch, 
      tab: activeTab 
    });

    const res = await fetch(`/api/quizzes?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setQuizzes(data.quizzes || []);
      setTotalPages(data.metadata?.totalPages || 1);
    }
  } catch (e) {
    console.error("Fetch Error:", e);
  } finally {
    setLoading(false);
  }
}, [page, limit, debouncedSearch, activeTab]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleFinish = (quiz: Quiz) => {
    setIsCreating(false);
    setLastCreated(quiz);
    setShowSuccess(true);
    fetchQuizzes();
  };

  const handleDelete = async (id: string) => {
    if (!await askConfirm("Delete this quiz?", { title: "Delete Quiz", confirmText: "Delete", variant: "danger" })) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
      if (res.ok) setQuizzes((qs) => qs.filter((q) => q.id !== id));
    } finally {
      setDeletingId(null);
      setActiveMenu(null);
    }
  };

  const handlePreview = async (quiz: Quiz) => {
    setActiveMenu(null);
    const res = await fetch(`/api/quizzes/${quiz.id}`);
    if (res.ok) setPreviewQuiz(await res.json());
  };

  const handleDuplicate = async (quiz: Quiz) => {
    setActiveMenu(null);
    const res = await fetch(`/api/quizzes/${quiz.id}`);
    if (!res.ok) return;
    const full = await res.json();
    const payload = {
      title: `Copy of ${full.title}`,
      description: full.description,
      category: full.category,
      difficulty: full.difficulty,
      timeLimit: full.timeLimit,
      passingScore: full.passingScore,
      status: "Draft",
      questions: full.questions.map((q: any) => ({
        text: q.text,
        type: q.type,
        points: q.points,
        options: q.options.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect })),
      })),
    };
    const dup = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (dup.ok) fetchQuizzes();
  };
  const view =
  viewingQuiz ? "analytics"
  : previewQuiz ? "preview"
  : showSuccess ? "success"
  : isCreating ? "create"
  : "list";

  if (showSuccess && lastCreated) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">
            {lastCreated.status === "Draft" ? "Draft Saved!" : "Quiz Published!"}
          </h2>
          <p className="text-muted-foreground">
            "{lastCreated.title}" has been saved successfully.
          </p>
        </div>
        <div className="grid gap-4 pt-4 text-left">
          {lastCreated.status === "Published" && (
            <button
              onClick={() => router.push(`/teacher/events?quizId=${lastCreated.id}`)}
              className="flex items-center gap-4 p-6 border-2 border-primary bg-primary/5 rounded-2xl hover:bg-primary/10 transition group"
            >
              <CalendarClock className="text-primary group-hover:scale-110 transition" size={32} />
              <div>
                <p className="font-bold text-lg">Assign as Test (Schedule)</p>
                <p className="text-xs text-muted-foreground">Schedule quiz for students</p>
              </div>
            </button>
          )}
          <button
            onClick={() => setShowSuccess(false)}
            className="p-4 text-muted-foreground hover:text-foreground text-sm font-medium transition"
          >
            Back to My Library
          </button>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="container py-10">
        <QuizCreator onClose={() => setIsCreating(false)} onFinish={handleFinish} />
      </div>
    );
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const displayQuizzes = quizzes;
  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 relative">
      {confirmModal}
      {activeMenu !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quizzes</h2>
          <p className="text-muted-foreground mt-1 text-sm">Create, manage and analyze your quizzes</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition"
        >
          <Plus size={16} /> Create New Quiz
        </button>
      </div>

      {/* Library */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">Quiz Library</h2>
          <p className="text-muted-foreground text-sm">Browse and manage all your quizzes</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex p-1 bg-secondary/50 rounded-lg border border-border w-fit">
            {["All Quizzes", "Published", "Drafts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-semibold transition",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quizzes..."
                className="bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition w-full md:w-60"
              />
            </div>
          </div>
        </div>

        {/* Quiz list */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : displayQuizzes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {quizzes.length === 0 ? "No quizzes yet. Create your first quiz!" : "No quizzes found."}
            </div>
          ) : (
            <>
            {displayQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background p-4 hover:border-primary hover:shadow-md transition-all group"
              >
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {quiz.title}
                      </h3>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                        quiz.status === "Published"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {quiz.status}
                      </span>
                      {quiz.visibility === "Public" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-blue-500/10 text-blue-500 flex items-center gap-1">
                          <Globe size={9} /> Public
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-secondary text-muted-foreground flex items-center gap-1">
                          <Lock size={9} /> Private
                        </span>
                      )}
                      {quiz.creationMethod === "AI" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-purple-500/10 text-purple-400 flex items-center gap-1">
                          <Sparkles size={9} /> AI
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1 font-medium">
                      <span>{quiz._count.questions} questions</span>
                      <span>{quiz.timeLimit} min</span>
                      <span className={DIFFICULTY_COLOR[quiz.difficulty]}>{quiz.difficulty}</span>
                      <span>{quiz.category}</span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/teacher/quizzes/${quiz.id}`)}
                    className="px-4 py-1.5 text-sm border border-border rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                  >
                    View
                  </button>

                  <div className={cn("relative", activeMenu === quiz.id && "z-50")}>
                    <button
                      onClick={() => setActiveMenu(activeMenu === quiz.id ? null : quiz.id)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center border rounded-md transition",
                        activeMenu === quiz.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenu === quiz.id && (
                      <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
                        <div className="p-1.5 flex flex-col">
                          <button
                            onClick={() => handlePreview(quiz)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition"
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            onClick={() => router.push(`/teacher/quizzes/${quiz.id}/edit`)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition"
                          >
                            <Edit2 size={14} /> Edit Quiz
                          </button>
                          <button
                            onClick={() => handleDuplicate(quiz)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition"
                          >
                            <Copy size={14} /> Duplicate
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => handleDelete(quiz.id)}
                            disabled={deletingId === quiz.id}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                          >
                            {deletingId === quiz.id
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} />}
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
              )}
            </>

          )}
          
        </div>
      </div>
    </div>
  );
}
