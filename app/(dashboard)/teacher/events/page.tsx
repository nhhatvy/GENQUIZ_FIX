"use client";

import { BookOpen, CalendarPlus, MoreVertical, Search, Clock, Users, Loader2, Globe, Lock } from "lucide-react";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useConfirm } from "@/app/_components/ConfirmModal";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

import ScheduleModal from "./_components/ScheduleModal";

type SessionEvent = {
  id: string;
  title: string;
  pin: string;
  status: "Upcoming" | "Active" | "Completed";
  scheduledAt: string | null;
  durationMinutes: number;
  targetClass: string | null;
  classId: string | null;
  class: { id: string; name: string } | null;
  quiz: { id: string; title: string };
  _count: { submissions: number };
  createdAt: string;
  endTime: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-red-500/10 text-red-500",
  Upcoming: "bg-blue-500/10 text-blue-500",
  Completed: "bg-green-500/10 text-green-500",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Not scheduled";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizIdFromUrl = searchParams.get("quizId");
  const { confirmModal, askConfirm } = useConfirm();

  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All Events");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SessionEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) setEvents(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Poll khi có session chưa kết thúc (Upcoming hoặc Active)
  const hasLive = events.some((e) => e.status === "Upcoming" || e.status === "Active");
  useEffect(() => {
    if (!hasLive) return;
    const interval = setInterval(fetchEvents, 15000); // 15s
    return () => clearInterval(interval);
  }, [hasLive, fetchEvents]);

  useEffect(() => {
    if (quizIdFromUrl) setModalOpen(true);
  }, [quizIdFromUrl]);

  const handleDelete = async (id: string) => {
    if (!await askConfirm("Delete this event?", { title: "Delete Event", confirmText: "Delete", variant: "danger" })) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (res.ok) setEvents((e) => e.filter((ev) => ev.id !== id));
    } finally {
      setDeletingId(null);
      setActiveMenu(null);
    }
  };

  const handleEdit = (event: SessionEvent) => {
    setEditingEvent(event);
    setModalOpen(true);
    setActiveMenu(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleModalSave = (saved: SessionEvent) => {
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === saved.id);
      return exists ? prev.map((e) => (e.id === saved.id ? saved : e)) : [saved, ...prev];
    });
    handleModalClose();
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = events
    .filter((e) => activeTab === "All Events" || e.status === activeTab)
    .filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {confirmModal}
      {activeMenu && <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />}

      <ScheduleModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSaved={handleModalSave}
        initialQuizId={quizIdFromUrl}
        editingEvent={editingEvent}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quiz Events</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Schedule and manage quiz sessions for your students
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition"
        >
          <CalendarPlus size={18} /> Schedule Event
        </button>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 space-y-6 shadow-sm">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex p-1 bg-secondary/50 rounded-lg border border-border w-fit">
            {["All Events", "Active", "Upcoming", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-semibold transition",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 w-64 transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {events.length === 0 ? "No events yet. Create your first event!" : "No events found."}
            </div>
          ) : (
            filtered.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-4 hover:border-primary hover:shadow-md transition-all group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                        STATUS_STYLE[event.status]
                      )}>
                        {event.status}
                      </span>
                      {event.class ? (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold">
                          <Lock size={9} /> {event.class.name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                          <Globe size={9} /> Public
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{event.quiz.title}</p>
                    <div className="flex gap-4 text-muted-foreground text-xs mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatDate(event.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {event._count.submissions} submissions
                      </span>
                      <span className="font-mono text-primary/70">PIN: {event.pin}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/teacher/events/${event.id}`)}
                    className="px-4 py-1.5 text-sm border border-border rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-primary/40 transition font-medium"
                  >
                    {event.status === "Active" ? "View Live" : event.status === "Upcoming" ? "Waiting Room" : "View Report"}
                  </button>

                  <div className={cn("relative", activeMenu === event.id && "z-50")}>
                    <button
                      onClick={() => setActiveMenu(activeMenu === event.id ? null : event.id)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center border rounded-md transition",
                        activeMenu === event.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "text-muted-foreground border-border hover:bg-secondary"
                      )}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenu === event.id && (
                      <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in zoom-in-95 duration-100">
                        {event.status === "Upcoming" && (
                          <button
                            onClick={() => { handleEdit(event); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition"
                          >
                            Edit Event
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(event.id)}
                          disabled={deletingId === event.id}
                          className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {deletingId === event.id && <Loader2 size={12} className="animate-spin" />}
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>}>
      <EventsContent />
    </Suspense>
  );
}
