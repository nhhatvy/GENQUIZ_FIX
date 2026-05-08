"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Target, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuizDetails = {
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  passingScore: number;
  visibility: "Public" | "Private";
  creationMethod?: "MANUAL" | "AI";
};

interface QuizDetailProps {
  onNext: (data: QuizDetails) => void;
  onBack: () => void;
  initialData?: QuizDetails;
  isEditing?: boolean;
}

const CATEGORIES = ["Science", "History", "Mathematics", "English", "Technology", "Geography", "Art", "Programing", "Web", "Database", "General"];

export default function QuizDetail({ onNext, onBack, initialData, isEditing = false }: QuizDetailProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "Science");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(initialData?.difficulty ?? "Medium");
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit ?? 15);
  const [passingScore, setPassingScore] = useState(initialData?.passingScore ?? 70);
  const [visibility, setVisibility] = useState<"Public" | "Private">(initialData?.visibility ?? "Private");

  const [errors, setErrors] = useState<Partial<Record<keyof QuizDetails, string>>>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (title.trim().length < 5) errs.title = "Title must be at least 5 characters";
    if (description.trim().length > 0 && description.trim().length < 10)
      errs.description = "Description must be at least 10 characters";
    if (timeLimit < 1) errs.timeLimit = "Minimum 1 minute";
    if (passingScore < 0 || passingScore > 100) errs.passingScore = "0–100%";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    onNext({ title, description, category, difficulty, timeLimit, passingScore, visibility });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="cursor-pointer p-2 rounded-xl border border-border bg-card hover:bg-secondary transition">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{isEditing ? "Edit Quiz" : "Create New Quiz"}</h2>
            <p className="text-muted-foreground text-sm">Add questions and configure quiz settings</p>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Quiz Details</h3>
              <p className="text-muted-foreground text-sm">Basic information about your quiz</p>
            </div>

            {/* TITLE */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Quiz Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Introduction to Environmental Science"
                className={cn(
                  "w-full bg-background border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition",
                  errors.title ? "border-red-500" : "border-border"
                )}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Test your knowledge about the basics..."
                className={cn(
                  "w-full bg-background border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none",
                  errors.description ? "border-red-500" : "border-border"
                )}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* CATEGORY + DIFFICULTY */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Quiz Settings</h3>
              <p className="text-muted-foreground text-sm">Configure how your quiz works</p>
            </div>

            <div className="space-y-4">
              {/* TIME */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Time Limit</label>
                <div className={cn(
                  "flex items-center gap-3 bg-background border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition",
                  errors.timeLimit ? "border-red-500" : "border-border"
                )}>
                  <Clock size={16} className="text-muted-foreground shrink-0" />
                  <input
                    type="number"
                    min={1}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="bg-transparent outline-none text-sm font-medium w-full"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">minutes</span>
                </div>
                {errors.timeLimit && <p className="text-xs text-red-500">{errors.timeLimit}</p>}
              </div>

              {/* PASSING SCORE */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Passing Score</label>
                <div className={cn(
                  "flex items-center gap-3 bg-background border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition",
                  errors.passingScore ? "border-red-500" : "border-border"
                )}>
                  <Target size={16} className="text-muted-foreground shrink-0" />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="bg-transparent outline-none text-sm font-medium w-full"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">%</span>
                </div>
              </div>

              {/* VISIBILITY */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibility("Private")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition",
                      visibility === "Private"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Lock size={14} />
                    Private
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("Public")}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition",
                      visibility === "Public"
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : "border-border text-muted-foreground hover:border-green-500/40"
                    )}
                  >
                    <Globe size={14} />
                    Public
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {visibility === "Public"
                    ? "Visible to everyone in the Library"
                    : "Only visible to you"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end pt-4 gap-4">
        <button
          onClick={onBack}
          className="cursor-pointer flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl border border-border bg-card hover:bg-secondary transition"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          onClick={handleNext}
          className="cursor-pointer flex items-center gap-2 px-8 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
