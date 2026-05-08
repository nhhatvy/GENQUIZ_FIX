"use client";

import {
  Database, Trash2, Eye, Loader2, Plus, FileText, Type,
  Search, BookOpen, ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/app/_components/ConfirmModal";

type QuestionBank = {
  id: string;
  name: string;
  subject: string;
  sourceType: "FILE" | "TEXT";
  sourceFile: string | null;
  createdAt: string;
  _count: { questions: number };
};

export default function StudentQuestionBankPage() {
  const router = useRouter();
  const { confirmModal, askConfirm } = useConfirm();
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/question-bank");
      if (res.ok) setBanks(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  const handleDelete = async (id: string) => {
    if (!await askConfirm("This cannot be undone.", { title: "Delete Question Bank?", confirmText: "Delete", variant: "danger" })) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/question-bank/${id}`, { method: "DELETE" });
      if (res.ok) setBanks((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = banks.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {confirmModal}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Question Bank</h2>
          <p className="text-muted-foreground mt-1 text-sm">AI-generated question pools from your learning materials</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-muted-foreground text-sm">Total Banks</p>
          <p className="text-2xl font-black">{banks.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-muted-foreground text-sm">Total Questions</p>
          <p className="text-2xl font-black">
            {banks.reduce((sum, b) => sum + b._count.questions, 0)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 space-y-1">
          <p className="text-muted-foreground text-sm">From Files</p>
          <p className="text-2xl font-black">
            {banks.filter((b) => b.sourceType === "FILE").length}
          </p>
        </div>
      </div>

      {/* Bank list */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">All Question Banks</h3>
            <p className="text-sm text-muted-foreground">Click a bank to view and edit questions</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search banks..."
              className="bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-60"
            />
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Database size={28} />
              </div>
              <div>
                <p className="font-semibold">No question banks yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate a quiz with AI to automatically create a question bank
                </p>
              </div>
              <button
                onClick={() => router.push("/student/myquizzes")}
                className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground mx-auto shadow-lg shadow-primary/20 hover:opacity-90 transition"
              >
                <Plus size={16} /> Generate AI Quiz
              </button>
            </div>
          ) : (
            filtered.map((bank) => (
              <div
                key={bank.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background p-4 hover:border-primary hover:shadow-md transition-all group cursor-pointer"
                onClick={() => router.push(`/student/question-bank/${bank.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
                    {bank.sourceType === "FILE" ? <FileText size={18} /> : <Type size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {bank.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-purple-500/10 text-purple-400">
                        {bank.sourceType === "FILE" ? "File" : "Text"}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1 font-medium">
                      <span className="flex items-center gap-1"><BookOpen size={10} /> {bank._count.questions} questions</span>
                      <span>{bank.subject}</span>
                      {bank.sourceFile && <span className="truncate max-w-[150px]">{bank.sourceFile}</span>}
                      <span>{new Date(bank.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => router.push(`/student/question-bank/${bank.id}`)}
                    className="px-4 py-1.5 text-sm border border-border rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition flex items-center gap-1"
                  >
                    <Eye size={14} /> View <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(bank.id)}
                    disabled={deletingId === bank.id}
                    className="w-8 h-8 flex items-center justify-center border border-border rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition disabled:opacity-50"
                  >
                    {deletingId === bank.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
