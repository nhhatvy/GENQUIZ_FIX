import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const userId = session.user.id;

  // Fetch recent submissions with session/quiz info
  const submissions = await prisma.submission.findMany({
    where: { userId },
    include: {
      session: {
        include: {
          quiz: { select: { id: true, title: true, category: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Stats
  const totalCompleted = submissions.length;
  const avgScore =
    totalCompleted > 0
      ? Math.round(
          submissions.reduce((sum, s) => sum + (s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0), 0) /
            totalCompleted
        )
      : 0;

  // Upcoming sessions from enrolled classes
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      class: {
        include: {
          sessions: {
            where: { status: { in: ["Upcoming", "Active"] } },
            include: {
              quiz: { select: { id: true, title: true } },
            },
            orderBy: { scheduledAt: "asc" },
            take: 5,
          },
        },
      },
    },
  });

  const upcomingSessions = enrollments
    .flatMap((e) =>
      e.class.sessions.map((s) => ({
        ...s,
        className: e.class.name,
      }))
    )
    .sort((a, b) => {
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    })
    .slice(0, 5);

  // Classes the student is enrolled in
  const classes = enrollments.map((e) => ({
    id: e.class.id,
    name: e.class.name,
    description: e.class.description,
    joinedAt: e.joinedAt,
  }));

  // Study groups created by this student
  const studyGroupCount = await prisma.session.count({
    where: { studentCreatorId: userId },
  });

  return NextResponse.json({
    stats: {
      totalCompleted,
      avgScore,
      classCount: classes.length,
      studyGroupCount,
    },
    recentSubmissions: submissions.map((s) => ({
      id: s.id,
      nickname: s.nickname,
      totalScore: s.totalScore,
      maxScore: s.maxScore,
      pct: s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0,
      timeTakenSeconds: s.timeTakenSeconds,
      createdAt: s.createdAt,
      sessionTitle: s.session.title,
      quizTitle: s.session.quiz.title,
      quizCategory: s.session.quiz.category,
    })),
    upcomingSessions,
    classes,
  });
}
