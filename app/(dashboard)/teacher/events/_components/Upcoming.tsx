'use client';

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Copy, Globe, ShieldCheck, ExternalLink,
  Timer, Check, Download, QrCode, Play, Loader2, Lock, Users
} from "lucide-react";

interface Props {
  event: any;
  onBack: () => void;
  onActivated?: () => void;
}

export default function QuizWaitingView({ event, onBack, onActivated }: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [activating, setActivating] = useState(false);

  const studentLink = typeof window !== "undefined"
    ? `${window.location.origin}/quiz-session/${event.id}`
    : `/quiz-session/${event.id}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(studentLink)}&color=6366f1`;

  // Countdown to scheduledAt
  useEffect(() => {
    if (!event.scheduledAt) return;
    let timer: ReturnType<typeof setInterval>;
    const update = () => {
      const left = Math.max(0, Math.floor((new Date(event.scheduledAt).getTime() - Date.now()) / 1000));
      setTimeLeft(left);
      // Auto-activate khi đến giờ
      if (left === 0) {
        clearInterval(timer);
        handleActivate();
      }
    };
    update();
    timer = setInterval(update, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.scheduledAt]);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const mins = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const handleCopy = () => {
    navigator.clipboard.writeText(studentLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      const res = await fetch(`/api/sessions/${event.id}/activate`, { method: "POST" });
      if (res.ok) {
        onActivated?.();
        onBack();
      }
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Events</span>
        </button>
        <button
          onClick={handleActivate}
          disabled={activating}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:opacity-90 transition active:scale-95 disabled:opacity-60"
        >
          {activating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
          Start Now
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-4xl p-8 space-y-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase border border-blue-500/20">
                  Upcoming
                </span>
                {event.class ? (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase border border-indigo-500/20">
                    <Lock size={10} /> {event.class.name}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-[10px] font-black uppercase border border-border">
                    <Globe size={10} /> Public
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-black tracking-tight">{event.title}</h2>
              <p className="text-muted-foreground font-medium">{event.quiz?.title}</p>
              {event.class ? (
                <div className="flex items-center gap-2 pt-1">
                  <Users size={15} className="text-indigo-500" />
                  <span className="text-sm font-semibold text-indigo-500">
                    Class event — only enrolled students in <span className="underline underline-offset-2">{event.class.name}</span> can join
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-muted-foreground">PIN:</span>
                  <span className="font-mono text-2xl font-black text-primary tracking-[0.3em]">{event.pin}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Link copy */}
              <div className="space-y-3">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} /> Student Access Link
                </p>
                <div className="bg-secondary/50 border border-border rounded-xl px-4 py-3 font-mono text-xs truncate text-muted-foreground">
                  {studentLink}
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition active:scale-95",
                    isCopied ? "bg-green-500 text-white" : "bg-primary text-white hover:opacity-90"
                  )}
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  {isCopied ? "Copied!" : "Copy Link"}
                </button>
              </div>

              {/* QR */}
              <div className="bg-background border border-border p-4 rounded-2xl flex flex-col items-center gap-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <QrCode size={12} /> Scan to Join
                </p>
                <div className="bg-white p-2 rounded-xl shadow-inner border border-border">
                  <img src={qrUrl} alt="QR Code" className="w-32 h-32 object-contain" />
                </div>
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline">
                  <Download size={12} /> Download QR
                </button>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground italic">
              * Students can use the link or scan the QR code. Click "Start Now" to open the exam early, or wait until the scheduled time.
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Anti-Cheat</p>
                <p className="font-bold">Tab Switch Monitor</p>
              </div>
            </div>
            <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                <ExternalLink size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Duration</p>
                <p className="font-bold">{event.durationMinutes} minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — countdown */}
        <div className="bg-card border border-border rounded-4xl p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
            <Timer size={40} />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
              {event.scheduledAt ? "Starts In" : "No Schedule Set"}
            </p>
            {event.scheduledAt ? (
              <>
                <h3 className="text-3xl font-black font-mono">{hours} : {mins} : {secs}</h3>
                <div className="flex justify-between text-[10px] text-muted-foreground font-bold px-2 uppercase">
                  <span>Hrs</span><span>Min</span><span>Sec</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Click "Start Now" to begin manually</p>
            )}
          </div>

          {event.scheduledAt && (
            <div className="w-full pt-4 border-t border-border space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled:</span>
                <span className="font-bold">
                  {new Date(event.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start At:</span>
                <span className="font-bold">
                  {new Date(event.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            System will open automatically at scheduled time, or you can click "Start Now" to begin early.
          </p>
        </div>
      </div>
    </div>
  );
}
