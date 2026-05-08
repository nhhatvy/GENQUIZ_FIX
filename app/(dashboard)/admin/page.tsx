'use client';

import {
  Users, ShieldAlert, Activity, BookOpen,
  ArrowUpRight, Flag, Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardData {
  stats: { totalUsers: number; pendingReports: number; activeSessions: number; totalQuizzes: number };
  recentReports: {
    id: string;
    reason: string;
    status: string;
    createdAt: string;
    quiz: { title: string };
    reporter: { name: string | null };
  }[];
  newUsers: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
  }[];
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function displayName(u: { name: string | null; firstName: string | null; lastName: string | null }) {
  return u.name ?? ([u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown");
}

function priorityFromReason(reason: string): "High" | "Medium" | "Low" {
  if (reason === "Inappropriate") return "High";
  if (reason === "Spam") return "Medium";
  return "Low";
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const stats = data ? [
    { label: "Total Users", value: data.stats.totalUsers.toLocaleString(), icon: <Users size={20} />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Reports", value: String(data.stats.pendingReports), icon: <ShieldAlert size={20} />, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Active Sessions", value: String(data.stats.activeSessions), icon: <Activity size={20} />, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Quizzes", value: data.stats.totalQuizzes.toLocaleString(), icon: <BookOpen size={20} />, color: "text-purple-500", bg: "bg-purple-500/10" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">System Overview</h2>
          <p className="text-muted-foreground mt-1 text-sm">Platform statistics and recent activity</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-center h-24">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            ))
          : stats.map((stat, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm group hover:border-primary/50 transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <h3 className="text-2xl font-semibold text-foreground">{stat.value}</h3>
                  </div>
                  <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-end relative z-10">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recent Violation Reports</h2>
              <p className="text-muted-foreground text-sm">Pending reports waiting for review</p>
            </div>
            <Link href="/admin/reports" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
          ) : !data?.recentReports.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No pending reports</p>
          ) : (
            <div className="space-y-3">
              {data.recentReports.map((report) => {
                const priority = priorityFromReason(report.reason);
                return (
                  <div key={report.id} className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4 hover:bg-secondary/30 transition">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        priority === "High" ? "bg-red-500/10 text-red-500" : priority === "Medium" ? "bg-orange-500/10 text-orange-500" : "bg-secondary text-muted-foreground"
                      )}>
                        <Flag size={18} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">
                          {report.reason} — <span className="text-muted-foreground font-normal">{report.quiz.title}</span>
                        </h4>
                        <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                          <span>by {report.reporter.name ?? "Unknown"}</span>
                          <span>{timeAgo(report.createdAt)}</span>
                          <span className={cn(priority === "High" ? "text-red-500" : priority === "Medium" ? "text-orange-500" : "")}>
                            {priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/admin/reports"
                      className="px-4 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-primary hover:text-primary-foreground transition shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        </div>

        {/* New Registrations */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-foreground">New Registrations</h2>
            <p className="text-muted-foreground text-sm">Latest users joined the platform</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
          ) : !data?.newUsers.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
          ) : (
            <div className="space-y-4">
              {data.newUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border border-border text-muted-foreground shrink-0">
                      {displayName(user).charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden max-w-32">
                      <p className="text-sm font-medium text-foreground truncate">{displayName(user)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(user.createdAt)}</span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/accounts"
            className="block w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition text-center"
          >
            Manage All Accounts
          </Link>
        </div>
      </div>
    </div>
  );
}
