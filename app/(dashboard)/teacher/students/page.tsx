'use client';

import {
  Plus, Trash2, UserPlus, Users, ChevronRight,
  Search, Loader2, X, BookOpen, Mail,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/app/_components/ConfirmModal";

interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: { enrollments: number; sessions: number };
}

interface EnrolledStudent {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    _count: { submissions: number };
  };
}

export default function StudentsPage() {
  const { confirmModal, askConfirm } = useConfirm();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected class for detail view
  const [activeClass, setActiveClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Create class modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Add student
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search
  const [search, setSearch] = useState("");

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/classes");
    if (res.ok) setClasses(await res.json());
    setLoading(false);
  }, []);

  const fetchStudents = useCallback(async (classId: string) => {
    setStudentsLoading(true);
    const res = await fetch(`/api/classes/${classId}/enrollments`);
    if (res.ok) setStudents(await res.json());
    setStudentsLoading(false);
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  useEffect(() => {
    if (activeClass) fetchStudents(activeClass.id);
  }, [activeClass, fetchStudents]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) { setCreateError("Class name is required"); return; }
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClassName.trim(), description: newClassDesc.trim() || null }),
    });
    setCreating(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setCreateError(err.message ?? "Failed to create class");
      return;
    }
    const created = await res.json();
    setClasses((prev) => [created, ...prev]);
    setShowCreateModal(false);
    setNewClassName(""); setNewClassDesc("");
  };

  const handleDeleteClass = async (cls: ClassItem) => {
    if (!await askConfirm(`This will remove all enrollments in "${cls.name}".`, { title: "Delete Class?", confirmText: "Delete", variant: "danger" })) return;
    await fetch(`/api/classes/${cls.id}`, { method: "DELETE" });
    setClasses((prev) => prev.filter((c) => c.id !== cls.id));
    if (activeClass?.id === cls.id) setActiveClass(null);
  };

  const handleEmailChange = async (val: string) => {
    setAddEmail(val);
    if (val.trim().length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(val.trim())}`);
    if (res.ok) {
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    }
  };

  const handleAddStudent = async () => {
    if (!addEmail.trim() || !activeClass) return;
    setAdding(true);
    setAddError("");
    setSuggestions([]);
    setShowSuggestions(false);
    const res = await fetch(`/api/classes/${activeClass.id}/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: addEmail.trim() }),
    });
    setAdding(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setAddError(err.message ?? "Failed to add student");
      return;
    }
    const enrollment = await res.json();
    setStudents((prev) => [...prev, enrollment]);
    setClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? { ...c, _count: { ...c._count, enrollments: c._count.enrollments + 1 } }
          : c
      )
    );
    setAddEmail(""); setShowAddStudent(false);
  };

  const handleRemoveStudent = async (enrollment: EnrolledStudent) => {
    if (!activeClass) return;
    if (!await askConfirm(`Remove ${enrollment.user.name ?? enrollment.user.email} from this class?`, { title: "Remove Student", confirmText: "Remove", variant: "danger" })) return;
    await fetch(`/api/classes/${activeClass.id}/enrollments?userId=${enrollment.user.id}`, { method: "DELETE" });
    setStudents((prev) => prev.filter((s) => s.id !== enrollment.id));
    setClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? { ...c, _count: { ...c._count, enrollments: Math.max(0, c._count.enrollments - 1) } }
          : c
      )
    );
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.user.name?.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {confirmModal}
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Students</h2>
          <p className="text-muted-foreground text-sm">Manage your classes and enrolled students</p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setCreateError(""); setNewClassName(""); setNewClassDesc(""); }}
          className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
        >
          <Plus size={16} /> New Class
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CLASS LIST */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Classes</h3>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : classes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
              <Users size={32} className="mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No classes yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Create your first class
              </button>
            </div>
          ) : (
            classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => setActiveClass(cls)}
                className={cn(
                  "rounded-xl border bg-card p-4 cursor-pointer transition-all group",
                  activeClass?.id === cls.id
                    ? "border-primary ring-1 ring-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{cls.name}</p>
                    {cls.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{cls.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {cls._count.enrollments} students
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={11} /> {cls._count.sessions} events
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <ChevronRight
                      size={16}
                      className={cn(
                        "text-muted-foreground transition",
                        activeClass?.id === cls.id && "text-primary"
                      )}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CLASS DETAIL */}
        <div className="lg:col-span-2">
          {!activeClass ? (
            <div className="rounded-xl border border-dashed border-border h-full min-h-75 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Users size={40} className="mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">Select a class to manage students</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              {/* Class header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/10">
                <div>
                  <h3 className="font-bold text-lg">{activeClass.name}</h3>
                  {activeClass.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{activeClass.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowAddStudent(true); setAddEmail(""); setAddError(""); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium"
                  >
                    <UserPlus size={14} /> Add Student
                  </button>
                  <button
                    onClick={() => handleDeleteClass(activeClass)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    title="Delete class"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Add student inline form */}
              {showAddStudent && (
                <div className="p-4 border-b border-border bg-primary/5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      <input
                        autoFocus
                        value={addEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder="Student email address"
                        className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                          {suggestions.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onMouseDown={() => {
                                setAddEmail(s.email);
                                setShowSuggestions(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-left transition"
                            >
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                {(s.name ?? s.email)[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                {s.name && <p className="text-sm font-medium truncate">{s.name}</p>}
                                <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleAddStudent}
                      disabled={adding}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-60 flex items-center gap-1"
                    >
                      {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddStudent(false); setSuggestions([]); setShowSuggestions(false); }}
                      className="p-2 hover:bg-secondary rounded-lg transition text-muted-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {addError && <p className="text-xs text-red-500 mt-1">{addError}</p>}
                </div>
              )}

              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students..."
                    className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Student list */}
              {studentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Users size={32} className="mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {students.length === 0 ? "No students enrolled yet" : "No students match your search"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredStudents.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/20 transition group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {(enrollment.user.name ?? enrollment.user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {enrollment.user.name ?? <span className="text-muted-foreground italic">No name</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{enrollment.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {enrollment.user._count.submissions} submissions
                        </span>
                        <button
                          onClick={() => handleRemoveStudent(enrollment)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                          title="Remove student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE CLASS MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Create New Class</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-secondary rounded-lg transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Class Name *</label>
                <input
                  autoFocus
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateClass()}
                  placeholder="e.g. Class 10A, Group A"
                  className={cn(
                    "w-full bg-background border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition",
                    createError ? "border-red-500" : "border-border"
                  )}
                />
                {createError && <p className="text-xs text-red-500">{createError}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Description <span className="font-normal">(optional)</span></label>
                <input
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="e.g. Morning session, Semester 1"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-semibold hover:bg-secondary rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateClass}
                disabled={creating}
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
