'use client';

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, ArrowLeft, Users, Trophy, Clock, Search, Target, Loader2, Globe, Lock } from "lucide-react";

interface Props {
  event: any;
  onBack: () => void;
}

export default function QuizReportView({ event, onBack }: Props) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/sessions/${event.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setSession(data); setLoading(false); });
  }, [event.id]);

  const submissions: any[] = session?.submissions ?? [];
  const passingScore: number = session?.quiz?.passingScore ?? 70;

  // Stats
  const total = submissions.length;
  const avgPct = total === 0 ? 0
    : Math.round(submissions.reduce((s, sub) => s + (sub.maxScore > 0 ? (sub.totalScore / sub.maxScore) * 100 : 0), 0) / total);
  const highestPct = total === 0 ? 0
    : Math.max(...submissions.map((s) => s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0));
  const avgTimeSecs = total === 0 ? 0
    : Math.round(submissions.reduce((s, sub) => s + sub.timeTakenSeconds, 0) / total);
  const passCount = submissions.filter((s) => s.maxScore > 0 && (s.totalScore / s.maxScore) * 100 >= passingScore).length;

  const stats = [
    { label: "Average Score", value: `${avgPct}%`, icon: Target, color: "text-blue-500" },
    { label: "Pass Rate", value: total > 0 ? `${Math.round((passCount / total) * 100)}%` : "—", icon: Users, color: "text-green-500" },
    { label: "Highest Score", value: `${highestPct}%`, icon: Trophy, color: "text-yellow-500" },
    { label: "Avg Time", value: `${Math.floor(avgTimeSecs / 60)}m ${avgTimeSecs % 60}s`, icon: Clock, color: "text-purple-500" },
  ];

  // Score distribution: 0-20, 20-40, 40-60, 60-80, 80-100
  const buckets = [0, 0, 0, 0, 0];
  submissions.forEach((s) => {
    const pct = s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0;
    const idx = Math.min(4, Math.floor(pct / 20));
    buckets[idx]++;
  });
  const maxBucket = Math.max(...buckets, 1);

  // Question performance
  const questions = session?.quiz?.questions ?? [];
  const questionStats = questions.map((q: any) => {
    const allAnswers = submissions.flatMap((s) => s.answers ?? []);
    const forQ = allAnswers.filter((a: any) => a.questionId === q.id);
    const correct = forQ.filter((a: any) => a.isCorrect).length;
    const pct = forQ.length > 0 ? Math.round((correct / forQ.length) * 100) : 0;
    return { text: q.text, pct };
  });

  const filtered = submissions.filter((s) =>
    s.nickname.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">Performance Report</h2>
              {session?.class ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Lock size={9} /> {session.class.name}
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary text-muted-foreground border border-border">
                  <Globe size={9} /> Public
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-1">{event.title} • {session?.quiz?.title}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
              </div>
              <div className={cn("p-2.5 rounded-xl bg-primary/10", stat.color)}>
                <stat.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Score Distribution */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 size={18} /> Score Distribution
            </h3>
            <span className="text-xs text-muted-foreground">{total} submissions</span>
          </div>
          <div className="h-48 flex items-end gap-3 border-b border-border pb-2">
            {buckets.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full bg-primary/10 group-hover:bg-primary/30 border-t-4 border-primary rounded-t-lg transition-all relative"
                  style={{ height: `${(count / maxBucket) * 100}%`, minHeight: count > 0 ? "8px" : "0" }}
                >
                  {count > 0 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-foreground">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{i * 20}–{(i + 1) * 20}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Question Performance */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold">Question Analysis</h3>
            <p className="text-xs text-muted-foreground">% answered correctly</p>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-48">
            {questionStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : questionStats.map((q: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="truncate pr-4 text-foreground/80">{i + 1}. {q.text}</span>
                  <span className="text-primary shrink-0">{q.pct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${q.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Results */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users size={18} /> Student Results
          </h3>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">No data</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/30 text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3">Student</th>
                <th className="text-center px-6 py-3">Score</th>
                <th className="text-center px-6 py-3">Time</th>
                <th className="text-center px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((sub) => {
                const pct = sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;
                const passed = pct >= passingScore;
                const m = Math.floor(sub.timeTakenSeconds / 60);
                const s = sub.timeTakenSeconds % 60;
                return (
                  <tr key={sub.id} className="hover:bg-secondary/30 transition">
                    <td className="px-6 py-4 font-medium">{sub.nickname}</td>
                    <td className="px-6 py-4 text-center font-semibold">{pct}%</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {m}:{String(s).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full border",
                        passed ? "text-green-500 border-green-500/30 bg-green-500/10" : "text-red-500 border-red-500/30 bg-red-500/10"
                      )}>
                        {passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
