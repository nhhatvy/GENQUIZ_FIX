'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import QuizEngine from "../../components/Engine";
import QuizEntryView from "../../components/Entry";
import QuizResultView from "../../components/Result";
import QuizWaitingView from "../../components/Waiting";

type SessionData = {
  id: string;
  title: string;
  pin: string;
  status: "Upcoming" | "Active" | "Completed";
  scheduledAt: string | null;
  durationMinutes: number;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    questions: {
      id: string;
      text: string;
      type: string;
      points: number;
      options: { id: string; text: string }[];
    }[];
  };
};

type Result = { submissionId: string; totalScore: number; maxScore: number; passed: boolean };

export default function QuizSessionPage() {
  const { id } = useParams<{ id: string }>();
  const { data: authSession } = useSession();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const [step, setStep] = useState<"waiting" | "entry" | "examining" | "result">("waiting");
  const [studentName, setStudentName] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/public/session/${id}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorCode(body.code ?? null);
      setError(body.message ?? "Session does not exist or has been removed.");
      setLoading(false);
      return;
    }
    const data: SessionData = await res.json();
    setSession(data);
    setLoading(false);

    if (data.status === "Active" && step === "waiting") setStep("entry");
    if (data.status === "Completed" && step === "waiting") setStep("waiting");
  }, [id, step]);

  useEffect(() => { fetchSession(); }, []);

  // Poll every 5s khi session chưa active
  useEffect(() => {
    if (!session || session.status !== "Upcoming") return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/public/session/${id}`);
      if (!res.ok) return;
      const data: SessionData = await res.json();
      setSession(data);
      if (data.status === "Active") { setStep("entry"); clearInterval(interval); }
    }, 5000);
    return () => clearInterval(interval);
  }, [session?.status, id]);

  const handleStart = (name: string) => {
    setStudentName(name);
    setStep("examining");
  };

  const handleSubmit = async (answers: { questionId: string; selectedOptionId: string }[], timeTakenSeconds: number) => {
    const res = await fetch(`/api/public/session/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: studentName, answers, timeTakenSeconds }),
    });
    if (res.ok) {
      const data = await res.json();
      setResult(data);
    }
    setStep("result");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    const isAccessError = errorCode === "LOGIN_REQUIRED" || errorCode === "NOT_ENROLLED";
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          {isAccessError
            ? <Lock size={48} className="text-indigo-400 mx-auto" />
            : <AlertCircle size={48} className="text-red-500 mx-auto" />
          }
          <h2 className="text-xl font-bold">
            {errorCode === "LOGIN_REQUIRED" && "Login Required"}
            {errorCode === "NOT_ENROLLED" && "Access Restricted"}
            {!isAccessError && "Exam Unavailable"}
          </h2>
          <p className="text-gray-400 text-sm">{error}</p>
          {errorCode === "LOGIN_REQUIRED" && (
            <a
              href="/login"
              className="inline-block mt-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition"
            >
              Log In
            </a>
          )}
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-primary/30">

      {/* Upcoming — chờ teacher mở */}
      {step === "waiting" && session.status === "Upcoming" && (
        <QuizWaitingView quiz={{ title: session.title }} scheduledAt={session.scheduledAt} />
      )}

      {/* Completed — đã đóng */}
      {step === "waiting" && session.status === "Completed" && (
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="text-center space-y-4">
            <AlertCircle size={48} className="text-orange-500 mx-auto" />
            <h2 className="text-2xl font-bold">Exam has ended</h2>
            <p className="text-gray-400">This session is closed. Please contact your teacher.</p>
          </div>
        </div>
      )}

      {/* Entry — nhập tên */}
      {step === "entry" && (
        <QuizEntryView
          quiz={{ title: session.title }}
          onStart={handleStart}
          loggedInName={authSession?.user?.name ?? null}
          loggedInEmail={authSession?.user?.email ?? null}
        />
      )}

      {/* Engine — làm bài */}
      {step === "examining" && (
        <QuizEngine
          quiz={session.quiz}
          durationSeconds={session.durationMinutes * 60}
          onSubmit={handleSubmit}
        />
      )}

      {/* Result */}
      {step === "result" && (
        <QuizResultView
          name={studentName}
          totalScore={result?.totalScore ?? 0}
          maxScore={result?.maxScore ?? 0}
          passed={result?.passed ?? false}
          isLoggedIn={!!authSession?.user}
          submissionId={result?.submissionId ?? null}
        />
      )}
    </div>
  );
}
