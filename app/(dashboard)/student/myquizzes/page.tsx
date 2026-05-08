'use client';

import {
  FileText, Search, Plus, ChevronRight,
  Eye, Loader2, BookOpen, BarChart3, Trash2, Globe, Lock, Pencil, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/app/_components/ConfirmModal";
import QuizCreator from "@/app/_components/quiz-creator";
import QuizPreviewEngine from "@/app/(dashboard)/teacher/quizzes/components/QuizPreview";

interface Quiz {
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
}

const DIFF_COLOR: Record<string, string> = {
  Easy: "text-green-500 bg-green-500/10",
  Medium: "text-orange-500 bg-orange-500/10",
  Hard: "text-red-500 bg-red-500/10",
};

export default function MyQuizzesPage() {
  const router = useRouter();
  const { confirmModal, askConfirm } = useConfirm();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<any | null>(null);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/quizzes");
    if (res.ok) setQuizzes(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handlePreview = async (quizId: string) => {
    const res = await fetch(`/api/quizzes/${quizId}`);
    if (!res.ok) return;
    setPreviewQuiz(await res.json());
  };

  const handleDelete = async (id: string) => {
    if (!await askConfirm("Delete this quiz?", { title: "Delete Quiz", confirmText: "Delete", variant: "danger" })) return;
    setDeletingId(id);
    await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    setDeletingId(null);
  };

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Views ─────────────────────────────────────────────────────────────────

  if (isCreating) {
    return (
      <div className="py-4">
        <QuizCreator
          onClose={() => setIsCreating(false)}
          onFinish={async () => { await fetchQuizzes(); setIsCreating(false); }}
        />
      </div>
    );
  }

  if (previewQuiz) {
    return <QuizPreviewEngine quiz={previewQuiz} onExit={() => setPreviewQuiz(null)} />;
  }

  // ── Main list ─────────────────────────────────────────────────────────────

  const stats = [
    { label: "Total Quizzes", value: quizzes.length, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Total Questions", value: quizzes.reduce((s, q) => s + q._count.questions, 0), icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Published", value: quizzes.filter((q) => q.status === "Published").length, icon: BarChart3, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-8 pb-10">
      {confirmModal}
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Quizzes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and preview your own quizzes
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus size={18} /> Create Quiz
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", s.bg, s.color)}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <BookOpen size={48} className="mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            {quizzes.length === 0
              ? "No quizzes yet. Create your first one!"
              : "No quizzes match your search."}
          </p>
          {quizzes.length === 0 && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              <Plus size={16} /> Create Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((quiz) => (
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
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        quiz.status === "Published"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-secondary text-muted-foreground"
                      )}>
                        {quiz.status}
                      </span>
                      {quiz.visibility === "Public" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-500/10 text-blue-500 flex items-center gap-1">
                          <Globe size={9} /> Public
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-secondary text-muted-foreground flex items-center gap-1">
                          <Lock size={9} /> Private
                        </span>
                      )}
                      {quiz.creationMethod === "AI" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-purple-500/10 text-purple-400 flex items-center gap-1">
                          <Sparkles size={9} /> AI
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{quiz.category}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/student/myquizzes/${quiz.id}`)}
                    className="p-1 rounded-lg hover:bg-primary/10 hover:text-primary transition shrink-0 mt-0.5"
                    title="View details"
                  >
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <FileText size={12} /> {quiz._count.questions} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 size={12} /> Pass: {quiz.passingScore}%
                  </span>
                </div>

                {quiz.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{quiz.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => handlePreview(quiz.id)}
                  disabled={quiz._count.questions === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  onClick={() => router.push(`/student/myquizzes/${quiz.id}/edit`)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition border border-border"
                  title="Edit quiz"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(quiz.id)}
                  disabled={deletingId === quiz.id}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition border border-border"
                >
                  {deletingId === quiz.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
