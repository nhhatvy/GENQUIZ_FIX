"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import QuizAnalytics from "../components/QuizAnalytics";

export default function QuizViewPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setQuiz(data); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20 text-muted-foreground">Quiz not found.</div>
    );
  }

  return <QuizAnalytics quiz={quiz} onBack={() => router.push("/teacher/quizzes")} />;
}
