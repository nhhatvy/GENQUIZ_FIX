'use client';

import {
  ArrowLeft, Loader2, BookOpen, Clock, Users, Trophy,
  BarChart3, CheckCircle2, XCircle, Globe, Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  timeLimit: number;
  passingScore: number;
  visibility: string;
  status: string;
  creator: { id: string; name: string | null; firstName: string | null; lastName: string | null };
  questions: {
    id: string;
    text: string;
    type: string;
    points: number;
    order: number;
    options: { id: string; text: string; isCorrect: boolean }[];
  }[];
}

interface Analytics {
  stats: { totalCompletions: number; avgTimeSeconds: number; avgScore: number; topScore: number };
  recentCompletions: { name: string; scorePercent: number; timeTakenSeconds: number; completedAt: string }[];
  questionPerformance: { text: string; order: number; correctPercent: number }[];
}

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SCORE_COLOR = (pct: number) =>
  pct >= 80 ? "text-green-500" : pct >= 60 ? "text-orange-500" : "text-red-500";
const BAR_COLOR = (pct: number) =>
  pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-orange-500" : "bg-red-500";

export default function AdminQuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setQuiz(data); setLoading(false); });

    fetch(`/api/admin/quizzes/${id}/analytics`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setAnalytics(data); setAnalyticsLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center py-20 text-muted-foreground">Quiz not found.</div>;
  }

  const stats = analytics?.stats;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push("/admin/quizmanage")}
            className="p-2 hover:bg-secondary rounded-lg border border-border transition mt-0.5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{quiz.title}</h2>
            {quiz.description && (
              <p className="text-muted-foreground text-sm mt-0.5">{quiz.description}</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {quiz.category}
              </span>
              <span className={cn(
                "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                quiz.difficulty === "Easy" ? "bg-green-500/10 text-green-500"
                  : quiz.difficulty === "Hard" ? "bg-red-500/10 text-red-500"
                  : "bg-orange-500/10 text-orange-500"
              )}>
                {quiz.difficulty}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {quiz.questions?.length ?? 0} questions
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {quiz.timeLimit} min
              </span>
              <span className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full",
                quiz.visibility === "Public" ? "bg-green-500/10 text-green-500" : "bg-secondary text-muted-foreground"
              )}>
                {quiz.visibility === "Public" ? <Globe size={11} /> : <Lock size={11} />}
                {quiz.visibility}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              By <span className="font-medium text-foreground">
                {quiz.creator
                  ? (quiz.creator.name ?? ([quiz.creator.firstName, quiz.creator.lastName].filter(Boolean).join(" ") || "Unknown"))
                  : "Unknown"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Completions", value: analyticsLoading ? null : String(stats?.totalCompletions ?? 0), icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Avg Time", value: analyticsLoading ? null : (stats?.avgTimeSeconds ? formatTime(stats.avgTimeSeconds) : "—"), icon: Clock, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Average Score", value: analyticsLoading ? null : (stats?.totalCompletions ? `${stats.avgScore}%` : "—"), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Top Score", value: analyticsLoading ? null : (stats?.totalCompletions ? `${stats.topScore}%` : "—"), icon: Trophy, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">
                {stat.value === null
                  ? <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  : stat.value}
              </p>
            </div>
            <div className={cn("p-3 rounded-xl shrink-0", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Completions */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Recent Completions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Students who recently completed this quiz</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-md">
              {analytics?.recentCompletions.length ?? 0} shown
            </span>
          </div>
          {analyticsLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
          ) : !analytics?.recentCompletions.length ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No submissions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analytics.recentCompletions.map((row, i) => (
                    <tr key={i} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium">{row.name}</td>
                      <td className={cn("px-5 py-3.5 font-bold", SCORE_COLOR(row.scorePercent))}>{row.scorePercent}%</td>
                      <td className="px-5 py-3.5 text-muted-foreground font-mono">{formatTime(row.timeTakenSeconds)}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{timeAgo(row.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Question Performance */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-primary" />
            <h3 className="font-semibold">Question Performance</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-5">% of students who answered correctly</p>
          {analyticsLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
          ) : !analytics?.questionPerformance.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No questions yet.</p>
          ) : (
            <div className="space-y-5">
              {analytics.questionPerformance.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2 text-xs">
                    <span className="text-foreground/80 line-clamp-2 flex-1">{i + 1}. {q.text}</span>
                    <span className={cn("font-bold shrink-0", SCORE_COLOR(q.correctPercent))}>
                      {stats && stats.totalCompletions > 0 ? `${q.correctPercent}%` : "—"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", BAR_COLOR(q.correctPercent))}
                      style={{ width: stats && stats.totalCompletions > 0 ? `${q.correctPercent}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Questions & Answers */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold">Questions & Answers</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Full question list with correct answers</p>
        </div>
        <div className="divide-y divide-border">
          {quiz.questions.map((q, qi) => (
            <div key={q.id} className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-muted-foreground bg-secondary rounded-md px-2 py-1 shrink-0 mt-0.5">
                  Q{qi + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{q.text}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[11px] text-muted-foreground">{q.type}</span>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground">{q.points} pts</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border",
                      opt.isCorrect
                        ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                        : "bg-secondary/50 border-border text-muted-foreground"
                    )}
                  >
                    {opt.isCorrect
                      ? <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                      : <XCircle size={14} className="shrink-0 text-muted-foreground/50" />
                    }
                    {opt.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
