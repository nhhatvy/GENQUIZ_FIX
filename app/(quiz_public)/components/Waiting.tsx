'use client';

import { useEffect, useState } from "react";
import { Clock, ShieldCheck, Lock } from "lucide-react";

interface Props {
  quiz: { title: string };
  scheduledAt?: string | null;
}

export default function QuizWaitingView({ quiz, scheduledAt }: Props) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      if (!scheduledAt) { setTimeLeft(0); return; }
      setTimeLeft(Math.max(0, Math.floor((new Date(scheduledAt).getTime() - Date.now()) / 1000)));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [scheduledAt]);

  const h = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full space-y-6 text-center animate-in fade-in zoom-in duration-500">

        <div className="relative w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Clock size={28} className="text-primary animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Waiting for the teacher to start the exam
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {scheduledAt ? "Starts In" : "Waiting..."}
          </p>
          {scheduledAt ? (
            <div className="text-4xl font-mono font-bold text-primary tabular-nums">
              {h}:{m}:{s}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          <p className="text-xs text-muted-foreground">This page will update automatically</p>
        </div>

        <div className="flex justify-center gap-6 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-2"><ShieldCheck size={14} /> Anti-Cheat</span>
          <span className="flex items-center gap-2"><Lock size={14} /> Secure</span>
        </div>
      </div>
    </div>
  );
}
