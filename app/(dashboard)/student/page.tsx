"use client";

import {
  BookOpen, Trophy, Users, Flame,
  ChevronRight, Calendar, Clock, CheckCircle2,
  XCircle, Loader2, Play, Plus, Library, Zap, X, Hash, ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface DashboardData {
  stats: { totalCompleted: number; avgScore: number; classCount: number; studyGroupCount: number };
  recentSubmissions: {
    id: string;
    totalScore: number;
    maxScore: number;
    pct: number;
    timeTakenSeconds: number;
    createdAt: string;
    sessionTitle: string;
    quizTitle: string;
    quizCategory: string;
  }[];
  upcomingSessions: {
    id: string;
    title: string;
    status: string;
    pin: string;
    scheduledAt: string | null;
    durationMinutes: number;
    className: string;
    quiz: { id: string; title: string };
  }[];
  classes: { id: string; name: string; description: string | null; joinedAt: string }[];
}

const TIPS = [
  "Take regular breaks during study sessions to improve retention.",
  "Review your wrong answers after each quiz to learn faster.",
  "Joining a study group boosts motivation and accountability.",
  "Consistent daily practice beats cramming the night before.",
  "Explaining concepts to others is the best way to master them.",
];

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function StudentDashboard() {
  const { data: authSession } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClasses, setShowClasses] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const tip = TIPS[new Date().getDay() % TIPS.length];

  const handleJoinPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setPinError('');
    setPinLoading(true);
    try {
      const res = await fetch(`/api/public/pin/${pin.trim()}`);
      if (!res.ok) { setPinError('Invalid PIN. Please try again.'); return; }
      const session = await res.json();
      router.push(`/quiz-session/${session.id}`);
    } catch {
      setPinError('Something went wrong.');
    } finally {
      setPinLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const name = authSession?.user?.name ?? authSession?.user?.email ?? "Student";
  const firstName = name.split(" ")[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = [
    {
      label: "Quizzes Completed",
      value: String(data?.stats.totalCompleted ?? 0),
      icon: BookOpen,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Average Score",
      value: `${data?.stats.avgScore ?? 0}%`,
      icon: Trophy,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Study Groups",
      value: String(data?.stats.studyGroupCount ?? 0),
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Classes",
      value: String(data?.stats.classCount ?? 0),
      icon: Flame,
      color: "text-green-500",
      bg: "bg-green-500/10",
      onClick: () => setShowClasses(true),
    },
  ];

  return (
    <>
    <div className="space-y-8 pb-10">
      {/* WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-purple-600 to-indigo-900 p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-purple-200 mt-1 text-sm">
              Ready to continue your learning journey?
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/student/study-group")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-50 transition active:scale-95"
            >
              <Users size={15} /> Join Study Group
            </button>
            <button
              onClick={() => router.push("/student/myquizzes")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15 border border-white/25 text-white rounded-xl text-sm font-bold hover:bg-white/25 transition active:scale-95"
            >
              <Plus size={15} /> Create Quiz
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 translate-x-20" />
      </div>

      {/* PIN JOIN BAR */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <div className="flex items-center gap-3 w-full bg-card border border-border rounded-2xl px-5 py-3.5 shadow-sm focus-within:border-primary/50 transition-all">
          <Hash size={16} className="text-primary shrink-0" />
          <span className="text-sm font-semibold text-foreground hidden sm:block whitespace-nowrap">Join a quiz session</span>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <input
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setPinError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinPin(e as any)}
            placeholder="Enter 6-digit PIN"
            className="flex-1 bg-transparent outline-none text-sm font-mono font-bold tracking-widest placeholder:tracking-normal placeholder:font-sans placeholder:text-muted-foreground"
            maxLength={6}
            inputMode="numeric"
            disabled={pinLoading}
          />
          <button
            onClick={(e) => handleJoinPin(e as any)}
            disabled={pin.length !== 6 || pinLoading}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-black hover:opacity-90 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pinLoading ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
            Join
          </button>
        </div>
        {pinError && <p className="text-xs text-red-500 font-medium self-start pl-1">{pinError}</p>}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={stat.onClick}
            className={cn(
              "bg-card border border-border p-5 rounded-2xl flex flex-col justify-between hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group",
              stat.onClick && "cursor-pointer"
            )}
          >
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} w-fit group-hover:scale-110 transition`}>
              <stat.icon size={20} />
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">

          {/* UPCOMING EVENTS */}
          {(data?.upcomingSessions ?? []).length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Flame size={20} className="text-orange-500" /> Upcoming Challenges
              </h2>
              <div className="space-y-3">
                {data!.upcomingSessions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-primary/50 hover:shadow-sm transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users size={11} /> {s.className}
                        </span>
                        {s.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(s.scheduledAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {s.durationMinutes}m
                        </span>
                      </div>
                    </div>
                    {s.status === "Active" ? (
                      <button
                        onClick={() => router.push(`/quiz-session/${s.id}`)}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition"
                      >
                        <Play size={12} fill="currentColor" /> Join Now
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1.5 rounded-xl">
                        Upcoming
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* RECENT RESULTS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Results</h2>
              {(data?.recentSubmissions ?? []).length > 0 && (
                <span className="text-xs text-muted-foreground">{data!.recentSubmissions.length} attempts</span>
              )}
            </div>

            {(data?.recentSubmissions ?? []).length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center space-y-3">
                <BookOpen size={36} className="mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">No quiz attempts yet.</p>
                <button
                  onClick={() => router.push("/student/study-group")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition"
                >
                  <Users size={14} /> Join a Study Group
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {data!.recentSubmissions.map((s) => (
                  <div
                    key={s.id}
                    className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 hover:border-primary/30 hover:shadow-sm transition"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      s.pct >= 70 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {s.pct >= 70 ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{s.quizTitle}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{s.quizCategory}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {fmt(s.timeTakenSeconds)}
                        </span>
                        <span>{timeAgo(s.createdAt)}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className={cn(
                        "text-lg font-black",
                        s.pct >= 70 ? "text-green-500" : "text-red-500"
                      )}>
                        {s.pct}%
                      </p>
                      <p className="text-xs text-muted-foreground">{s.totalScore}/{s.maxScore} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-5">

          {/* SCORE HISTORY */}
          {(data?.recentSubmissions ?? []).length > 0 && (
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy size={15} className="text-orange-500" /> Score History
              </h3>
              <div className="space-y-3">
                {data!.recentSubmissions.slice(0, 5).map((s) => (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="truncate text-muted-foreground max-w-32">{s.quizTitle}</span>
                      <span className={cn(
                        "font-bold shrink-0 ml-2",
                        s.pct >= 70 ? "text-green-500" : "text-red-500"
                      )}>{s.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          s.pct >= 70 ? "bg-green-500" : "bg-red-500"
                        )}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUICK ACTIONS */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap size={15} className="text-primary" /> Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/student/myquizzes")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition text-sm font-semibold"
              >
                <div className="w-7 h-7 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0">
                  <Plus size={14} />
                </div>
                Create New Quiz
                <ChevronRight size={14} className="ml-auto" />
              </button>
              <button
                onClick={() => router.push("/student/study-group")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition text-sm font-semibold"
              >
                <div className="w-7 h-7 bg-secondary border border-border rounded-lg flex items-center justify-center shrink-0">
                  <Users size={14} className="text-muted-foreground" />
                </div>
                Join Study Group
                <ChevronRight size={14} className="ml-auto text-muted-foreground" />
              </button>
              <button
                onClick={() => router.push("/student/library")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition text-sm font-semibold"
              >
                <div className="w-7 h-7 bg-secondary border border-border rounded-lg flex items-center justify-center shrink-0">
                  <Library size={14} className="text-muted-foreground" />
                </div>
                Browse Library
                <ChevronRight size={14} className="ml-auto text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* LEARNING TIP */}
          <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl">
            <h3 className="font-bold text-sm flex items-center gap-2 text-orange-500 mb-2">
              <Zap size={14} /> Learning Tip
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        </div>
      </div>
    </div>

    {/* CLASSES MODAL */}

    {showClasses && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={() => setShowClasses(false)}
      >
        <div
          className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Flame size={18} className="text-green-500" /> My Classes
            </h2>
            <button
              onClick={() => setShowClasses(false)}
              className="p-1.5 rounded-lg hover:bg-secondary transition"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-5 space-y-3">
            {(data?.classes ?? []).length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Users size={36} className="mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">You haven't joined any classes yet.</p>
              </div>
            ) : (
              data!.classes.map((cls) => (
                <div key={cls.id} className="bg-secondary/50 border border-border rounded-xl p-4 space-y-1">
                  <p className="font-semibold text-sm">{cls.name}</p>
                  {cls.description && (
                    <p className="text-xs text-muted-foreground">{cls.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={10} />
                    Joined {new Date(cls.joinedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
