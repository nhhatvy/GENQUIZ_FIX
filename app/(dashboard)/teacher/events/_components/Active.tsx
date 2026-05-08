'use client';

import { useEffect, useState } from "react";
import { useConfirm } from "@/app/_components/ConfirmModal";
import { cn } from "@/lib/utils";
import { ArrowLeft, Activity, Users, Clock, AlertCircle, CheckCircle2, Zap, Loader2, Globe, Lock } from "lucide-react";

interface Props {
  event: any;
  onBack: () => void;
  onEnded?: () => void;
}

export default function QuizLiveView({ event, onBack, onEnded }: Props) {
  const { confirmModal, askConfirm } = useConfirm();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [ending, setEnding] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [page, setPage] = useState(1);
  const limit = 10; // Số lượng bản ghi mỗi trang
  const totalPages = Math.max(1, Math.ceil(submissions.length / limit));

  const paginatedSubmissions = submissions.slice((page - 1) * limit, page * limit);
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [submissions.length, page, totalPages]);
  // Fetch submissions & poll every 10s
  const fetchSubmissions = async () => {
    const res = await fetch(`/api/sessions/${event.id}`);
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions ?? []);
    }
  };


  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(interval);
  }, [event.id]);

  // Countdown from scheduledAt + durationMinutes — auto-end when reaches 0
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    const update = async () => {
      if (!event.scheduledAt) { setTimeLeft(0); return; }
      const endMs = new Date(event.scheduledAt).getTime() + event.durationMinutes * 60 * 1000;
      const left = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0) {
        clearInterval(timer);
        // Auto-end: session server-side will already be Completed via syncSessionStatuses,
        // but we also call the end API to set endTime and trigger UI update.
        const res = await fetch(`/api/sessions/${event.id}/end`, { method: "POST" });
        if (res.ok) { onEnded?.(); }
      }
    };
    update();
    timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.scheduledAt, event.durationMinutes, event.id]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const handleEnd = async () => {
    if (!await askConfirm("Students will no longer be able to submit.", { title: "End this exam?", confirmText: "End Exam", variant: "danger" })) return;
    setEnding(true);
    try {
      const res = await fetch(`/api/sessions/${event.id}/end`, { method: "POST" });
      if (res.ok) { onEnded?.(); onBack(); }
    } finally {
      setEnding(false);
    }
  };

  const submitted = submissions.length;
  const avgScore = submitted === 0 ? 0
    : Math.round(submissions.reduce((s, sub) => s + (sub.maxScore > 0 ? (sub.totalScore / sub.maxScore) * 100 : 0), 0) / submitted);

  const stats = [
    { label: "Submitted", value: submitted, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Avg Score", value: `${avgScore}%`, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Duration", value: `${event.durationMinutes}m`, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "PIN", value: event.pin, icon: AlertCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {confirmModal}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 border border-border rounded-md hover:bg-secondary transition">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">{event.title}</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20">
                <Zap size={10} fill="currentColor" /> Live
              </span>
              {event.class ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <Lock size={9} /> {event.class.name}
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary text-muted-foreground border border-border">
                  <Globe size={9} /> Public
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{event.quiz?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-3 bg-card border border-border px-4 py-2 rounded-lg shadow-sm">
            <div className="w-9 h-9 bg-red-500/10 rounded-md flex items-center justify-center text-red-500">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Time Remaining</p>
              <p className="text-lg font-mono font-bold">{mins}:{secs}</p>
            </div>
          </div>

          {/* End Quiz */}
          <button
            onClick={handleEnd}
            disabled={ending}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:opacity-90 transition active:scale-95 disabled:opacity-60"
          >
            {ending ? <Loader2 size={16} className="animate-spin" /> : null}
            End Quiz
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card border border-border p-4 rounded-lg flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            </div>
            <div className={cn("w-9 h-9 rounded-md flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Submissions table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Users size={16} /> Live Submissions
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Auto-refreshes every 10 seconds</p>
          </div>
          <button onClick={fetchSubmissions} className="text-xs px-3 py-1.5 border border-border rounded-md hover:bg-secondary transition">
            Refresh
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No submissions yet...
          </div>
        ) : (
          <>
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Student</th>
                <th className="text-center px-5 py-3 font-medium">Score</th>
                <th className="text-center px-5 py-3 font-medium">Time</th>
                <th className="text-center px-5 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedSubmissions.map((sub) => {
                const pct = sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;
                const mins = Math.floor(sub.timeTakenSeconds / 60);
                const secs = sub.timeTakenSeconds % 60;
                return (
                  <tr key={sub.id} className="hover:bg-secondary/30 transition">
                    <td className="px-5 py-3 font-medium">{sub.nickname}</td>
                    <td className="px-5 py-3 text-center font-semibold">{pct}%</td>
                    <td className="px-5 py-3 text-center text-muted-foreground">
                      {mins}:{String(secs).padStart(2, "0")}
                    </td>
                    <td className="px-5 py-3 text-center text-muted-foreground text-xs">
                      {new Date(sub.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
               Page {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg disabled:opacity-50 hover:bg-secondary transition"
                >
                  Next
                </button>
              </div>
            </div>
            </>
        )}
      </div>
    </div>
  );
}
