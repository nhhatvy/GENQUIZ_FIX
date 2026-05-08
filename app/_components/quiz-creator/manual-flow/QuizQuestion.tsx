"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft, Trash2, Plus, GripVertical, CheckCircle2,
  Eye, X, ArrowLeft, ChevronRight, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizDetails } from "./QuizDetail";

// ─── Types ───────────────────────────────────────────────────────────────────
type OptionT = { id: string; text: string; isCorrect: boolean };
type QuestionT = {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  points: number;
  options: OptionT[];
};

const uid = () => Math.random().toString(36).slice(2, 8);

const blankOption = (text = "", isCorrect = false): OptionT => ({ id: uid(), text, isCorrect });

const blankQuestion = (): QuestionT => ({
  id: uid(),
  text: "",
  type: "MULTIPLE_CHOICE",
  points: 10,
  options: [blankOption(), blankOption(), blankOption(), blankOption()],
});

const trueFalseOptions = (): OptionT[] => [
  blankOption("True", false),
  blankOption("False", false),
];

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({
  details,
  questions,
  onClose,
}: {
  details: QuizDetails;
  questions: QuestionT[];
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const q = questions[idx];
  const progress = Math.round(((idx + 1) / questions.length) * 100);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col p-6 animate-in fade-in duration-200">
      {/* Top */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg text-muted-foreground hover:bg-secondary transition"
          >
            <ArrowLeft size={15} /> Exit Preview
          </button>
          <span className="text-sm text-muted-foreground">
            Question {idx + 1} of {questions.length}
          </span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{progress}% Complete</span>
      </div>

      {/* Progress bar */}
      <div className="max-w-4xl mx-auto w-full h-1.5 bg-secondary rounded-full mb-8">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div className="max-w-4xl mx-auto w-full bg-card border border-border rounded-2xl p-8 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 text-xs font-bold uppercase rounded-lg bg-primary/10 text-primary">
            {q.points} points
          </span>
          <span className="px-3 py-1 text-xs rounded-lg bg-secondary text-muted-foreground">
            {details.difficulty}
          </span>
        </div>
        <h2 className="text-2xl font-semibold leading-snug">
          {q.text || <span className="text-muted-foreground italic">No question text</span>}
        </h2>
      </div>

      {/* Options */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 content-start">
        {q.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={cn(
              "flex items-center gap-4 p-5 rounded-xl border text-left transition-all shadow-sm",
              selected === opt.id
                ? "border-primary bg-primary/10"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            <span className={cn(
              "w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm shrink-0",
              selected === opt.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}>
              {String.fromCharCode(65 + q.options.indexOf(opt))}
            </span>
            <span className="text-sm font-medium">
              {opt.text || <span className="text-muted-foreground italic">Empty option</span>}
            </span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mt-6">
        <button
          onClick={() => { setIdx((i) => Math.max(0, i - 1)); setSelected(null); }}
          disabled={idx === 0}
          className="px-4 py-2 text-sm border border-border rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-40 transition"
        >
          Previous
        </button>
        {idx === questions.length - 1 ? (
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg bg-green-600 text-white shadow-lg hover:opacity-90 transition"
          >
            End Preview <CheckCircle2 size={15} />
          </button>
        ) : (
          <button
            onClick={() => { setIdx((i) => i + 1); setSelected(null); }}
            disabled={!selected}
            className={cn(
              "flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition",
              selected
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
                : "bg-secondary text-muted-foreground opacity-60 cursor-not-allowed"
            )}
          >
            Next Question <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface QuizQuestionsProps {
  quizDetails: QuizDetails;
  onBack: () => void;
  onPublish: (quiz: any) => void;
  initialQuestions?: { text: string; type: string; points: number; options: { text: string; isCorrect: boolean }[] }[];
  editingId?: string;
}

function mapInitialQuestions(raw: QuizQuestionsProps["initialQuestions"]): QuestionT[] {
  if (!raw || raw.length === 0) return [blankQuestion()];
  return raw.map((q) => ({
    id: uid(),
    text: q.text,
    type: q.type as QuestionT["type"],
    points: q.points,
    options: q.options.map((o) => blankOption(o.text, o.isCorrect)),
  }));
}

export default function QuizQuestion({ quizDetails, onBack, onPublish, initialQuestions, editingId }: QuizQuestionsProps) {
  const [questions, setQuestions] = useState<QuestionT[]>(() => mapInitialQuestions(initialQuestions));
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // ── Question helpers ──────────────────────────────────────────────────────
  const updateQuestion = (id: string, patch: Partial<QuestionT>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const removeQuestion = (id: string) =>
    setQuestions((qs) => qs.filter((q) => q.id !== id));

  const addQuestion = () =>
    setQuestions((qs) => [...qs, blankQuestion()]);

  // ── Option helpers ────────────────────────────────────────────────────────
  const updateOption = (qId: string, oId: string, text: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o) => (o.id === oId ? { ...o, text } : o)) }
          : q
      )
    );

  const setCorrect = (qId: string, oId: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? { ...q, options: q.options.map((o) => ({ ...o, isCorrect: o.id === oId })) }
          : q
      )
    );

  const addOption = (qId: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId && q.options.length < 6
          ? { ...q, options: [...q.options, blankOption()] }
          : q
      )
    );

  const removeOption = (qId: string, oId: string) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId && q.options.length > 2
          ? { ...q, options: q.options.filter((o) => o.id !== oId) }
          : q
      )
    );

  const changeType = (qId: string, type: QuestionT["type"]) =>
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qId
          ? { ...q, type, options: type === "TRUE_FALSE" ? trueFalseOptions() : blankQuestion().options }
          : q
      )
    );

  // ── Validate + Submit ─────────────────────────────────────────────────────
  const validate = () => {
    const errs: string[] = [];
    questions.forEach((q, i) => {
      if (!q.text.trim()) errs.push(`Question ${i + 1}: Question text is required`);
      if (q.options.some((o) => !o.text.trim())) errs.push(`Question ${i + 1}: All options must have text`);
      if (!q.options.some((o) => o.isCorrect)) errs.push(`Question ${i + 1}: Select at least one correct answer`);
    });
    setErrors(errs);
    return errs.length === 0;
  };

  const submit = async (status: "Draft" | "Published") => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...quizDetails,
        status,
        questions: questions.map((q) => ({
          text: q.text,
          type: q.type,
          points: q.points,
          options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
        })),
      };

      const url = editingId ? `/api/quizzes/${editingId}` : "/api/quizzes";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrors([err.message || "Failed to save quiz"]);
        return;
      }

      const quiz = await res.json();
      onPublish(quiz);
    } catch {
      setErrors(["Connection error. Please try again."]);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {showPreview && (
        <PreviewModal
          details={quizDetails}
          questions={questions}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* STICKY HEADER */}
      <div className="sticky -top-6 z-20 bg-background -mx-6 -mt-6 px-6 py-4 border-b border-border mb-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-semibold">{quizDetails.title || "Create New Quiz"}</h2>
              <p className="text-sm text-muted-foreground">Add questions and configure answers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => submit("Draft")}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium border border-border rounded-xl hover:bg-secondary transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save Draft"}
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-primary/10 text-primary rounded-xl border border-primary/20 hover:bg-primary/20 transition"
            >
              <Eye size={16} /> Preview
            </button>
            <button
              onClick={() => submit("Published")}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <><ChevronRight size={16} /> Publish Quiz</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

        {/* ERROR BANNER */}
        {errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-1">
            {errors.map((e, i) => (
              <p key={i} className="text-sm text-red-500">• {e}</p>
            ))}
          </div>
        )}

        {/* QUESTIONS */}
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div key={q.id} className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
              {/* Question header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <GripVertical size={18} className="text-muted-foreground/40" />
                  <span className="text-sm font-semibold">Question {qIdx + 1}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Points</label>
                    <input
                      type="number"
                      min={1}
                      value={q.points}
                      onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                      className="w-16 bg-background border border-border rounded-lg px-2 py-1 text-sm text-center outline-none focus:border-primary"
                    />
                  </div>

                  <select
                    value={q.type}
                    onChange={(e) => changeType(q.id, e.target.value as QuestionT["type"])}
                    className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm outline-none cursor-pointer hover:border-primary"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TRUE_FALSE">True / False</option>
                  </select>

                  <button
                    onClick={() => removeQuestion(q.id)}
                    disabled={questions.length === 1}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Question text */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Question Text</label>
                <textarea
                  rows={2}
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                  placeholder="Enter your question here..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Answer Options — click the circle to mark correct answer
                </label>

                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        opt.isCorrect
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-background/50"
                      )}
                    >
                      <button
                        onClick={() => setCorrect(q.id, opt.id)}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          opt.isCorrect ? "border-primary bg-primary" : "border-muted-foreground hover:border-primary"
                        )}
                      >
                        {opt.isCorrect && <CheckCircle2 size={11} className="text-white" />}
                      </button>

                      <input
                        value={opt.text}
                        onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + q.options.indexOf(opt))}`}
                        disabled={q.type === "TRUE_FALSE"}
                        className="bg-transparent outline-none text-sm flex-1 disabled:cursor-default"
                      />

                      {q.type === "MULTIPLE_CHOICE" && q.options.length > 2 && (
                        <button
                          onClick={() => removeOption(q.id, opt.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 transition"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {q.type === "MULTIPLE_CHOICE" && q.options.length < 6 && (
                  <button
                    onClick={() => addOption(q.id)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition mt-1"
                  >
                    <Plus size={14} /> Add option
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* ADD QUESTION */}
          <button
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition group text-sm font-medium"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform" />
            Add Question
          </button>
        </div>

        <div className="pb-6" />
      </div>
    </>
  );
}
