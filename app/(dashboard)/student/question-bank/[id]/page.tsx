"use client";

import {
  ArrowLeft, Loader2, CheckCircle2, X, Edit2, Trash2,
  FileText, Type, Save, AlertCircle, Sparkles, Shuffle,
} from "lucide-react";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/app/_components/ConfirmModal";
import { cn } from "@/lib/utils";
import QuizDetail, { type QuizDetails } from "@/app/_components/quiz-creator/manual-flow/QuizDetail";
import QuizQuestion from "@/app/_components/quiz-creator/manual-flow/QuizQuestion";

type BankOption = { id: string; text: string; isCorrect: boolean };
type BankQuestion = {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  order: number;
  options: BankOption[];
};
type QuestionBank = {
  id: string;
  name: string;
  subject: string;
  sourceType: "FILE" | "TEXT";
  sourceFile: string | null;
  createdAt: string;
  questions: BankQuestion[];
};

const DIFFICULTY_COLOR = {
  Easy: "text-green-500 bg-green-500/10 border-green-500/30",
  Medium: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  Hard: "text-red-500 bg-red-500/10 border-red-500/30",
};

type CreateStep = "config" | "detail" | "questions";

export default function StudentQuestionBankDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { confirmModal, askConfirm } = useConfirm();
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<BankQuestion> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");
  const [error, setError] = useState<string | null>(null);

  // Create Quiz from Bank flow
  const [createStep, setCreateStep] = useState<CreateStep | null>(null);
  const [createCount, setCreateCount] = useState("10");
  const [createDifficulties, setCreateDifficulties] = useState<string[]>(["Easy", "Medium", "Hard"]);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);

  const fetchBank = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/question-bank/${id}`);
      if (res.ok) setBank(await res.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBank(); }, [fetchBank]);

  const toggleDifficulty = (d: string) =>
    setCreateDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const availableQuestions = bank?.questions.filter((q) =>
    createDifficulties.includes(q.difficulty)
  ) ?? [];

  const maxCount = availableQuestions.length;
  const parsedCount = Math.min(parseInt(createCount) || 10, maxCount);

  const handleStartCreate = () => {
    if (maxCount === 0) return;
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, parsedCount).map((q) => ({
      text: q.text,
      type: q.type,
      points: q.points,
      options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    }));
    setSelectedQuestions(picked);
    setCreateStep("detail");
  };

  const handleQuizFinish = () => {
    router.push("/student/myquizzes");
  };

  const startEdit = (q: BankQuestion) => {
    setEditingId(q.id);
    setEditDraft({ text: q.text, difficulty: q.difficulty, points: q.points, options: q.options.map((o) => ({ ...o })) });
    setError(null);
  };

  const cancelEdit = () => { setEditingId(null); setEditDraft(null); setError(null); };

  const updateDraftOption = (optId: string, field: "text" | "isCorrect", value: string | boolean) => {
    setEditDraft((prev) => ({
      ...prev,
      options: prev?.options?.map((o) =>
        o.id === optId
          ? { ...o, [field]: value }
          : field === "isCorrect" && value === true ? { ...o, isCorrect: false } : o
      ),
    }));
  };

  const saveEdit = async (qId: string) => {
    if (!editDraft) return;
    if (!editDraft.text?.trim()) { setError("Question text is required."); return; }
    if (!editDraft.options?.some((o) => o.isCorrect)) { setError("Select at least one correct answer."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/question-bank/${id}/questions/${qId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      });
      if (res.ok) {
        const updated = await res.json();
        setBank((prev) => prev ? { ...prev, questions: prev.questions.map((q) => q.id === qId ? updated : q) } : prev);
        cancelEdit();
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (qId: string) => {
    if (!await askConfirm("Delete this question?", { title: "Delete Question", confirmText: "Delete", variant: "danger" })) return;
    setDeletingId(qId);
    try {
      const res = await fetch(`/api/question-bank/${id}/questions/${qId}`, { method: "DELETE" });
      if (res.ok) setBank((prev) => prev ? { ...prev, questions: prev.questions.filter((q) => q.id !== qId) } : prev);
    } finally { setDeletingId(null); }
  };

  // ── Create Quiz flow ──────────────────────────────────────────────────────
  if (createStep === "detail" && selectedQuestions.length > 0) {
    return (
      <QuizDetail
        onNext={(data) => {
          setQuizDetails({ ...data, creationMethod: "AI" });
          setCreateStep("questions");
        }}
        onBack={() => setCreateStep("config")}
      />
    );
  }

  if (createStep === "questions" && quizDetails && selectedQuestions.length > 0) {
    return (
      <QuizQuestion
        quizDetails={quizDetails}
        initialQuestions={selectedQuestions}
        onBack={() => setCreateStep("detail")}
        onPublish={handleQuizFinish}
      />
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-muted-foreground" /></div>;
  }

  if (!bank) {
    return <div className="text-center py-20 text-muted-foreground">Question bank not found.</div>;
  }

  const filtered = bank.questions.filter((q) => filterDifficulty === "All" || q.difficulty === filterDifficulty);
  const counts = {
    Easy: bank.questions.filter((q) => q.difficulty === "Easy").length,
    Medium: bank.questions.filter((q) => q.difficulty === "Medium").length,
    Hard: bank.questions.filter((q) => q.difficulty === "Hard").length,
  };

  // ── Config panel ──────────────────────────────────────────────────────────
  if (createStep === "config") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setCreateStep(null)} className="p-2 hover:bg-secondary rounded-lg transition text-muted-foreground hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">Create Quiz from Bank</h2>
            <p className="text-sm text-muted-foreground">{bank.name} · {bank.questions.length} total questions</p>
          </div>
        </div>

        <div className="max-w-xl bg-card border border-border rounded-2xl p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Select Difficulty Levels
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["Easy", "Medium", "Hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDifficulty(d)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all space-y-1",
                    createDifficulties.includes(d)
                      ? cn(DIFFICULTY_COLOR[d], "ring-1")
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <p className={cn(
                    "text-sm font-black",
                    createDifficulties.includes(d)
                      ? d === "Easy" ? "text-green-500" : d === "Medium" ? "text-orange-500" : "text-red-500"
                      : "text-muted-foreground"
                  )}>{d}</p>
                  <p className="text-[11px] text-muted-foreground">{counts[d]} questions</p>
                </button>
              ))}
            </div>
            {createDifficulties.length === 0 && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} /> Select at least one difficulty level
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Number of Questions
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={createCount}
                min={1}
                max={maxCount || 1}
                onChange={(e) => setCreateCount(e.target.value)}
                onBlur={(e) => {
                  const n = parseInt(e.target.value);
                  setCreateCount(String(isNaN(n) ? 10 : Math.max(1, Math.min(maxCount || 1, n))));
                }}
                className="w-28 bg-background border border-border rounded-xl px-4 py-3 text-center text-xl font-bold outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-sm text-muted-foreground">
                from <span className="font-bold">{maxCount}</span> available questions
              </p>
            </div>

            {maxCount > 0 && (
              <div className="space-y-1.5">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((parsedCount / maxCount) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {parsedCount} of {maxCount} questions will be randomly selected
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setCreateStep(null)}
              className="px-5 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:bg-secondary transition"
            >
              Cancel
            </button>
            <button
              onClick={handleStartCreate}
              disabled={createDifficulties.length === 0 || maxCount === 0}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shuffle size={16} /> Randomly Pick & Create Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main bank detail ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {confirmModal}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/student/question-bank")} className="p-2 hover:bg-secondary rounded-lg transition text-muted-foreground hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{bank.name}</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-purple-500/10 text-purple-400 flex items-center gap-1">
              {bank.sourceType === "FILE" ? <FileText size={9} /> : <Type size={9} />}
              {bank.sourceType === "FILE" ? "File" : "Text"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {bank.subject} · {bank.questions.length} questions
            {bank.sourceFile && ` · ${bank.sourceFile}`}
          </p>
        </div>

        <button
          onClick={() => setCreateStep("config")}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition"
        >
          <Sparkles size={16} /> Create Quiz from Bank
        </button>
      </div>

      {/* Difficulty filter */}
      <div className="flex flex-wrap gap-3">
        {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFilterDifficulty(d)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold border transition",
              filterDifficulty === d
                ? d === "All"
                  ? "bg-primary text-primary-foreground border-primary"
                  : cn(DIFFICULTY_COLOR[d as keyof typeof DIFFICULTY_COLOR], "border")
                : "border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            {d === "All" ? `All (${bank.questions.length})` : `${d} (${counts[d]})`}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No questions found.</div>
        ) : (
          filtered.map((q, idx) => (
            <div key={q.id} className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  {editingId === q.id ? (
                    <textarea
                      rows={2}
                      value={editDraft?.text ?? ""}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, text: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  ) : (
                    <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {editingId === q.id ? (
                    <select
                      value={editDraft?.difficulty ?? q.difficulty}
                      onChange={(e) => setEditDraft((prev) => ({ ...prev, difficulty: e.target.value as any }))}
                      className="bg-background border border-border rounded-lg px-2 py-1 text-xs outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  ) : (
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider", DIFFICULTY_COLOR[q.difficulty])}>
                      {q.difficulty}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                    {q.type === "TRUE_FALSE" ? "T/F" : "MCQ"}
                  </span>

                  {editingId !== q.id && (
                    <>
                      <button onClick={() => startEdit(q)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-white transition">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(q.id)} disabled={deletingId === q.id} className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition disabled:opacity-50">
                        {deletingId === q.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-10">
                {(editingId === q.id ? editDraft?.options ?? q.options : q.options).map((opt) => (
                  <div key={opt.id} className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border text-sm transition",
                    opt.isCorrect ? "border-green-500/40 bg-green-500/5 text-green-400" : "border-border bg-background/50 text-muted-foreground"
                  )}>
                    {editingId === q.id ? (
                      <>
                        <button
                          onClick={() => updateDraftOption(opt.id, "isCorrect", true)}
                          className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition", opt.isCorrect ? "border-green-500 bg-green-500" : "border-muted-foreground hover:border-primary")}
                        >
                          {opt.isCorrect && <CheckCircle2 size={9} className="text-white" />}
                        </button>
                        <input
                          value={opt.text}
                          onChange={(e) => updateDraftOption(opt.id, "text", e.target.value)}
                          disabled={q.type === "TRUE_FALSE"}
                          className="bg-transparent outline-none text-sm flex-1 text-white disabled:cursor-default"
                        />
                      </>
                    ) : (
                      <>
                        {opt.isCorrect
                          ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                          : <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 shrink-0" />}
                        <span>{opt.text}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {editingId === q.id && (
                <div className="pl-10 space-y-3">
                  {error && <div className="flex items-center gap-2 text-red-400 text-xs"><AlertCircle size={14} /> {error}</div>}
                  <div className="flex items-center gap-2">
                    <button onClick={() => saveEdit(q.id)} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-60">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                    </button>
                    <button onClick={cancelEdit} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-secondary transition">
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
