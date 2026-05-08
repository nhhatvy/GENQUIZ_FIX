'use client';

import {
  MoreVertical, Search, UserPlus, Mail, Ban,
  Funnel, ChevronDown, Loader2, X, Eye, EyeOff,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: "STUDENT" | "TEACHER";
  banned: boolean;
  avatarUrl: string | null;
  createdAt: string;
  _count: { quizzes: number };
}

const TABS = [
  { label: "All Accounts", role: "" },
  { label: "Students", role: "STUDENT" },
  { label: "Teachers", role: "TEACHER" },
];

const STATUS_OPTS = ["All", "Active", "Banned"];


export default function ManageAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusOpen, setStatusOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Add Admin modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

// debounce
useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearch(search.trim());
  }, 300);

  return () => clearTimeout(handler);
}, [search]);
// reset page ngay khi user gõ
useEffect(() => {
  setPage(1);
}, [debouncedSearch, activeTab, statusFilter]);
const fetchAccounts = useCallback(async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (TABS[activeTab].role) params.set("role", TABS[activeTab].role);
    if (statusFilter !== "All") params.set("status", statusFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);

    const res = await fetch(`/api/admin/accounts?${params}`);
    if (!res.ok) throw new Error("Failed to fetch");
    
    const data = await res.json();
    setAccounts(data.accounts);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Fetch error:", error);
    showToast("Could not load accounts", "error");
  } finally {
    setLoading(false);
  }
}, [activeTab, debouncedSearch, statusFilter, page]);
useEffect(() => {
  fetchAccounts();
}, [fetchAccounts]);



  const handleBanToggle = async (user: Account) => {
    setActionLoading(user.id);
    setActiveMenu(null);
    const action = user.banned ? "unban" : "ban";
    const res = await fetch("/api/admin/accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, action }),
    });
    setActionLoading(null);
    if (res.ok) {
      showToast(`Account ${action === "ban" ? "banned" : "unbanned"} successfully`);
      fetchAccounts();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.message ?? "Action failed", "error");
    }
  };

  const handleCreateAdmin = async () => {
    setFormError("");
    if (!form.firstName || !form.email || !form.password) {
      setFormError("First name, email and password are required"); return;
    }
    setFormLoading(true);
    const res = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setFormLoading(false);
    if (res.ok) {
      setShowModal(false);
      setForm({ firstName: "", lastName: "", email: "", password: "" });
      showToast("Admin account created successfully");
    } else {
      const err = await res.json().catch(() => ({}));
      setFormError(err.message ?? "Failed to create admin");
    }
  };

  const displayName = (u: Account) =>
    u.name ?? ([u.firstName, u.lastName].filter(Boolean).join(" ") || u.email);

  const avatarFallback = (u: Account) =>
    displayName(u).charAt(0).toUpperCase();

  console.log("FETCH:", {
  search,
  debouncedSearch,
  page
});

  return (
    <div className="space-y-6 relative">

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Create Admin Account</h3>
              <button onClick={() => { setShowModal(false); setFormError(""); }} className="p-1.5 rounded-lg hover:bg-secondary transition text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{formError}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">First Name <span className="text-red-500">*</span></label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder="John"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@example.com"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateAdmin()}
                  placeholder="Min. 6 characters"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => { setShowModal(false); setFormError(""); }} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-secondary transition cursor-pointer font-medium">
                Cancel
              </button>
              <button onClick={handleCreateAdmin} disabled={formLoading} className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-bold disabled:opacity-60 cursor-pointer">
                {formLoading && <Loader2 size={14} className="animate-spin" />}
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Overlay đóng menu */}
      {(activeMenu !== null || statusOpen) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setActiveMenu(null); setStatusOpen(false); }} />
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in fade-in slide-in-from-bottom-4",
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        )}>
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Account Management</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage user accounts and handle violations</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-medium shadow-lg shadow-primary/20 cursor-pointer">
          <UserPlus size={18} />
          Add Admin
        </button>
      </div>

      {/* Main Content Card */}
      <div className="rounded-xl border border-border bg-card shadow-2xl transition-colors duration-300">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">User Directory</h2>
            <p className="text-muted-foreground text-sm">View and manage all registered users</p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex p-1 bg-secondary/50 rounded-lg border border-border w-fit">
              {TABS.map((tab, idx) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(idx)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm transition-all duration-200 font-medium ",
                    activeTab === idx
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
  <Search 
    size={16} 
    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
  />
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search by name or email..."
    className="bg-background border border-border rounded-lg pl-10 pr-10 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
  />
  {search && (
    <button
      onClick={() => setSearch("")}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      <X size={14} />
    </button>
  )}
</div>
              <div className="relative">
                <button
                  onClick={() => setStatusOpen((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary transition cursor-pointer font-medium"
                >
                  <Funnel size={16} />
                  {statusFilter === "All" ? "Status" : statusFilter}
                  <ChevronDown size={14} className={cn("transition-transform", statusOpen && "rotate-180")} />
                </button>
                {statusOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {STATUS_OPTS.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setStatusOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm transition-colors font-medium",
                          statusFilter === s ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                  <th className="px-4 py-4 font-semibold">User Info</th>
                  <th className="px-4 py-4 font-semibold">Role</th>
                  <th className="px-4 py-4 font-semibold text-center">Quizzes</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Joined</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Loader2 size={24} className="animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                      No accounts found
                    </td>
                  </tr>
                ) : accounts.map((user) => (
                  <tr key={user.id} className="group hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-primary/10 flex items-center justify-center shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={displayName(user)} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-primary">{avatarFallback(user)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground leading-none">{displayName(user)}</span>
                          <span className="text-[11px] text-muted-foreground mt-1">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-2 py-1 rounded",
                        user.role === "TEACHER" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                      )}>
                        {user.role === "TEACHER" ? "Teacher" : "Student"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-foreground/70">
                      {user._count.quizzes}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {actionLoading === user.id ? (
                          <Loader2 size={12} className="animate-spin text-muted-foreground" />
                        ) : (
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            !user.banned ? "bg-green-500" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                          )} />
                        )}
                        <span className="text-sm font-medium text-foreground/80">
                          {user.banned ? "Banned" : "Active"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        className={cn(
                          "p-1.5 rounded-md transition-all cursor-pointer",
                          activeMenu === user.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenu === user.id && (
                        <div className="absolute right-4 top-12 w-48 rounded-xl border border-border bg-popover shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100">
                          <button className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors cursor-pointer font-medium">
                            <Mail size={14} />
                            Send Warning
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => handleBanToggle(user)}
                            className="w-full flex items-center justify-start gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer font-medium"
                          >
                            <Ban size={14} />
                            {user.banned ? "Unban Account" : "Ban Account"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
