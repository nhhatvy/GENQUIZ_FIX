'use client';

import { useState, useEffect } from "react";
import { User, PlayCircle, AlertCircle, LogIn, CheckCircle2 } from "lucide-react";

interface Props {
  quiz: any;
  onStart: (name: string) => void;
  // Nếu đã đăng nhập — truyền từ page
  loggedInName?: string | null;
  loggedInEmail?: string | null;
}

export default function QuizEntryView({ onStart, loggedInName, loggedInEmail }: Props) {
  const [name, setName] = useState(loggedInName ?? "");
  const isLoggedIn = !!loggedInEmail;

  useEffect(() => {
    if (loggedInName) setName(loggedInName);
  }, [loggedInName]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm animate-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold tracking-tight text-primary">
            Ready to Start?
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLoggedIn
              ? "Confirm your name before joining"
              : "Enter your name to record your result"}
          </p>
        </div>

        {/* Logged-in account badge */}
        {isLoggedIn && (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <CheckCircle2 size={16} className="text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary">Joining as your account</p>
              <p className="text-xs text-muted-foreground truncate">{loggedInEmail}</p>
            </div>
          </div>
        )}

        {/* Guest hint */}
        {!isLoggedIn && (
          <div className="flex items-center gap-3 bg-secondary/50 border border-border rounded-xl px-4 py-3">
            <LogIn size={16} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">
                <a href="/login" className="font-semibold text-primary hover:underline">Log in</a>
                {" "}to link this result to your account.
              </p>
            </div>
          </div>
        )}

        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {isLoggedIn ? "Display Name" : "Your Name *"}
          </label>
          <div className="relative group">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition"
              size={18}
            />
            <input
              autoFocus={!isLoggedIn}
              placeholder="Your full name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim().length >= 2 && onStart(name.trim())}
              className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition font-medium"
            />
          </div>
          {isLoggedIn && (
            <p className="text-[11px] text-muted-foreground">This is how your name appears on the leaderboard.</p>
          )}
        </div>

        {/* Start Button */}
        <button
          disabled={name.trim().length < 2}
          onClick={() => onStart(name.trim())}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold shadow-sm hover:opacity-90 active:scale-95 transition disabled:opacity-40 flex items-center justify-center gap-2 group"
        >
          Start Quiz
          <PlayCircle size={18} className="group-hover:translate-x-1 transition" />
        </button>

        {/* Warning */}
        <div className="bg-secondary border border-border p-4 rounded-xl flex gap-3">
          <AlertCircle className="text-primary shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Do not close the tab or refresh the page during the exam.
            The system may automatically submit your quiz if suspicious activity is detected.
          </p>
        </div>

      </div>
    </div>
  );
}
