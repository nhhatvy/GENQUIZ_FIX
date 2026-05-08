import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: { id: true, text: true, order: true },
      },
    },
  });
  if (!quiz) return new NextResponse("Not found", { status: 404 });

  const submissions = await prisma.submission.findMany({
    where: { session: { quizId: id } },
    include: {
      user: { select: { name: true } },
      answers: { select: { questionId: true, isCorrect: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = submissions.length;
  let sumScore = 0, topScore = 0, sumTime = 0;

  for (const sub of submissions) {
    const pct = sub.maxScore > 0 ? (sub.totalScore / sub.maxScore) * 100 : 0;
    sumScore += pct;
    if (pct > topScore) topScore = pct;
    sumTime += sub.timeTakenSeconds;
  }

  const recentCompletions = submissions.slice(0, 10).map((sub) => ({
    name: sub.user?.name ?? sub.nickname,
    scorePercent: sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0,
    timeTakenSeconds: sub.timeTakenSeconds,
    completedAt: sub.createdAt,
  }));

  const questionPerformance = quiz.questions.map((q) => {
    let correct = 0;
    for (const sub of submissions) {
      const ans = sub.answers.find((a) => a.questionId === q.id);
      if (ans?.isCorrect) correct++;
    }
    return {
      text: q.text,
      order: q.order,
      correctPercent: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });

  return NextResponse.json({
    stats: {
      totalCompletions: total,
      avgTimeSeconds: total > 0 ? Math.round(sumTime / total) : 0,
      avgScore: total > 0 ? Math.round((sumScore / total) * 10) / 10 : 0,
      topScore: Math.round(topScore),
    },
    recentCompletions,
    questionPerformance,
  });
}
