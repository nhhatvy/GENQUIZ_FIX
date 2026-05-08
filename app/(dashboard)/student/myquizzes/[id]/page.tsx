"use client";

import {
  ArrowLeft, Eye, Pencil, Users, Clock, Trophy, BookOpen,
  BarChart3, Loader2, UsersRound, Globe, Lock, UserPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import QuizPreviewEngine from "@/app/(dashboard)/teacher/quizzes/components/QuizPreview";

interface Analytics {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    difficulty: string;
    timeLimit: number;
    passingScore: number;
    visibility: string;
    questions: { id: string; text: string; order: number }[];
  };
  stats: {
    totalCompletions: number;
    avgTimeSeconds: number;
    avgScore: number;
    topScore: number;
  };
  recentCompletions: {
    name: string;
    sessionTitle: string;
    scorePercent: number;
    timeTakenSeconds: number;
    completedAt: string;
  }[];
  questionPerformance: {
    text: string;
    order: number;
    correctPercent: number;
  }[];
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
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

export default function StudentQuizViewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/student/quizzes/${id}/analytics`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => { if (d) setData(d); setLoading(false); });
  }, [id]);

  if (previewQuiz) {
    return <QuizPreviewEngine quiz={previewQuiz} onExit={() => setPreviewQuiz(null)} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
        <p>Quiz not found.</p>
        <button
          onClick={() => router.push("/student/myquizzes")}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Back to My Quizzes
        </button>
      </div>
    );
  }

  const { quiz, stats, recentCompletions, questionPerformance } = data;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push("/student/myquizzes")}
            className="p-2 hover:bg-secondary rounded-lg border border-border transition mt-0.5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            {quiz.description && (
              <p className="text-muted-foreground text-sm mt-0.5">{quiz.description}</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
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
                {quiz.questions.length} questions · {quiz.timeLimit} min
              </span>
              {quiz.visibility === "Public" ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 flex items-center gap-1">
                  <Globe size={10} /> Public
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                  <Lock size={10} /> Private
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push(`/student/myquizzes/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition"
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            onClick={async () => {
              const res = await fetch(`/api/quizzes/${id}`);
              if (res.ok) setPreviewQuiz(await res.json());
            }}
            disabled={quiz.questions.length === 0}
            className="flex items-center gap-2 px-5 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition disabled:opacity-50"
          >
            <Eye size={15} /> Preview
          </button>
          <button
            onClick={() => router.push(`/student/study-group?quizId=${id}`)}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 shadow-lg shadow-primary/20 transition"
          >
            <UserPlus size={15} /> Create Study Group
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Attempts", value: String(stats.totalCompletions), icon: UsersRound, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Avg Time", value: stats.totalCompletions ? formatTime(stats.avgTimeSeconds) : "—", icon: Clock, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Average Score", value: stats.totalCompletions ? `${stats.avgScore}%` : "—", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Top Score", value: stats.totalCompletions ? `${stats.topScore}%` : "—", icon: Trophy, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-muted-foreground text-xs font-medium">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
            <div className={cn("p-3 rounded-xl shrink-0", s.bg, s.color)}>
              <s.icon size={20} />
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
              <p className="text-xs text-muted-foreground mt-0.5">Attempts from your study groups</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-md">
              {recentCompletions.length} shown
            </span>
          </div>

          {recentCompletions.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <UsersRound size={36} className="mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No study group activity yet.</p>
              <p className="text-xs text-muted-foreground">Create a study group with this quiz to see results here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 font-medium">Session</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentCompletions.map((row, i) => (
                    <tr key={i} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5 font-medium">{row.name}</td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs truncate max-w-[120px]">{row.sessionTitle}</td>
                      <td className={cn("px-5 py-3.5 font-bold", SCORE_COLOR(row.scorePercent))}>
                        {row.scorePercent}%
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-mono">
                        {formatTime(row.timeTakenSeconds)}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {timeAgo(row.completedAt)}
                      </td>
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
          <p className="text-xs text-muted-foreground mb-5">% of study group attempts answered correctly</p>

          {questionPerformance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No questions yet.</p>
          ) : (
            <div className="space-y-5">
              {questionPerformance.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2 text-xs">
                    <span className="text-foreground/80 line-clamp-2 flex-1">
                      {i + 1}. {q.text}
                    </span>
                    <span className={cn("font-bold shrink-0", stats.totalCompletions > 0 ? SCORE_COLOR(q.correctPercent) : "text-muted-foreground")}>
                      {stats.totalCompletions > 0 ? `${q.correctPercent}%` : "—"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", BAR_COLOR(q.correctPercent))}
                      style={{ width: stats.totalCompletions > 0 ? `${q.correctPercent}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Study Group Banner */}
      <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between bg-linear-to-r from-card to-secondary/20 shadow-sm">
        <div>
          <h3 className="font-semibold text-lg">Create a Study Group</h3>
          <p className="text-sm text-muted-foreground">Invite friends to study together using this quiz</p>
        </div>
        <button
          onClick={() => router.push(`/student/study-group?quizId=${id}`)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition"
        >
          <UserPlus size={18} /> Create Study Group
        </button>
      </div>
    </div>
  );
}
