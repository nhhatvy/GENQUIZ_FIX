'use client';
import { useState } from "react";
import { ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { id: string; text: string; isCorrect: boolean };
type Question = {
  id: string;
  text: string;
  type: string;
  points: number;
  options: Option[];
};

export default function QuizPreviewEngine({
  quiz,
  onExit,
}: {
  quiz: { title?: string; difficulty?: string; questions?: Question[] };
  onExit: () => void;
}) {
  const questions: Question[] = quiz.questions ?? [];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-6">
        <p className="text-muted-foreground">This quiz has no questions yet.</p>
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    );
  }

  const q = questions[idx];
  const progress = Math.round(((idx + 1) / questions.length) * 100);
  const isLast = idx === questions.length - 1;

  return (
    <div className="mt-17 fixed inset-0 z-[100] bg-background text-foreground flex flex-col p-6 animate-in fade-in duration-300">

      {/* TOP NAV */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md
            text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Question {idx + 1} of {questions.length}
          </span>
        </div>
        <span className="text-sm font-medium text-muted-foreground uppercase">
          {progress}% Complete
        </span>
      </div>

      {/* PROGRESS */}
      <div className="max-w-5xl mx-auto w-full h-2 bg-secondary rounded-full mb-12 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* QUESTION */}
      <div className="max-w-5xl mx-auto w-full bg-card border border-border rounded-lg p-10 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <span className="px-3 py-1 text-xs font-bold uppercase rounded-md bg-primary/10 text-primary">
            {q.points} points
          </span>
          <span className="px-3 py-1 text-xs rounded-md bg-secondary text-muted-foreground italic">
            {quiz.difficulty ?? "Medium"}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold leading-snug">
          {q.text || <span className="italic text-muted-foreground">No question text</span>}
        </h2>
      </div>

      {/* OPTIONS */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
        {q.options.map((option, i) => (
          <button
            key={option.id}
            onClick={() => setSelected(option.id)}
            className={cn(
              "flex items-center gap-6 p-6 rounded-lg border text-left transition-all duration-200 group shadow-sm",
              selected === option.id
                ? "border-primary bg-primary/10"
                : "bg-card border-border hover:border-primary hover:shadow-md hover:-translate-y-[1px]"
            )}
          >
            <span className={cn(
              "w-10 h-10 flex items-center justify-center rounded-md font-bold shrink-0",
              selected === option.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground group-hover:bg-primary/10"
            )}>
              {String.fromCharCode(65 + i)}
            </span>
            <span className="text-base font-medium">{option.text}</span>
          </button>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between mt-8">
        <button
          onClick={() => { setIdx((i) => Math.max(0, i - 1)); setSelected(null); }}
          disabled={idx === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-md
          text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 transition-all"
        >
          <ArrowLeft size={16} /> Previous
        </button>

        {isLast ? (
          <button
            disabled={!selected}
            onClick={onExit}
            className={cn(
              "flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition",
              selected
                ? "bg-green-600 text-white shadow-lg hover:opacity-90"
                : "bg-secondary text-muted-foreground opacity-60 cursor-not-allowed"
            )}
          >
            End Preview <CheckCircle2 size={16} />
          </button>
        ) : (
          <button
            disabled={!selected}
            onClick={() => { setIdx((i) => i + 1); setSelected(null); }}
            className={cn(
              "flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-all",
              selected
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-[1px]"
                : "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
            )}
          >
            Next Question <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
