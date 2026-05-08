"use client";

import {
  BookOpen, Calendar, Users, BarChart3,
  ChevronRight, Trophy, Loader2, Zap, Clock, Lock, Globe,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalQuizzes: number;
    activeEvents: number;
    totalStudents: number;
    avgCompletion: number;
  };
  recentEvents: {
    id: string;
    title: string;
    status: string;
    scheduledAt: string | null;
    durationMinutes: number;
    submissionCount: number;
    quizTitle: string;
    className: string | null;
  }[];
  topStudents: {
    rank: number;
    name: string;
    email: string;
    totalScore: number;
    attempts: number;
  }[];
  recentQuizzes: {
    id: string;
    title: string;
    questionCount: number;
    sessionCount: number;
    submissionCount: number;
  }[];
}

function formatDate(d: string | null) {
  if (!d) return "Not scheduled";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-red-500/10 text-red-500",
  Upcoming: "bg-blue-500/10 text-blue-500",
  Completed: "bg-green-500/10 text-green-500",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const stats = data ? [
    {
      label: "Total Quizzes",
      value: data.stats.totalQuizzes,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Active Events",
      value: data.stats.activeEvents,
      icon: Calendar,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Students",
      value: data.stats.totalStudents,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Avg Pass Rate",
      value: `${data.stats.avgCompletion}%`,
      icon: BarChart3,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Welcome back, {firstName}! Here's what's happening with your quizzes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
              </div>
              <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Events */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recent Events</h2>
              <p className="text-muted-foreground text-sm">Your upcoming and active quiz events</p>
            </div>
            <button
              onClick={() => router.push("/teacher/events")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {(data?.recentEvents ?? []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No events yet. <button onClick={() => router.push("/teacher/events")} className="text-primary hover:underline">Schedule one</button>
            </div>
          ) : (
            <div className="space-y-3">
              {data!.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background p-4 hover:border-primary transition group cursor-pointer"
                  onClick={() => router.push(`/teacher/events/${event.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                          {event.title}
                        </h4>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase", STATUS_STYLE[event.status])}>
                          {event.status}
                        </span>
                        {event.className ? (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold">
                            <Lock size={8} /> {event.className}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                            <Globe size={8} /> Public
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                        <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(event.scheduledAt)}</span>
                        <span className="flex items-center gap-1"><Users size={10} /> {event.submissionCount} submitted</span>
                      </div>
                    </div>
                  </div>

                  {event.status === "Active" ? (
                    <span className="shrink-0 flex items-center gap-1 bg-red-500/10 text-red-500 px-3 py-1.5 text-xs rounded-lg font-bold border border-red-500/20">
                      <Zap size={11} fill="currentColor" /> Live
                    </span>
                  ) : (
                    <ChevronRight size={16} className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Students */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Top Students</h2>
            <p className="text-muted-foreground text-sm">Highest total scores</p>
          </div>

          {(data?.topStudents ?? []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No submissions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {data!.topStudents.map((student) => (
                <div key={student.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0",
                      student.rank === 1 ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                      student.rank === 2 ? "bg-slate-400/20 text-slate-400 border-slate-400/30" :
                      student.rank === 3 ? "bg-orange-600/20 text-orange-600 border-orange-600/30" :
                      "bg-secondary text-muted-foreground border-border"
                    )}>
                      {student.rank}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-32">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.attempts} attempt{student.attempts !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 text-sm font-bold shrink-0">
                    <Trophy size={13} />
                    {Math.round(student.totalScore)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Recent Quizzes</h2>
            <p className="text-muted-foreground text-sm">Your recently created quizzes</p>
          </div>
          <button
            onClick={() => router.push("/teacher/quizzes")}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {(data?.recentQuizzes ?? []).length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No quizzes yet. <button onClick={() => router.push("/teacher/quizzes")} className="text-primary hover:underline">Create one</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {data!.recentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => router.push(`/teacher/quizzes/${quiz.id}`)}
                className="bg-background border border-border rounded-lg p-4 hover:border-primary transition group cursor-pointer"
              >
                <div className="flex justify-between mb-3">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 pr-2">
                    {quiz.title}
                  </h4>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                </div>

                <div className="text-xs text-muted-foreground flex gap-4 mb-3">
                  <span>{quiz.questionCount} questions</span>
                  <span>{quiz.submissionCount} submissions</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen size={11} />
                  <span>{quiz.sessionCount} event{quiz.sessionCount !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
