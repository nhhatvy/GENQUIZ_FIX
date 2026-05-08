'use client';

import {
  ArrowLeft, Edit3, Play, Users, Clock, BookOpen,
  Loader2, BarChart3, Trophy, CalendarClock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuizPreviewEngine from "./QuizPreview";
import { cn } from "@/lib/utils";

interface QuizAnalyticsProps {
  quiz: any;
  onBack: () => void;
}

interface Analytics {
  stats: {
    totalCompletions: number;
    avgTimeSeconds: number;
    avgScore: number;
    topScore: number;
  };
  recentCompletions: {
    name: string;
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

const SCORE_COLOR = (pct: number) => {
  if (pct >= 80) return "text-green-500";
  if (pct >= 60) return "text-orange-500";
  return "text-red-500";
};

const BAR_COLOR = (pct: number) => {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-orange-500";
  return "bg-red-500";
};

export default function QuizAnalytics({ quiz, onBack }: QuizAnalyticsProps) {
  const router = useRouter();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quiz?.id) return;
    setLoading(true);
    fetch(`/api/teacher/quizzes/${quiz.id}/analytics`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setAnalytics(data); setLoading(false); });
  }, [quiz?.id]);

  if (isPreviewing) {
    return <QuizPreviewEngine quiz={quiz} onExit={() => setIsPreviewing(false)} />;
  }


  const stats = analytics?.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-secondary rounded-lg border border-border transition mt-0.5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{quiz.title}</h2>
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
                {quiz.questions?.length ?? 0} questions
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {quiz.timeLimit} min
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push(`/teacher/quizzes/${quiz.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition"
          >
            <Edit3 size={16} /> Edit
          </button>
          <button
            onClick={() => setIsPreviewing(true)}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 shadow-lg shadow-primary/20 transition"
          >
            <Play size={16} fill="currentColor" /> Preview
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Completions",
            value: loading ? "—" : String(stats?.totalCompletions ?? 0),
            icon: BookOpen,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            label: "Avg Time",
            value: loading ? "—" : (stats?.avgTimeSeconds ? formatTime(stats.avgTimeSeconds) : "—"),
            icon: Clock,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            label: "Average Score",
            value: loading ? "—" : (stats?.totalCompletions ? `${stats.avgScore}%` : "—"),
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Top Score",
            value: loading ? "—" : (stats?.totalCompletions ? `${stats.topScore}%` : "—"),
            icon: Trophy,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
          },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">
                {loading ? <Loader2 size={20} className="animate-spin text-muted-foreground" /> : stat.value}
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

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : !analytics?.recentCompletions.length ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No submissions yet.
            </div>
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
          <p className="text-xs text-muted-foreground mb-5">% of students who answered correctly</p>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : !analytics?.questionPerformance.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No questions yet.</p>
          ) : (
            <div className="space-y-5">
              {analytics.questionPerformance.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2 text-xs">
                    <span className="text-foreground/80 line-clamp-2 flex-1">
                      {i + 1}. {q.text}
                    </span>
                    <span className={cn("font-bold shrink-0", SCORE_COLOR(q.correctPercent))}>
                      {analytics.stats.totalCompletions > 0 ? `${q.correctPercent}%` : "—"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", BAR_COLOR(q.correctPercent))}
                      style={{ width: analytics.stats.totalCompletions > 0 ? `${q.correctPercent}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Section */}
      <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between bg-gradient-to-r from-card to-secondary/20 shadow-sm">
        <div>
          <h3 className="font-semibold text-lg">Assign as Test</h3>
          <p className="text-sm text-muted-foreground">Schedule this quiz as an exam event for your students</p>
        </div>
        <button
          onClick={() => router.push(`/teacher/events?quizId=${quiz.id}`)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition"
        >
          <CalendarClock size={18} /> Create Event
        </button>
      </div>
    </div>
  );
}
