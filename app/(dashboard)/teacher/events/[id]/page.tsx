'use client';

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import QuizWaitingView from "../_components/Upcoming";
import QuizLiveView from "../_components/Active";
import QuizReportView from "../_components/Comleted";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvent = useCallback(async () => {
    const res = await fetch(`/api/sessions/${id}`);
    if (!res.ok) { setError("Event not found."); setLoading(false); return; }
    setEvent(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  const back = () => router.push("/teacher/events");

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={24} className="animate-spin text-muted-foreground" />
    </div>
  );

  if (error || !event) return (
    <div className="flex flex-col items-center py-20 gap-3 text-muted-foreground">
      <AlertCircle size={32} className="text-red-500" />
      <p>{error || "Event not found."}</p>
    </div>
  );

  switch (event.status) {
    case "Upcoming":
      return <QuizWaitingView event={event} onBack={back} onActivated={fetchEvent} />;
    case "Active":
      return <QuizLiveView event={event} onBack={back} onEnded={fetchEvent} />;
    case "Completed":
      return <QuizReportView event={event} onBack={back} />;
    default:
      return null;
  }
}
