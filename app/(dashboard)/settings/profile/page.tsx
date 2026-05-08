'use client';

import { Camera, Save, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface Profile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
}

export default function ProfileSettings() {
  const { update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data: Profile | null) => {
        if (data) {
          setProfile(data);
          setFirstName(data.firstName ?? "");
          setLastName(data.lastName ?? "");
          setBio(data.bio ?? "");
          setAvatarUrl(data.avatarUrl ?? "");
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!firstName.trim()) { setError("First name is required"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, bio, avatarUrl }),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      await update(); // refresh JWT session name
      window.dispatchEvent(new CustomEvent("profile-updated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Failed to save");
    }
  };

  const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || profile?.email?.[0]?.toUpperCase() || "U";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-xl border border-border bg-card p-6 space-y-8 shadow-lg">

        {/* Header */}
        <div className="border-b border-border pb-6">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <p className="text-muted-foreground text-sm mt-1">Update your profile information and public details</p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4 shrink-0">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 rounded-full bg-secondary border-4 border-border flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-all">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={() => setAvatarUrl("")} />
                ) : (
                  <span className="text-4xl font-bold text-primary">{initials}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-secondary transition"
            >
              Change Photo
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB"); return; }
                const reader = new FileReader();
                reader.onload = () => setAvatarUrl(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </div>

          {/* Form */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed font-medium"
                />
                <p className="text-[11px] text-muted-foreground">Email cannot be changed here.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition font-bold shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saved ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Need help with your account? <span className="text-primary hover:underline cursor-pointer font-bold">Contact Support</span>
      </p>
    </div>
  );
}
