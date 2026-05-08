import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  // Verify ownership
  const quiz = await prisma.quiz.findFirst({
    where: { id, creatorId: authSession.user.id },
    include: {
      questions: { orderBy: { order: "asc" }, select: { id: true, text: true, order: true } },
    },
  });
  if (!quiz) return new NextResponse("Not found", { status: 404 });

  // All submissions for this quiz (across all sessions)
  const submissions = await prisma.submission.findMany({
    where: { session: { quizId: id, studentCreatorId: null } },
    include: {
      user: { select: { name: true } },
      answers: { select: { questionId: true, isCorrect: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = submissions.length;

  // Aggregate stats
  let sumScore = 0;
  let topScore = 0;
  let sumTime = 0;

  for (const sub of submissions) {
    const pct = sub.maxScore > 0 ? (sub.totalScore / sub.maxScore) * 100 : 0;
    sumScore += pct;
    if (pct > topScore) topScore = pct;
    sumTime += sub.timeTakenSeconds;
  }

  const avgScore = total > 0 ? Math.round((sumScore / total) * 10) / 10 : 0;
  const avgTimeSeconds = total > 0 ? Math.round(sumTime / total) : 0;

  // Recent completions (latest 10)
  const recentCompletions = submissions.slice(0, 10).map((sub) => ({
    name: sub.user?.name ?? sub.nickname,
    scorePercent: sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0,
    timeTakenSeconds: sub.timeTakenSeconds,
    completedAt: sub.createdAt,
  }));

  // Question performance: % of submissions where answer to this question was correct
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
      avgTimeSeconds,
      avgScore,
      topScore: Math.round(topScore),
    },
    recentCompletions,
    questionPerformance,
  });
}
