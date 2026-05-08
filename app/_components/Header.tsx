"use client";

import { ChevronDown, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import { UserRole } from "@/app/constants/sidebar-routes";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  role: UserRole;
}

export default function Header({ role }: HeaderProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const fetchProfile = () => {
    fetch("/api/profile").then(r => r.ok ? r.json() : null).then(d => {
      if (!d) return;
      setAvatarUrl(d.avatarUrl ?? null);
      setDisplayName(d.name ?? null);
    });
  };

  useEffect(() => {
    if (session?.user?.id) fetchProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    window.addEventListener("profile-updated", fetchProfile);
    return () => window.removeEventListener("profile-updated", fetchProfile);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border transition-colors duration-300 sticky top-0 z-50">

      <div className="flex items-center gap-4">
        <Logo />
      </div>

      <div className="flex items-center gap-3 md:gap-5">


        {/* Profile dropdown */}
        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 p-1 pr-2 rounded-xl hover:bg-secondary transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/10 group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" onError={() => setAvatarUrl(null)} />
              ) : (
                (displayName ?? session?.user?.name)?.charAt(0)?.toUpperCase() ?? role.charAt(0)
              )}
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-sm font-bold text-foreground">
                {displayName ?? session?.user?.name ?? "User"}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                {role.toLowerCase()}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-muted-foreground hidden md:block transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Account info */}
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs font-semibold truncate">{displayName ?? session?.user?.name ?? "User"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{session?.user?.email}</p>
              </div>

              <Link
                href="/settings/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Settings size={15} /> Settings
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
