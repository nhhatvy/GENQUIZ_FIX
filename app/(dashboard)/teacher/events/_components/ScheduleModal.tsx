'use client';

import { X, CalendarPlus, BookOpen, Check, Clock, Target, Loader2, Users, UserPlus, Trash2, Search, ChevronDown } from "lucide-react";
import EmailSuggestInput from "@/app/_components/EmailSuggestInput";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Quiz { id: string; title: string; _count: { questions: number } }
interface ClassOption { id: string; name: string; _count: { enrollments: number } }

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (session: any) => void;
  initialQuizId?: string | null;
  editingEvent?: any | null;
}

export default function ScheduleModal({
  isOpen, onClose, onSaved, initialQuizId, editingEvent,
}: ScheduleModalProps) {
  const isEdit = !!editingEvent;

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("45");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState("");
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

// Lọc danh sách quiz dựa trên nội dung tìm kiếm
const filteredQuizzes = quizzes.filter(q => 
  q.title.toLowerCase().includes(searchQuery.toLowerCase())
);

// Lấy thông tin quiz đang được chọn để hiển thị lên ô input
const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);

  // Extra invited emails (outside class)
  const [emailInput, setEmailInput] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  // Fetch quizzes and classes when modal opens
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/quizzes").then((r) => r.ok ? r.json() : []).then(setQuizzes);
    fetch("/api/classes").then((r) => r.ok ? r.json() : []).then(setClasses);
  }, [isOpen]);

  // Pre-fill form
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) {
      setTitle(editingEvent.title ?? "");
      setDuration(String(editingEvent.durationMinutes ?? 45));
      setSelectedClassId(editingEvent.classId ?? null);
      if (editingEvent.scheduledAt) {
        const d = new Date(editingEvent.scheduledAt);
        setStartDate(d.toISOString().slice(0, 10));
        setStartTime(d.toTimeString().slice(0, 5));
      } else {
        setStartDate(""); setStartTime("");
      }
      try {
        setInvitedEmails(editingEvent.invitedEmails ? JSON.parse(editingEvent.invitedEmails) : []);
      } catch { setInvitedEmails([]); }
    } else {
      setTitle(""); setDuration("45"); setSelectedClassId(null);
      setStartDate(""); setStartTime("");
      setSelectedQuizId(initialQuizId ?? null);
      setInvitedEmails([]);
    }
    setEmailInput("");
    setErrors({});
  }, [isOpen, isEdit, editingEvent, initialQuizId]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Required";
    if (!isEdit && !selectedQuizId) errs.quiz = "Select a quiz";
    if (Number(duration) < 1) errs.duration = "Minimum 1 minute";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    if (invitedEmails.includes(email)) return;
    setInvitedEmails((prev) => [...prev, email]);
    setEmailInput("");
  };

  const removeEmail = (email: string) => {
    setInvitedEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const scheduledAt = startDate && startTime ? `${startDate}T${startTime}` : null;
      const payload = {
        title: title.trim(),
        quizId: isEdit ? editingEvent.quiz.id : selectedQuizId,
        scheduledAt,
        durationMinutes: Number(duration),
        classId: selectedClassId || null,
        invitedEmails: invitedEmails.length > 0 ? invitedEmails : [],
      };

      const url = isEdit ? `/api/sessions/${editingEvent.id}` : "/api/sessions";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrors({ form: err.message ?? "Failed to save" });
        return;
      }

      onSaved(await res.json());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center pt-20 pb-8 px-4">
      <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col animate-in zoom-in duration-300">

        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/10">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CalendarPlus className="text-primary" />
              {isEdit ? "Edit Event Schedule" : "Schedule New Event"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isEdit ? "Update the schedule and configuration" : "Set the schedule and target audience for the exam"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
          {errors.form && (
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {errors.form}
            </p>
          )}
          {/* Step 1: Select quiz (create only) */}
{!isEdit && (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex justify-between">
      <span>1. Select Quiz</span>
      {errors.quiz && <span className="text-red-500 normal-case tracking-normal">{errors.quiz}</span>}
    </label>

    {initialQuizId ? (
      /* UI khi đã có Quiz mặc định */
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-primary/20 bg-primary/5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary text-white shadow-lg shadow-primary/20">
          <BookOpen size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Selected Quiz</p>
          <p className="font-bold text-sm">{quizzes.find(q => q.id === initialQuizId)?.title ?? "Loading..."}</p>
        </div>
      </div>
    ) : (
      /* Advanced Searchable Select */
      <div className="relative">
        <div 
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all cursor-text bg-background",
            isDropdownOpen ? "border-primary ring-4 ring-primary/10" : "border-border hover:border-primary/40"
          )}
          onClick={() => setIsDropdownOpen(true)}
        >
          <Search size={18} className={isDropdownOpen ? "text-primary" : "text-muted-foreground"} />
          <input
            type="text"
            placeholder="Search for a quiz..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-muted-foreground/60"
            value={isDropdownOpen ? searchQuery : (selectedQuiz?.title || "")}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
          <ChevronDown size={18} className={cn("transition-transform duration-200", isDropdownOpen && "rotate-180")} />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Backdrop để đóng dropdown khi bấm ra ngoài */}
            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
            
            <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
              {filteredQuizzes.length > 0 ? (
                filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className={cn(
                      "px-4 py-3 flex items-center justify-between cursor-pointer transition-colors",
                      selectedQuizId === quiz.id ? "bg-primary/10" : "hover:bg-secondary"
                    )}
                    onClick={() => {
                      setSelectedQuizId(quiz.id);
                      setSearchQuery(""); // reset search
                      setIsDropdownOpen(false); // đóng menu
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                        <BookOpen size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{quiz.title}</p>
                        <p className="text-[10px] text-muted-foreground">{quiz._count.questions} questions</p>
                      </div>
                    </div>
                    {selectedQuizId === quiz.id && <Check size={16} className="text-primary" />}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground italic">No quizzes found...</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )}
  </div>
)}

          {/* Step 2: Config */}
          <div className="space-y-4">
            {!isEdit && <div className="h-px bg-border" />}
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              {isEdit ? "Update Configuration" : "2. Event Configuration"}
            </label>

            {isEdit && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
                <BookOpen className="text-primary" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase">Editing Event</p>
                  <p className="text-sm font-bold">{editingEvent.title}</p>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Event Title {errors.title && <span className="text-red-500 ml-1">{errors.title}</span>}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 3 Quiz - 15 minutes"
                className={cn(
                  "w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition",
                  errors.title ? "border-red-500" : "border-border"
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock size={12} /> Start Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-28 bg-background border border-border rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Target size={12} /> Duration (minutes)
                  {errors.duration && <span className="text-red-500 ml-1">{errors.duration}</span>}
                </label>
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Assign to Class */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Users size={12} /> Assign to Class
                <span className="text-muted-foreground/60 font-normal ml-1">(optional — leave blank for public)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* "None / Public" option */}
                <div
                  onClick={() => setSelectedClassId(null)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                    selectedClassId === null
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
                    selectedClassId === null ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                  )}>
                    —
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Public</p>
                    <p className="text-[10px] text-muted-foreground">Anyone with PIN</p>
                  </div>
                  {selectedClassId === null && <Check size={14} className="text-primary ml-auto shrink-0" />}
                </div>

                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                      selectedClassId === cls.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                      selectedClassId === cls.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                    )}>
                      <Users size={13} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{cls.name}</p>
                      <p className="text-[10px] text-muted-foreground">{cls._count.enrollments} students</p>
                    </div>
                    {selectedClassId === cls.id && <Check size={14} className="text-primary ml-auto shrink-0" />}
                  </div>
                ))}

                {classes.length === 0 && (
                  <p className="text-xs text-muted-foreground col-span-2 py-2">
                    No classes yet — create one in the Students tab.
                  </p>
                )}
              </div>
            </div>

            {/* Extra invited emails (shown when a class is selected) */}
            {selectedClassId && (
              <div className="space-y-2 p-4 bg-secondary/30 border border-border rounded-2xl">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <UserPlus size={12} /> Add Extra Students
                  <span className="text-muted-foreground/60 font-normal ml-1">(outside the class)</span>
                </label>
                <EmailSuggestInput
                  value={emailInput}
                  onChange={setEmailInput}
                  onAdd={addEmail}
                  placeholder="student@email.com"
                >
                  <button
                    type="button"
                    onClick={addEmail}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition"
                  >
                    Add
                  </button>
                </EmailSuggestInput>
                {invitedEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {invitedEmails.map((email) => (
                      <div
                        key={email}
                        className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg px-2.5 py-1 text-xs font-medium"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeEmail(email)}
                          className="hover:text-red-500 transition"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {invitedEmails.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Press Enter or click Add to invite students outside this class.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 text-sm font-semibold hover:bg-secondary rounded-2xl transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? "Update Event" : "Create Event"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
