'use client';

import {
  ArrowLeft, Loader2, GraduationCap, Clock, CheckCircle2,
  XCircle, BookOpen, Trophy, Radio, ExternalLink, User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface ExamDetail {
  session: {
    id: string;
    title: string;
    status: string;
    pin: string;
    scheduledAt: string | null;
    durationMinutes: number;
    classId: string | null;
    quiz: {
      id: string;
      title: string;
      category: string;
      difficulty: string;
      passingScore: number;
      _count: { questions: number };
      creator: { name: string | null; firstName: string | null; lastName: string | null };
    };
  };
  submissions: {
    id: string;
    nickname: string;
    totalScore: number;
    maxScore: number;
    timeTakenSeconds: number;
    createdAt: string;
  }[];
}

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/exams/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={24} className="animate-spin text-muted-foreground" />
    </div>
  );

  if (!data) return (
    <div className="text-center py-20 text-muted-foreground">Exam not found.</div>
  );

  const { session, submissions } = data;
  const passingScore = session.quiz.passingScore;
  const bestScore = submissions.length > 0
    ? Math.max(...submissions.map((s) => s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0))
    : null;

  const statusConfig = () => {
    if (session.status === "Active") return { color: "text-red-500", bg: "bg-red-500/10", icon: <Radio size={16} />, label: "Active" };
    if (session.status === "Upcoming") return { color: "text-blue-500", bg: "bg-blue-500/10", icon: <Clock size={16} />, label: "Upcoming" };
    return { color: "text-green-500", bg: "bg-green-500/10", icon: <CheckCircle2 size={16} />, label: "Completed" };
  };

  const cfg = statusConfig();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push("/student/exams")}
          className="p-2 hover:bg-secondary rounded-lg border border-border transition mt-0.5"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-foreground">{session.title}</h2>
            <span className={cn("flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full", cfg.bg, cfg.color)}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><BookOpen size={13} /> {session.quiz.title}</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1"><User size={13} />
              {session.quiz.creator.name ?? ([session.quiz.creator.firstName, session.quiz.creator.lastName].filter(Boolean).join(" ") || "Unknown")}
            </span>
            <span className="text-border">·</span>
            <span>{session.quiz.category}</span>
            <span className="text-border">·</span>
            <span>{session.quiz._count.questions} questions</span>
            <span className="text-border">·</span>
            <span>{session.durationMinutes} min</span>
            {session.scheduledAt && (
              <>
                <span className="text-border">·</span>
                <span>{formatDate(session.scheduledAt)}</span>
              </>
            )}
          </div>
        </div>

        {session.status === "Active" && (
          <a
            href={`/quiz-session/${session.id}`}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition shrink-0"
          >
            <ExternalLink size={15} /> Join Now
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Attempts", value: String(submissions.length), icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Best Score", value: bestScore !== null ? `${bestScore}%` : "—", icon: Trophy, color: bestScore !== null && bestScore >= passingScore ? "text-green-500" : "text-red-500", bg: bestScore !== null && bestScore >= passingScore ? "bg-green-500/10" : "bg-red-500/10" },
          { label: "Passing Score", value: `${passingScore}%`, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Duration", value: `${session.durationMinutes} min`, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
            </div>
            <div className={cn("p-3 rounded-xl shrink-0", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Submission history */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">Attempt History</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your submissions for this exam</p>
        </div>

        {submissions.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <GraduationCap size={36} className="text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No attempts yet</p>
            {session.status === "Active" && (
              <a
                href={`/quiz-session/${session.id}`}
                className="mt-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:opacity-90 transition"
              >
                Join Exam
              </a>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">Name used</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Result</th>
                  <th className="px-5 py-3 font-semibold">Time taken</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((sub, i) => {
                  const pct = sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;
                  const passed = pct >= passingScore;
                  return (
                    <tr key={sub.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3.5 text-muted-foreground font-medium">{submissions.length - i}</td>
                      <td className="px-5 py-3.5 font-medium text-foreground">{sub.nickname}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn("font-bold", pct >= passingScore ? "text-green-500" : "text-red-500")}>
                          {pct}%
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">
                          ({sub.totalScore}/{sub.maxScore} pts)
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "flex items-center gap-1.5 text-xs font-bold w-fit px-2 py-0.5 rounded-full",
                          passed ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                          {passed ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-muted-foreground">{formatTime(sub.timeTakenSeconds)}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{formatDate(sub.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
