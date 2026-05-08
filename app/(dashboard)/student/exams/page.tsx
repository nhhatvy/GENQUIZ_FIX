'use client';

import {
  GraduationCap, Clock, CheckCircle2, Loader2,
  ChevronRight, BookOpen, Radio, Globe, Lock, Mail, User, ClipboardCheck,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface ExamSession {
  id: string;
  title: string;
  status: string;
  pin: string;
  scheduledAt: string | null;
  durationMinutes: number;
  classId: string | null;
  invitedEmails: string | null;
  quiz: {
    id: string; title: string; category: string;
    creator: { name: string | null; firstName: string | null; lastName: string | null };
  };
  _count: { submissions: number };
  submissions: { id: string; totalScore: number; maxScore: number; createdAt: string }[];
}

function creatorName(c: { name: string | null; firstName: string | null; lastName: string | null }) {
  return c.name ?? ([c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown");
}

function accessBadge(s: ExamSession, userEmail: string) {
  if (s.classId) return { icon: <Lock size={10} />, label: "Class", cls: "bg-blue-500/10 text-blue-500" };
  if (s.invitedEmails?.includes(userEmail)) return { icon: <Mail size={10} />, label: "Invited", cls: "bg-purple-500/10 text-purple-500" };
  return { icon: <Globe size={10} />, label: "Public", cls: "bg-green-500/10 text-green-500" };
}

const TABS = ["All", "Upcoming", "Active", "Completed"];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function StudentExamsPage() {
  const router = useRouter();
  const { data: authSession } = useSession();
  const userEmail = authSession?.user?.email ?? "";
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "All") params.set("status", activeTab);
    const res = await fetch(`/api/student/exams?${params}`);
    if (res.ok) setSessions(await res.json());
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const statusConfig = (status: string) => {
    if (status === "Active") return { dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]", badge: "bg-red-500/10 text-red-500", label: "Active" };
    if (status === "Upcoming") return { dot: "bg-blue-500", badge: "bg-blue-500/10 text-blue-500", label: "Upcoming" };
    return { dot: "bg-green-500", badge: "bg-green-500/10 text-green-500", label: "Completed" };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Exams</h2>
        <p className="text-muted-foreground mt-1 text-sm">Quiz sessions you have access to join</p>
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex p-1 bg-secondary/50 rounded-lg border border-border w-fit">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-semibold transition",
                  activeTab === tab ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <GraduationCap size={40} className="text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No exams found</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {sessions.map((s) => {
                const cfg = statusConfig(s.status);
                const access = accessBadge(s, userEmail);
                const myBest = s.submissions[0];
                const scorePercent = myBest && myBest.maxScore > 0
                  ? Math.round((myBest.totalScore / myBest.maxScore) * 100)
                  : null;

                return (
                  <div
                    key={s.id}
                    onClick={() => router.push(`/student/exams/${s.id}`)}
                    className="flex items-center justify-between py-4 px-2 hover:bg-secondary/20 rounded-lg transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        {s.status === "Active" ? <Radio size={18} /> : s.status === "Completed" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">{s.title}</p>
                          <span className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full", access.cls)}>
                            {access.icon} {access.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BookOpen size={11} /> {s.quiz.title}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User size={11} /> {creatorName(s.quiz.creator)}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="text-xs text-muted-foreground">{s.quiz.category}</span>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="text-xs text-muted-foreground">{s.durationMinutes} min</span>
                          {s.scheduledAt && (
                            <>
                              <span className="text-muted-foreground/40 text-xs">·</span>
                              <span className="text-xs text-muted-foreground">{formatDate(s.scheduledAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {s.submissions.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          <ClipboardCheck size={10} />
                          {s._count.submissions} attempt{s._count.submissions > 1 ? "s" : ""}
                        </span>
                      )}
                      {scorePercent !== null && (
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          scorePercent >= 70 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                          Best: {scorePercent}%
                        </span>
                      )}
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1", cfg.badge)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                        {cfg.label}
                      </span>
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
