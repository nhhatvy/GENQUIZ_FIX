'use client';
import { ShieldCheck, Key, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function AccountSettings() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const res = await fetch("/api/profile/delete", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleUpdatePassword = async () => {
    setPwError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required"); return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match"); return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters"); return;
    }
    setPwSaving(true);
    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setPwSaving(false);
    if (res.ok) {
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } else {
      const err = await res.json().catch(() => ({}));
      setPwError(err.message ?? "Failed to update password");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. Account Security Section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-lg transition-colors">
        <div className="border-b border-border pb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Key size={20} className="text-primary" /> Account Security
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Update your password and security settings</p>
        </div>

        <div className="max-w-md space-y-4">
          {pwError && (
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{pwError}</p>
          )}
          {pwSuccess && (
            <p className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <CheckCircle2 size={15} /> Password updated successfully
            </p>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                onKeyDown={(e) => e.key === "Enter" && handleUpdatePassword()}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={pwSaving}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-bold shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-60"
          >
            {pwSaving && <Loader2 size={15} className="animate-spin" />}
            Update Password
          </button>
        </div>
      </div>

      {/* 2. Danger Zone Section */}
      <div className="rounded-xl border border-destructive/30 bg-card p-6 space-y-6 shadow-lg">
        <div>
          <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
            <ShieldCheck size={20} /> Danger Zone
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Irreversible actions for your account</p>
        </div>

        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-destructive">Delete Account</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-md font-medium">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>
          </div>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-5 py-2 text-sm rounded-lg cursor-pointer bg-destructive hover:opacity-90 transition font-bold text-destructive-foreground shadow-lg shadow-destructive/20 active:scale-95 shrink-0"
            >
              Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-secondary transition font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg cursor-pointer bg-destructive hover:opacity-90 transition font-bold text-destructive-foreground shadow-lg shadow-destructive/20 active:scale-95 disabled:opacity-60"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Confirm Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground pt-4 font-medium">
        Need help with your account settings? <span className="text-primary hover:underline cursor-pointer font-bold">Contact Support</span>
      </p>
    </div>
  );
}