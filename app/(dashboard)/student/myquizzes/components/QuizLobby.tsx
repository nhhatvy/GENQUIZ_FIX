'use client';

import { ArrowLeft, Book, HelpCircle, Timer, Target, Info, Play } from "lucide-react";

interface QuizStartLobbyProps {
  quiz: {
    title: string;
    category: string;
    difficulty: string;
    timeLimit: number;
    passingScore: number;
    questions: any[];
  };
  onBack: () => void;
  onStart: () => void;
}

const DIFF_COLOR: Record<string, string> = {
  Easy: "bg-green-500/20 text-green-400",
  Medium: "bg-orange-500/20 text-orange-400",
  Hard: "bg-red-500/20 text-red-400",
};

export default function QuizStartLobby({ quiz, onBack, onStart }: QuizStartLobbyProps) {
  const infoCards = [
    { label: "Total Questions", value: quiz.questions.length, icon: HelpCircle },
    { label: "Time Limit", value: `${quiz.timeLimit} min`, icon: Timer },
    { label: "Passing Score", value: `${quiz.passingScore}%`, icon: Target },
  ];

  const instructions = [
    "Read each question carefully before selecting your answer",
    "Use the navigator panel to jump between questions",
    "Flag questions to review before submitting",
    "Timer starts when you click Start — answers auto-submit on timeout",
    "Correct answers are revealed after you submit",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to My Quizzes
      </button>

      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 p-6 text-white shadow-md">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Book size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">{quiz.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{quiz.category}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${DIFF_COLOR[quiz.difficulty]}`}>
                {quiz.difficulty}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-3xl" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3">
          {infoCards.map((card) => (
            <div key={card.label} className="bg-secondary border border-border rounded-xl p-4 group hover:border-primary/40 transition">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{card.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">{card.value}</p>
                <card.icon size={18} className="text-muted-foreground/50 group-hover:text-primary transition" />
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
            <Info size={14} /> Instructions
          </h4>
          <ul className="space-y-2">
            {instructions.map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onStart}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-sm hover:opacity-90 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          <Play size={18} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
          Start Practice
        </button>
      </div>
    </div>
  );
}
