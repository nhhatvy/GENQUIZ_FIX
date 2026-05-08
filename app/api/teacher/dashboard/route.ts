import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const teacherId = session.user.id;

  // Run all queries in parallel
  const [
    totalQuizzes,
    sessions,
    recentQuizzes,
    submissions,
    enrollmentCount,
  ] = await Promise.all([
    // Total quizzes created
    prisma.quiz.count({ where: { creatorId: teacherId } }),

    // All sessions (for active count + recent events)
    prisma.session.findMany({
      where: { quiz: { creatorId: teacherId } },
      include: {
        quiz: { select: { id: true, title: true } },
        class: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),

    // Recent quizzes with submission count
    prisma.quiz.findMany({
      where: { creatorId: teacherId },
      include: {
        _count: { select: { questions: true, sessions: true } },
        sessions: {
          include: { _count: { select: { submissions: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),

    // All submissions for this teacher's sessions (for top students + avg completion)
    prisma.submission.findMany({
      where: { session: { quiz: { creatorId: teacherId } } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        session: {
          include: { quiz: { select: { passingScore: true } } },
        },
      },
    }),

    // Total enrolled students across all classes
    prisma.enrollment.count({
      where: { class: { teacherId } },
    }),
  ]);

  // Stats
  const activeEvents = sessions.filter((s) => s.status === "Active").length;

  const totalSubmissions = submissions.length;
  const passedSubmissions = submissions.filter((s) => {
    const pct = s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0;
    return pct >= s.session.quiz.passingScore;
  }).length;
  const avgCompletion = totalSubmissions > 0
    ? Math.round((passedSubmissions / totalSubmissions) * 100)
    : 0;

  // Recent events (last 5)
  const recentEvents = sessions.slice(0, 5).map((s) => ({
    id: s.id,
    title: s.title,
    status: s.status,
    scheduledAt: s.scheduledAt,
    durationMinutes: s.durationMinutes,
    submissionCount: s._count.submissions,
    quizTitle: s.quiz.title,
    className: s.class?.name ?? null,
  }));

  // Top students: group by userId, sum totalScore
  const studentMap = new Map<string, { name: string; email: string; totalScore: number; attempts: number }>();
  for (const sub of submissions) {
    if (!sub.userId) continue;
    const key = sub.userId;
    const existing = studentMap.get(key);
    if (existing) {
      existing.totalScore += sub.totalScore;
      existing.attempts += 1;
    } else {
      studentMap.set(key, {
        name: sub.user?.name ?? sub.nickname,
        email: sub.user?.email ?? "",
        totalScore: sub.totalScore,
        attempts: 1,
      });
    }
  }
  const topStudents = [...studentMap.entries()]
    .map(([, v]) => v)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  // Recent quizzes with total submissions
  const recentQuizzesFormatted = recentQuizzes.map((q) => {
    const totalSubs = q.sessions.reduce((sum, s) => sum + s._count.submissions, 0);
    return {
      id: q.id,
      title: q.title,
      questionCount: q._count.questions,
      sessionCount: q._count.sessions,
      submissionCount: totalSubs,
    };
  });

  return NextResponse.json({
    stats: {
      totalQuizzes,
      activeEvents,
      totalStudents: enrollmentCount,
      avgCompletion,
    },
    recentEvents,
    topStudents,
    recentQuizzes: recentQuizzesFormatted,
  });
}
