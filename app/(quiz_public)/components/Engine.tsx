'use client';

import { useState, useEffect, useCallback } from "react";
import { useConfirm } from "@/app/_components/ConfirmModal";
import { Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { id: string; text: string };
type Question = { id: string; text: string; type: string; points: number; options: Option[] };

export interface QuizEngineProps {
  quiz: { id: string; title: string; questions: Question[] };
  durationSeconds: number;
  onSubmit: (answers: { questionId: string; selectedOptionId: string }[], timeTakenSeconds: number) => void;
}

export default function QuizEngine({ quiz, durationSeconds, onSubmit }: QuizEngineProps) {
  const questions = quiz.questions;
  const TOTAL = questions.length;
  const { confirmModal, askConfirm } = useConfirm();

  const [current, setCurrent] = useState(0);
  // key = questionId, value = optionId
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [startTime] = useState(Date.now());

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const isAllAnswered = Object.keys(answers).length === TOTAL;
  const progress = (Object.keys(answers).length / TOTAL) * 100;

  const handleSubmit = useCallback(() => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const payload = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
    onSubmit(payload, timeTaken);
  }, [answers, startTime, onSubmit]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleSubmit]);

  const onConfirmSubmit = async () => {
    if (!isAllAnswered) {
      alert(`You haven't answered all ${TOTAL} questions. Please complete them before submitting.`);
      return;
    }
    if (await askConfirm("Are you sure you want to submit?", {
      title: "Submit Quiz",
      confirmText: "Submit",
    })) handleSubmit();
  };

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground flex flex-col">
      {confirmModal}
      {/* HEADER */}
      <header className="h-14 border-b border-border flex items-center justify-between px-5 bg-card">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-semibold">{quiz.title}</h2>
            <p className="text-xs text-muted-foreground">Question {current + 1} / {TOTAL}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className={cn(
            "flex items-center gap-2 border px-3 py-1.5 rounded-lg tabular-nums",
            timeLeft < 60 ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse" : "bg-secondary border-border"
          )}>
            <Clock size={14} /> {formatTime(timeLeft)}
          </div>
          <div className={cn(
            "border px-3 py-1.5 rounded-lg font-bold transition-colors",
            isAllAnswered ? "bg-green-500/10 border-green-500 text-green-600" : "bg-primary/10 border-primary/20 text-primary"
          )}>
            {Object.keys(answers).length}/{TOTAL} Answered
          </div>
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="h-1 bg-secondary">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <main className="flex-1 flex gap-6 p-6 max-w-[1100px] mx-auto w-full overflow-hidden">
        {/* QUESTION */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider">
                Question {current + 1}
              </span>
              <button
                onClick={() => setFlagged((prev) => {
                  const next = new Set(prev);
                  next.has(current) ? next.delete(current) : next.add(current);
                  return next;
                })}
                className={cn(
                  "p-2 rounded-lg border transition",
                  flagged.has(current)
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-secondary border-border text-muted-foreground"
                )}
              >
                <Flag size={16} fill={flagged.has(current) ? "currentColor" : "none"} />
              </button>
            </div>

            <h1 className="text-xl font-bold leading-relaxed mb-8">{q.text}</h1>

            <div className="grid gap-3">
              {q.options.map((opt, i) => (
                <button
                  key={opt.id}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                    answers[q.id] === opt.id
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-background border-border hover:border-primary/40"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-black transition-all shrink-0",
                    answers[q.id] === opt.id
                      ? "bg-primary text-white border-primary rotate-3"
                      : "border-border group-hover:border-primary group-hover:text-primary"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={cn(
                    "flex-1 text-sm font-bold transition-colors",
                    answers[q.id] === opt.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {opt.text}
                  </span>
                  {answers[q.id] === opt.id && <CheckCircle2 size={20} className="text-primary animate-in zoom-in duration-300" />}
                </button>
              ))}
            </div>
          </div>

          {/* NAV */}
          <div className="flex justify-between items-center px-2">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex items-center gap-2 px-6 py-3 bg-secondary border border-border rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-30 hover:bg-muted transition active:scale-95"
            >
              <ChevronLeft size={18} /> Prev
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(TOTAL - 1, c + 1))}
              disabled={current === TOTAL - 1}
              className={cn(
                "flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black uppercase tracking-[0.2em] transition active:scale-95",
                current === TOTAL - 1
                  ? "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed opacity-50"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* NAVIGATOR SIDEBAR */}
        <aside className="w-72 hidden lg:block">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <div className="text-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground underline underline-offset-8">
                Navigator
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-8 overflow-y-auto pr-1">
              {questions.map((question, idx) => (
                <button
                  key={question.id}
                  onClick={() => setCurrent(idx)}
                  className={cn(
                    "aspect-square rounded-xl text-xs font-black border-2 flex items-center justify-center transition-all",
                    current === idx
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110 z-10"
                      : answers[question.id]
                      ? "bg-green-500/10 text-green-600 border-green-500/40"
                      : flagged.has(idx)
                      ? "bg-orange-500/10 text-orange-500 border-orange-500/40"
                      : "bg-secondary border-transparent text-muted-foreground hover:border-primary/20"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-border space-y-2">
              <div className="flex items-center gap-3 text-[9px] font-black uppercase text-gray-500">
                <div className="w-3 h-3 rounded-sm bg-green-500" /> Answered
              </div>
              <div className="flex items-center gap-3 text-[9px] font-black uppercase text-gray-500">
                <div className="w-3 h-3 rounded-sm bg-orange-500" /> Flagged
              </div>
            </div>

            <button
              onClick={onConfirmSubmit}
              disabled={!isAllAnswered}
              className={cn(
                "w-full mt-6 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition active:scale-95 flex items-center justify-center gap-2",
                isAllAnswered
                  ? "bg-green-600 text-white shadow-xl shadow-green-500/20 hover:bg-green-700"
                  : "bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed"
              )}
            >
              <Send size={16} /> Submit Quiz
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
