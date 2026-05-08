import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const submissions = await prisma.submission.findMany({
    where: { userId: session.user.id },
    include: {
      session: {
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              category: true,
              difficulty: true,
              passingScore: true,
              _count: { select: { questions: true } },
            },
          },
          class: { select: { id: true, name: true } },
        },
      },
      answers: {
        select: { isCorrect: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = submissions.map((s) => {
    const pct = s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0;
    const passed = pct >= s.session.quiz.passingScore;
    const correctCount = s.answers.filter((a) => a.isCorrect).length;

    return {
      id: s.id,
      nickname: s.nickname,
      totalScore: s.totalScore,
      maxScore: s.maxScore,
      pct,
      passed,
      timeTakenSeconds: s.timeTakenSeconds,
      createdAt: s.createdAt,
      correctCount,
      totalQuestions: s.answers.length,
      session: {
        id: s.session.id,
        title: s.session.title,
        status: s.session.status,
        className: s.session.class?.name ?? null,
      },
      quiz: {
        id: s.session.quiz.id,
        title: s.session.quiz.title,
        category: s.session.quiz.category,
        difficulty: s.session.quiz.difficulty,
        passingScore: s.session.quiz.passingScore,
        questionCount: s.session.quiz._count.questions,
      },
    };
  });

  // Stats
  const total = result.length;
  const passed = result.filter((r) => r.passed).length;
  const avgScore = total > 0
    ? Math.round(result.reduce((sum, r) => sum + r.pct, 0) / total)
    : 0;

  const uniqueQuizzes = new Set(result.map((r) => r.quiz.id)).size;

  return NextResponse.json({
    stats: { total, passed, failed: total - passed, avgScore, uniqueQuizzes },
    submissions: result,
  });
}
