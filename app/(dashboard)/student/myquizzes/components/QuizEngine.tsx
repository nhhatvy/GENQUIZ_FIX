'use client';

import { ArrowLeft, Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useConfirm } from "@/app/_components/ConfirmModal";
import { cn } from "@/lib/utils";

interface Option { id: string; text: string; isCorrect: boolean }
interface Question { id: string; text: string; type: string; points: number; options: Option[] }
interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
}

interface Props { quiz: Quiz; onExit: () => void }

type Phase = "quiz" | "result";

export default function QuizEngine({ quiz, onExit }: Props) {
  const { confirmModal, askConfirm } = useConfirm();
  const questions = quiz.questions;
  const TOTAL = questions.length;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});  // questionId → optionId
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [phase, setPhase] = useState<Phase>("quiz");
  const [result, setResult] = useState<{ score: number; max: number; pct: number; passed: boolean } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== "quiz") return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, phase]);

  const goNext = () => {
    if (current < TOTAL - 1) { setDirection("next"); setCurrent((c) => c + 1); }
  };
  const goPrev = () => {
    if (current > 0) { setDirection("prev"); setCurrent((c) => c - 1); }
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current!);
    let score = 0;
    let max = 0;
    for (const q of questions) {
      max += q.points;
      const chosen = answers[q.id];
      if (chosen) {
        const opt = q.options.find((o) => o.id === chosen);
        if (opt?.isCorrect) score += q.points;
      }
    }
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    setResult({ score, max, pct, passed: pct >= quiz.passingScore });
    setPhase("result");
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const progress = (Object.keys(answers).length / TOTAL) * 100;
  const q = questions[current];

  // ── Result screen ──────────────────────────────────────────────────────────
  if (phase === "result" && result) {
    return (
      <div className="fixed inset-0 z-100 bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">

          <div className={cn(
            "rounded-3xl p-8 text-center space-y-4",
            result.passed ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
          )}>
            {result.passed
              ? <Trophy size={56} className="mx-auto text-yellow-500" />
              : <XCircle size={56} className="mx-auto text-red-500" />
            }
            <h2 className="text-3xl font-black">{result.passed ? "Well done!" : "Keep practicing!"}</h2>
            <p className="text-5xl font-black text-primary">{result.pct}%</p>
            <p className="text-muted-foreground text-sm">{result.score} / {result.max} points</p>
          </div>

          {/* Per-question review */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 max-h-72 overflow-y-auto">
            <h3 className="font-semibold text-sm">Review Answers</h3>
            {questions.map((q, i) => {
              const chosen = q.options.find((o) => o.id === answers[q.id]);
              const correct = q.options.find((o) => o.isCorrect);
              const isRight = chosen?.isCorrect ?? false;
              return (
                <div key={q.id} className="text-xs space-y-1">
                  <p className="font-medium text-foreground">Q{i + 1}. {q.text}</p>
                  <div className="flex items-center gap-2">
                    {isRight
                      ? <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                      : <XCircle size={12} className="text-red-500 shrink-0" />
                    }
                    <span className={isRight ? "text-green-500" : "text-red-500"}>
                      Your answer: {chosen?.text ?? "—"}
                    </span>
                    {!isRight && <span className="text-muted-foreground">· Correct: {correct?.text}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setAnswers({}); setFlagged(new Set()); setCurrent(0); setTimeLeft(quiz.timeLimit * 60); setPhase("quiz"); }}
              className="flex-1 py-3 border border-border rounded-xl font-semibold text-sm hover:bg-secondary transition"
            >
              Retry
            </button>
            <button
              onClick={onExit}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition"
            >
              Back to My Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-100 bg-background text-foreground flex flex-col">
      {confirmModal}

      {/* TOP BAR */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-1.5 hover:bg-secondary rounded-lg transition">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-sm font-semibold">{quiz.title}</h2>
            <p className="text-[10px] text-muted-foreground uppercase">Question {current + 1} of {TOTAL}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 border px-3 py-1.5 rounded-lg text-sm font-mono",
            timeLeft < 60 ? "bg-red-500/10 border-red-500/40 text-red-500" : "bg-secondary border-border"
          )}>
            <Clock size={14} /> {mins}:{secs}
          </div>
          <div className="bg-secondary border border-border px-3 py-1.5 rounded-lg text-xs text-muted-foreground">
            Answered <span className="ml-1 font-semibold text-foreground">{Object.keys(answers).length}/{TOTAL}</span>
          </div>
          <button
            onClick={async () => { if (await askConfirm(`Submit with ${Object.keys(answers).length}/${TOTAL} answered?`, { title: "Submit Quiz", confirmText: "Submit" })) handleSubmit(); }}
            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition"
          >
            Submit
          </button>
        </div>
      </header>

      {/* PROGRESS */}
      <div className="h-1 bg-secondary shrink-0">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <main className="flex-1 flex gap-6 p-6 max-w-[1200px] mx-auto w-full overflow-hidden">

        {/* LEFT */}
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl p-7 shadow-sm">

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  Q{current + 1}
                </span>
                <span className="text-xs text-muted-foreground">{q.points} pts</span>
              </div>
              <button
                onClick={() => setFlagged((prev) => {
                  const next = new Set(prev);
                  next.has(current) ? next.delete(current) : next.add(current);
                  return next;
                })}
                className={cn(
                  "p-2 rounded-lg border transition",
                  flagged.has(current)
                    ? "bg-orange-500/10 border-orange-500 text-orange-500"
                    : "bg-secondary border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                <Flag size={16} />
              </button>
            </div>

            <div
              key={current}
              className={cn(
                "transition-all duration-300",
                direction === "next" ? "animate-in slide-in-from-right-4 fade-in" : "animate-in slide-in-from-left-4 fade-in"
              )}
            >
              <h1 className="text-lg font-semibold mb-6 leading-snug">{q.text}</h1>

              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  const letters = ["A", "B", "C", "D"];
                  const selected = answers[q.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border transition text-left group",
                        selected ? "bg-primary/10 border-primary" : "bg-background border-border hover:border-primary/40"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground group-hover:border-primary"
                      )}>
                        {letters[idx]}
                      </div>
                      <span className="text-sm font-medium">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={goPrev} disabled={current === 0} className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary transition disabled:opacity-40">
              <ChevronLeft size={16} /> Previous
            </button>
            <button onClick={goNext} disabled={current === TOTAL - 1} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-40">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* RIGHT — Navigator */}
        <aside className="w-56 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-center">Navigator</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setDirection(idx > current ? "next" : "prev"); setCurrent(idx); }}
                  className={cn(
                    "aspect-square rounded-lg text-[11px] font-semibold transition border",
                    current === idx ? "bg-primary border-primary text-primary-foreground"
                    : answers[questions[idx].id] ? "bg-green-500/10 border-green-500/40 text-green-600"
                    : flagged.has(idx) ? "bg-orange-500/10 border-orange-500/40 text-orange-500"
                    : "bg-secondary border-border text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-[10px] text-muted-foreground">
              {[
                { color: "bg-primary", label: "Current" },
                { color: "bg-green-500/20 border border-green-500/40", label: "Answered" },
                { color: "bg-orange-500/20 border border-orange-500/40", label: "Flagged" },
                { color: "bg-secondary border border-border", label: "Unanswered" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded", l.color)} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
