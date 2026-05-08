'use client';

import { useState, useRef } from "react";
import { Mail } from "lucide-react";

interface Suggestion { id: string; name: string | null; email: string }

interface EmailSuggestInputProps {
  value: string;
  onChange: (val: string) => void;
  onAdd: () => void;
  placeholder?: string;
  role?: "STUDENT" | "TEACHER";
  children?: React.ReactNode; // Add button slot
}

export default function EmailSuggestInput({
  value, onChange, onAdd, placeholder = "email@example.com", role = "STUDENT", children,
}: EmailSuggestInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(val.trim())}&role=${role}`);
      if (res.ok) {
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      }
    }, 200);
  };

  const pick = (email: string) => {
    onChange(email);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="flex gap-2 relative">
      <div className="relative flex-1">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
        <input
          type="email"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => pick(s.email)}
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
      {children}
    </div>
  );
}
