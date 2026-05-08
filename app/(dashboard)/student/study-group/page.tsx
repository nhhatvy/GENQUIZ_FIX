'use client';

import {
  UsersRound, BookOpen, Search, Plus, Clock, Hash,
  Loader2, UserPlus, Trash2, Globe, Lock, X, Check,
  Pencil, MoreVertical, BarChart3,
} from "lucide-react";
import EmailSuggestInput from "@/app/_components/EmailSuggestInput";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useConfirm } from "@/app/_components/ConfirmModal";
import { useRouter, useSearchParams } from "next/navigation";



interface StudySession {
  id: string;
  title: string;
  pin: string;
  status: string;
  durationMinutes: number;
  invitedEmails: string | null;
  studentCreatorId: string;
  studentCreator: { id: string; name: string | null };
  quiz: { id: string; title: string; category: string; difficulty: string };
  _count: { submissions: number };
  createdAt: string;
}

interface MyQuiz { id: string; title: string; _count: { questions: number } }

const DIFF_COLOR: Record<string, string> = {
  Easy: "bg-green-500/10 text-green-500",
  Medium: "bg-orange-500/10 text-orange-500",
  Hard: "bg-red-500/10 text-red-500",
};

function StudyGroupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [myId, setMyId] = useState<string>("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [myQuizzes, setMyQuizzes] = useState<MyQuiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [lockedQuizId, setLockedQuizId] = useState<string | null>(null);
  const [groupTitle, setGroupTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  // Edit modal
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editEmailInput, setEditEmailInput] = useState("");
  const [editEmails, setEditEmails] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { confirmModal, askConfirm } = useConfirm();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/student/study-groups");
    if (res.ok) setSessions(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user?.id) setMyId(data.user.id);
    });
  }, []);

  const openCreate = async (preselectedQuizId?: string) => {
    setShowCreate(true);
    setSelectedQuizId(preselectedQuizId ?? null);
    setLockedQuizId(preselectedQuizId ?? null);
    setGroupTitle("");
    setIsPublic(true);
    setInvitedEmails([]);
    setEmailInput("");
    setCreateErrors({});
    const res = await fetch("/api/quizzes");
    if (res.ok) setMyQuizzes(await res.json());
  };

  const closeCreate = () => {
    setShowCreate(false);
    setLockedQuizId(null);
  };

  // Auto-open create modal when navigated from quiz detail with quizId param
  const quizIdFromUrl = searchParams.get("quizId");
  useEffect(() => {
    if (quizIdFromUrl) openCreate(quizIdFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizIdFromUrl]);

  const openEdit = (s: StudySession) => {
    setEditingSession(s);
    setEditTitle(s.title);
    const emails = s.invitedEmails ? (() => { try { return JSON.parse(s.invitedEmails!); } catch { return []; } })() : [];
    setEditIsPublic(!s.invitedEmails);
    setEditEmails(emails);
    setEditEmailInput("");
    setActiveMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editingSession) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/student/study-groups/${editingSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          isPublic: editIsPublic,
          invitedEmails: editIsPublic ? [] : editEmails,
        }),
      });
      if (res.ok) {
        await fetchSessions();
        setEditingSession(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await askConfirm("Delete this study group?", { title: "Delete Study Group", confirmText: "Delete", variant: "danger" })) return;
    setActiveMenu(null);
    await fetch(`/api/student/study-groups/${id}`, { method: "DELETE" });
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const addEmail = (email: string, setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@")) return;
    setter(prev => prev.includes(e) ? prev : [...prev, e]);
    inputSetter("");
  };

  const handleCreate = async () => {
    const errs: Record<string, string> = {};
    if (!selectedQuizId) errs.quiz = "Select a quiz";
    if (!groupTitle.trim()) errs.title = "Title is required";
    if (Object.keys(errs).length) { setCreateErrors(errs); return; }

    setCreating(true);
    try {
      const res = await fetch("/api/student/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: selectedQuizId,
          title: groupTitle.trim(),
          isPublic,
          invitedEmails: isPublic ? [] : invitedEmails,
        }),
      });
      if (res.ok) { await fetchSessions(); closeCreate(); }
    } finally {
      setCreating(false);
    }
  };

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.quiz.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      {confirmModal}
      {/* Click-outside for menus */}
      {activeMenu && <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)} />}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Quiz sessions created by students — join, practice, and collaborate
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus size={18} /> Create Group
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search study groups..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <UsersRound size={48} className="mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            {sessions.length === 0 ? "No study groups yet. Create the first one!" : "No groups match your search."}
          </p>
          {sessions.length === 0 && (
            <button onClick={() => openCreate()} className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition">
              <Plus size={16} /> Create Group
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => {
            const isMine = s.studentCreatorId === myId;
            return (
              <div
                key={s.id}
                className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", DIFF_COLOR[s.quiz.difficulty])}>
                          {s.quiz.difficulty}
                        </span>
                        {isMine && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-primary/10 text-primary">
                            Mine
                          </span>
                        )}
                        {s.invitedEmails ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-secondary text-muted-foreground flex items-center gap-1">
                            <Lock size={9} /> Invite Only
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-green-500/10 text-green-500 flex items-center gap-1">
                            <Globe size={9} /> Public
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base leading-tight group-hover:text-primary transition line-clamp-2">
                        {s.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.quiz.title}</p>
                    </div>

                    {/* 3-dot menu (only for mine) */}
                    {isMine && (
                      <div className={cn("relative shrink-0", activeMenu === s.id && "z-40")}>
                        <button
                          onClick={() => setActiveMenu(activeMenu === s.id ? null : s.id)}
                          className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-lg border transition",
                            activeMenu === s.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:bg-secondary"
                          )}
                        >
                          <MoreVertical size={14} />
                        </button>
                        {activeMenu === s.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="p-1.5 flex flex-col">
                              <button
                                onClick={() => openEdit(s)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-lg transition"
                              >
                                <Pencil size={13} /> Edit
                              </button>
                              <div className="my-1 border-t border-border" />
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {s.quiz.category}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {s.durationMinutes} min</span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    By <span className="font-semibold text-foreground">{s.studentCreator.name ?? "Unknown"}</span>
                    {" · "}{s._count.submissions} attempt{s._count.submissions !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Hash size={12} />
                    <span className="font-mono font-bold text-foreground tracking-widest">{s.pin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/student/study-group/${s.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-bold hover:bg-secondary transition text-muted-foreground"
                    >
                      <BarChart3 size={12} /> Results
                    </button>
                    <a
                      href={`/quiz-session/${s.id}`}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition"
                    >
                      Join
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EDIT MODAL ─────────────────────────────────────────────────── */}
      {editingSession && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><Pencil size={16} className="text-primary" /> Edit Study Group</h3>
                <p className="text-xs text-muted-foreground mt-1">Update title, visibility, or invited students</p>
              </div>
              <button onClick={() => setEditingSession(null)} className="p-2 hover:bg-secondary rounded-full transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Session Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Who Can Join</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIsPublic(true)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition",
                      editIsPublic ? "border-green-500 bg-green-500/10 text-green-500" : "border-border text-muted-foreground hover:border-green-500/40"
                    )}
                  >
                    <Globe size={15} /> Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsPublic(false)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition",
                      !editIsPublic ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Lock size={15} /> Invite Only
                  </button>
                </div>
              </div>

              {/* Invited emails */}
              {!editIsPublic && (
                <div className="space-y-2 p-4 bg-secondary/30 border border-border rounded-2xl">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <UserPlus size={12} /> Invited Students
                  </label>
                  <EmailSuggestInput
                    value={editEmailInput}
                    onChange={setEditEmailInput}
                    onAdd={() => addEmail(editEmailInput, setEditEmails, setEditEmailInput)}
                    placeholder="friend@email.com"
                  >
                    <button
                      type="button"
                      onClick={() => addEmail(editEmailInput, setEditEmails, setEditEmailInput)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition"
                    >
                      Add
                    </button>
                  </EmailSuggestInput>
                  {editEmails.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {editEmails.map((email) => (
                        <div key={email} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg px-2.5 py-1 text-xs font-medium">
                          {email}
                          <button type="button" onClick={() => setEditEmails(p => p.filter(e => e !== email))} className="hover:text-red-500 transition">
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">No students invited yet.</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button onClick={() => setEditingSession(null)} className="px-5 py-2.5 text-sm font-semibold hover:bg-secondary rounded-xl transition">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editTitle.trim()}
                className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2 text-sm"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE MODAL ────────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Create Study Group</h3>
                <p className="text-xs text-muted-foreground mt-1">Pick a quiz and invite others to practice</p>
              </div>
              <button onClick={closeCreate} className="p-2 hover:bg-secondary rounded-full transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Quiz selection */}
              {lockedQuizId ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary text-white">
                    <BookOpen size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Quiz</p>
                    <p className="text-sm font-semibold truncate">
                      {myQuizzes.find(q => q.id === lockedQuizId)?.title ?? "Loading..."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Your Quiz {createErrors.quiz && <span className="text-red-500 ml-2 normal-case font-normal">{createErrors.quiz}</span>}
                  </label>
                  {myQuizzes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">You have no quizzes yet. Create one in My Quizzes first.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {myQuizzes.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => setSelectedQuizId(q.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                            selectedQuizId === q.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          )}
                        >
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", selectedQuizId === q.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                            <BookOpen size={13} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{q.title}</p>
                            <p className="text-[10px] text-muted-foreground">{q._count.questions} questions</p>
                          </div>
                          {selectedQuizId === q.id && <Check size={14} className="text-primary shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Session Title {createErrors.title && <span className="text-red-500 ml-1 font-normal">{createErrors.title}</span>}
                </label>
                <input
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="e.g. Weekend Biology Review"
                  className={cn("w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition", createErrors.title ? "border-red-500" : "border-border")}
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Who Can Join</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setIsPublic(true)} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition", isPublic ? "border-green-500 bg-green-500/10 text-green-500" : "border-border text-muted-foreground hover:border-green-500/40")}>
                    <Globe size={15} /> Public
                  </button>
                  <button type="button" onClick={() => setIsPublic(false)} className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition", !isPublic ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
                    <Lock size={15} /> Invite Only
                  </button>
                </div>
              </div>

              {!isPublic && (
                <div className="space-y-2 p-4 bg-secondary/30 border border-border rounded-2xl">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <UserPlus size={12} /> Invite Students by Email
                  </label>
                  <EmailSuggestInput
                    value={emailInput}
                    onChange={setEmailInput}
                    onAdd={() => addEmail(emailInput, setInvitedEmails, setEmailInput)}
                    placeholder="friend@email.com"
                  >
                    <button type="button" onClick={() => addEmail(emailInput, setInvitedEmails, setEmailInput)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition">Add</button>
                  </EmailSuggestInput>
                  {invitedEmails.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {invitedEmails.map((email) => (
                        <div key={email} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg px-2.5 py-1 text-xs font-medium">
                          {email}
                          <button type="button" onClick={() => setInvitedEmails(p => p.filter(e => e !== email))} className="hover:text-red-500 transition"><Trash2 size={11} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">Press Enter or click Add to invite a student.</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button onClick={closeCreate} className="px-5 py-2.5 text-sm font-semibold hover:bg-secondary rounded-xl transition">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2 text-sm">
                {creating && <Loader2 size={15} className="animate-spin" />}
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyGroupPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>}>
      <StudyGroupContent />
    </Suspense>
  );
}
