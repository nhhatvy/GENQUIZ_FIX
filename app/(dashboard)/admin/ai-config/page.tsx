'use client';

import { useEffect, useState } from "react";
import { Sparkles, Key, Loader2, CheckCircle2, RefreshCw, AlertCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { id: "gemini", label: "Google Gemini", desc: "Gemini Flash, Pro, Ultra..." },
  { id: "openai", label: "OpenAI", desc: "GPT-4o, GPT-4 Turbo, GPT-3.5..." },
];

export default function AIConfigPage() {
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [editingKey, setEditingKey] = useState(false);
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [savedModel, setSavedModel] = useState("");
  const [savedProvider, setSavedProvider] = useState("gemini");

  useEffect(() => {
    fetch("/api/admin/ai-config")
      .then(r => r.json())
      .then(d => {
        const p = d.provider ?? "gemini";
        const m = d.model ?? "";
        setProvider(p); setSavedProvider(p);
        setModel(m); setSavedModel(m);
        if (d.hasKey) setHasExistingKey(true);
      })
      .finally(() => setInitialLoading(false));
  }, []);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    setModel("");
    setModels([]);
    setModelError("");
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    setModelError("");
    try {
      // If key is saved and user hasn't entered a new one, use backend proxy
      if (hasExistingKey && !editingKey) {
        const res = await fetch(`/api/admin/ai-config/models?provider=${provider}`);
        if (!res.ok) {
          const d = await res.json();
          setModelError(d.error ?? "Request failed.");
          return;
        }
        const data = await res.json();
        setModels(data.models ?? []);
        if (!model || !(data.models ?? []).includes(model)) setModel(data.models?.[0] ?? "");
        return;
      }

      // New key entered by user — call external API directly
      const key = apiKey.trim();
      if (!key) { setModelError("Enter your API key first."); return; }

      if (provider === "gemini") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!res.ok) { setModelError("Invalid API key or request failed."); return; }
        const data = await res.json();
        const names: string[] = (data.models ?? [])
          .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => (m.name as string).replace("models/", ""));
        setModels(names);
        if (!model || !names.includes(model)) setModel(names[0] ?? "");
      } else {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok) { setModelError("Invalid API key or request failed."); return; }
        const data = await res.json();
        const names: string[] = (data.data ?? [])
          .map((m: any) => m.id as string)
          .filter((id: string) => id.startsWith("gpt-"))
          .sort();
        setModels(names);
        if (!model || !names.includes(model)) setModel(names[0] ?? "");
      }
    } catch {
      setModelError("Network error fetching models.");
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = async () => {
    if (!model) { setError("Please select a model."); return; }
    setError("");
    setSaving(true);
    try {
      const body: Record<string, string> = { provider, model };
      if (apiKey.trim()) body.apiKey = apiKey.trim();
      const res = await fetch("/api/admin/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaved(true);
        setSavedModel(model);
        setSavedProvider(provider);
        setTimeout(() => setSaved(false), 3000);
        if (editingKey) { setHasExistingKey(true); setEditingKey(false); setApiKey(""); }
      } else {
        setError("Failed to save.");
      }
    } catch { setError("Network error."); }
    finally { setSaving(false); }
  };

  if (initialLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={28} className="animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles size={22} className="text-primary" /> AI Configuration
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure the LLM provider and model used to generate quizzes.
        </p>
      </div>

      {/* PROVIDER */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">LLM Provider</label>
        <div className="grid grid-cols-2 gap-3">
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className={cn(
                "flex flex-col gap-1 p-4 rounded-xl border-2 text-left transition-all",
                provider === p.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <span className={cn("text-sm font-bold", provider === p.id ? "text-primary" : "text-foreground")}>
                {p.label}
              </span>
              <span className="text-xs text-muted-foreground">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* API KEY */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Key size={13} /> API Key
        </label>

        {hasExistingKey && !editingKey ? (
          <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 size={16} />
              <span className="text-sm font-semibold">API key configured</span>
            </div>
            <button
              onClick={() => { setEditingKey(true); setApiKey(""); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
            >
              <Pencil size={12} /> Change key
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={`Paste your ${provider === "gemini" ? "Gemini" : "OpenAI"} API key`}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
              autoFocus
            />
            {editingKey && (
              <button
                onClick={() => { setEditingKey(false); setApiKey(""); }}
                className="px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Model</label>
          <button
            onClick={fetchModels}
            disabled={loadingModels}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition disabled:opacity-50"
          >
            {loadingModels ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Load models from API
          </button>
        </div>

        {modelError && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <AlertCircle size={13} /> {modelError}
          </p>
        )}

        {models.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
            {models.map(m => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={cn(
                  "text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                  model === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/40 text-foreground"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-secondary/50 border border-dashed border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
            {hasExistingKey && !editingKey
              ? "Click \"Load models from API\" to fetch available models"
              : "Enter your API key and click \"Load models from API\""}
          </div>
        )}

        {model && (
          <p className="text-xs text-muted-foreground">
            Selected: <span className="font-semibold text-foreground">{model}</span>
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} /> {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !model || (!editingKey && model === savedModel && provider === savedProvider)}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
        {saved ? "Saved!" : saving ? "Saving..." : "Save Configuration"}
      </button>
    </div>
  );
}
