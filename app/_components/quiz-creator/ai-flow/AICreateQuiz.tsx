'use client';

import {
  Sparkles, Zap, BrainCircuit, Upload, FileText,
  ChevronDown, ArrowLeft, X, Loader2, AlertCircle
} from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { QuizDetails } from "../manual-flow/QuizDetail";

const CATEGORIES = ["Science", "History", "Mathematics", "English", "Technology", "Geography", "Art", "Programing", "Web", "Database", "General"];

type GeneratedQuestion = {
  text: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  options: { text: string; isCorrect: boolean }[];
};

interface AICreateQuizProps {
  onBack: () => void;
  onGenerated: (details: QuizDetails, questions: GeneratedQuestion[], bankId: string) => void;
}

export default function AICreateQuiz({ onBack, onGenerated }: AICreateQuizProps) {
  // Basic info
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Science");

  // Upload tab
  const [inputTab, setInputTab] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI config
  const [questionCount, setQuestionCount] = useState("20"); // generate to bank
  const [quizCount, setQuizCount] = useState("10");          // use in quiz
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [useMultipleChoice, setUseMultipleChoice] = useState(true);
  const [useTrueFalse, setUseTrueFalse] = useState(false);
  const [useLangVie, setUseLangVie] = useState(true);
  const [useLangEng, setUseLangEng] = useState(false);
  const [selectedBloom, setSelectedBloom] = useState(['Remember', 'Understand']);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleBloom = (name: string) =>
    setSelectedBloom((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleGenerate = async () => {
    setError(null);

    if (!title.trim() || title.trim().length < 5) {
      setError("Quiz title must be at least 5 characters.");
      return;
    }
    if (inputTab === "file" && !file) {
      setError("Please upload a file.");
      return;
    }
    if (inputTab === "text" && !pasteText.trim()) {
      setError("Please paste some text content.");
      return;
    }
    if (!useMultipleChoice && !useTrueFalse) {
      setError("Select at least one question type.");
      return;
    }
    if (!useLangVie && !useLangEng) {
      setError("Select at least one language.");
      return;
    }

    const questionTypes: string[] = [];
    if (useMultipleChoice) questionTypes.push("MULTIPLE_CHOICE");
    if (useTrueFalse) questionTypes.push("TRUE_FALSE");

    const languages: string[] = [];
    if (useLangVie) languages.push("Vietnamese");
    if (useLangEng) languages.push("English");

    const formData = new FormData();
    formData.append("inputType", inputTab);
    formData.append("bankName", title.trim());
    formData.append("subject", category);
    formData.append("questionCount", String(questionCount));
    formData.append("difficulty", difficulty);
    formData.append("bloomLevels", JSON.stringify(selectedBloom));
    formData.append("questionTypes", JSON.stringify(questionTypes));
    formData.append("languages", JSON.stringify(languages));

    if (inputTab === "file" && file) {
      formData.append("file", file);
    } else {
      formData.append("text", pasteText);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setError("Quiz generation failed. Please contact your Admin to check the AI API key configuration.");
        return;
      }

      const data = await res.json();

      // Random pick quizCount câu từ toàn bộ bank để tạo quiz
      const allQuestions = data.questions as any[];
      const quizSize = Math.min(parseInt(quizCount) || 10, allQuestions.length);
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      const pickedQuestions = shuffled.slice(0, quizSize);

      const quizDetails: QuizDetails = {
        title: title.trim(),
        description: "",
        category,
        difficulty,
        timeLimit: 15,
        passingScore: 70,
        visibility: "Private",
        creationMethod: "AI",
      };

      onGenerated(quizDetails, pickedQuestions, data.bank.id);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="text-center space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition mx-auto">
          <ArrowLeft size={14} /> Back to My Quizzes
        </button>
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sparkles className="text-primary" size={28} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            AI-Powered Quiz Generator
          </h1>
        </div>
        <p className="text-muted-foreground">
          Upload any learning material and watch our AI create personalized quizzes in seconds
        </p>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Smart Analysis", desc: "AI reads and understands your materials using advanced NLP technology", icon: BrainCircuit, color: "border-purple-500/30 text-purple-400" },
          { title: "Auto-Generate", desc: "Instantly creates tailored questions based on your learning objectives", icon: Zap, color: "border-green-500/30 text-green-400" },
          { title: "Lightning Fast", desc: "Generate complete quizzes in under 30 seconds with AI power", icon: Zap, color: "border-orange-500/30 text-orange-400" },
        ].map((feature, i) => (
          <div key={i} className={cn("bg-card border p-6 rounded-2xl space-y-3", feature.color)}>
            <feature.icon size={24} />
            <h3 className="font-bold text-white">{feature.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* FORM */}
      <div className="bg-card border border-border rounded-3xl p-8 space-y-10 shadow-sm">

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-bold border-l-4 border-primary pl-3">Basic Information</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quiz Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Biology Chapter 1 - Cells"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
            <div className="space-y-2 text-white">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Subject *</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Materials */}
        <div className="space-y-4">
          <h3 className="font-bold border-l-4 border-primary pl-3 flex items-center gap-2">
            <Upload size={18} /> Upload Learning Materials
          </h3>

          {/* Tab switch */}
          <div className="flex gap-2 p-1 bg-background border border-border rounded-xl w-fit">
            <button
              onClick={() => setInputTab("file")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition",
                inputTab === "file" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Upload size={14} /> Upload File
            </button>
            <button
              onClick={() => setInputTab("text")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition",
                inputTab === "text" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <FileText size={14} /> Paste Text
            </button>
          </div>

          {inputTab === "file" ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-3xl p-12 flex flex-col items-center gap-4 text-center group hover:border-primary/40 transition cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file ? (
                <>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <FileText size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition"
                  >
                    <X size={12} /> Remove file
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition">
                    <Upload size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg">Drop your files here or click to browse</h4>
                    <p className="text-xs text-muted-foreground">Supports PDF, DOC, DOCX, TXT, MD, RTF</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Maximum file size: 50MB</p>
                </>
              )}
            </div>
          ) : (
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={10}
              placeholder="Paste your learning content here... (lecture notes, textbook excerpts, study materials)"
              className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none transition"
            />
          )}
        </div>

        {/* AI Configuration */}
        <div className="space-y-6">
          <h3 className="font-bold border-l-4 border-primary pl-3 flex items-center gap-2">
            <Zap size={18} /> AI Quiz Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Generate to Bank</label>
                <p className="text-[10px] text-muted-foreground">Total questions AI will generate and save to Question Bank.</p>
                <input
                  type="number"
                  value={questionCount}
                  min={1} max={100}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  onBlur={(e) => {
                    const n = parseInt(e.target.value);
                    setQuestionCount(String(isNaN(n) ? 20 : Math.max(1, Math.min(100, n))));
                  }}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Use in Quiz</label>
                <p className="text-[10px] text-muted-foreground">Questions randomly picked from the bank for this quiz.</p>
                <input
                  type="number"
                  value={quizCount}
                  min={1} max={parseInt(questionCount) || 20}
                  onChange={(e) => setQuizCount(e.target.value)}
                  onBlur={(e) => {
                    const max = parseInt(questionCount) || 20;
                    const n = parseInt(e.target.value);
                    setQuizCount(String(isNaN(n) ? 10 : Math.max(1, Math.min(max, n))));
                  }}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Quiz Difficulty</label>
                <p className="text-[10px] text-muted-foreground">Overall level of the quiz. Each question's individual difficulty is auto-assigned by AI.</p>
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Question Types</label>
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={useMultipleChoice} onChange={(e) => setUseMultipleChoice(e.target.checked)} className="w-4 h-4 rounded border-border" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition">Multiple Choice</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={useTrueFalse} onChange={(e) => setUseTrueFalse(e.target.checked)} className="w-4 h-4 rounded border-border" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition">True / False</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Language</label>
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={useLangVie} onChange={(e) => setUseLangVie(e.target.checked)} className="w-4 h-4 rounded border-border" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition">Vietnamese</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={useLangEng} onChange={(e) => setUseLangEng(e.target.checked)} className="w-4 h-4 rounded border-border" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition">English</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bloom's Taxonomy */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold italic">i</div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Question Focus (Bloom's Taxonomy)</label>
            </div>
            <p className="text-[11px] text-muted-foreground -mt-2">
              Select what cognitive skill the questions should test. Works with both Multiple Choice and True/False.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Remember', desc: 'Recall definitions & facts', example: 'e.g. "What is X?"' },
                { name: 'Understand', desc: 'Explain concepts & ideas', example: 'e.g. "What happens when...?"' },
                { name: 'Apply', desc: 'Use knowledge in context', example: 'e.g. "In this case, which...?"' },
                { name: 'Analyze', desc: 'Compare & break down info', example: 'e.g. "What is the difference...?"' },
              ].map((level) => (
                <button
                  key={level.name}
                  type="button"
                  onClick={() => toggleBloom(level.name)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all group space-y-1",
                    selectedBloom.includes(level.name)
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className={cn("text-sm font-black", selectedBloom.includes(level.name) ? "text-primary" : "text-white group-hover:text-primary")}>{level.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{level.desc}</p>
                  <p className="text-[9px] text-muted-foreground/60 italic">{level.example}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* GENERATE BUTTON */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-12 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={24} className="animate-spin" /> Generating...</>
          ) : (
            <><Sparkles size={24} /> GENERATE AI QUIZ</>
          )}
        </button>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
          {loading ? "AI is analyzing your content..." : "Estimated time: 15-30 seconds"}
        </p>
      </div>
    </div>
  );
}
