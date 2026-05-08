'use client';

import {
  ArrowLeft, BarChart3, Trophy, Users, UsersRound,
  Globe, Lock, Hash, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const DIFF_COLOR: Record<string, string> = {
  Easy: "bg-green-500/10 text-green-500",
  Medium: "bg-orange-500/10 text-orange-500",
  Hard: "bg-red-500/10 text-red-500",
};

export default function StudyGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/study-groups/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setSession(data); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Study group not found.
      </div>
    );
  }

  const subs = session.submissions ?? [];
  const total = subs.length;
  const avgScore = total === 0 ? 0 : Math.round(
    subs.reduce((acc: number, s: any) =>
      acc + (s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0), 0) / total
  );
  const topScore = total === 0 ? 0 : Math.round(
    Math.max(...subs.map((s: any) => s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0))
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push("/student/study-group")}
            className="p-2 hover:bg-secondary rounded-lg border border-border transition mt-0.5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">{session.title}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{session.quiz.title}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase", DIFF_COLOR[session.quiz.difficulty])}>
                {session.quiz.difficulty}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {session.quiz.category}
              </span>
              {session.invitedEmails ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
                  <Lock size={9} /> Invite Only
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 flex items-center gap-1">
                  <Globe size={9} /> Public
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 mt-1">
          <Hash size={12} />
          <span className="font-mono font-bold text-foreground tracking-widest">{session.pin}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Attempts", value: String(total), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Average Score", value: total ? `${avgScore}%` : "—", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Top Score", value: total ? `${topScore}%` : "—", icon: Trophy, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((st, i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-muted-foreground text-xs font-medium">{st.label}</p>
              <p className="text-2xl font-bold mt-1">{st.value}</p>
            </div>
            <div className={cn("p-3 rounded-xl shrink-0", st.bg, st.color)}>
              <st.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Submissions table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2"><Users size={16} /> Submissions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">All attempts for this study group</p>
        </div>
        {total === 0 ? (
          <div className="py-14 text-center space-y-2">
            <UsersRound size={36} className="mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No submissions yet. Share the PIN to invite others.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Correct</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subs.map((sub: any, i: number) => {
                  const pct = sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;
                  const correct = sub.answers.filter((a: any) => a.isCorrect).length;
                  const mins = Math.floor(sub.timeTakenSeconds / 60).toString().padStart(2, "0");
                  const secs = (sub.timeTakenSeconds % 60).toString().padStart(2, "0");
                  const passed = pct >= session.quiz.passingScore;
                  return (
                    <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-5 py-3.5 font-medium">{sub.user?.name ?? sub.nickname}</td>
                      <td className={cn("px-5 py-3.5 font-bold", passed ? "text-green-500" : "text-red-500")}>
                        {pct}%
                        <span className={cn("ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded", passed ? "bg-green-500/10" : "bg-red-500/10")}>
                          {passed ? "Pass" : "Fail"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{correct}/{sub.answers.length}</td>
                      <td className="px-5 py-3.5 text-muted-foreground font-mono">{mins}:{secs}</td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">
                        {new Date(sub.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
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
