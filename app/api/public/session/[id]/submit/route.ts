import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { nickname, answers, timeTakenSeconds } = body as {
    nickname: string;
    answers: { questionId: string; selectedOptionId: string }[];
    timeTakenSeconds?: number;
  };

  if (!nickname?.trim() || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      quiz: {
        include: {
          questions: { include: { options: true } },
        },
      },
    },
  });

  if (!session) return new NextResponse("Session not found", { status: 404 });
  if (session.status !== "Active") {
    return NextResponse.json({ message: "Session has not started or has already ended" }, { status: 400 });
  }

  // Class-restricted: enforce enrollment on submit too
  if (session.classId) {
    const authSession = await auth().catch(() => null);
    if (!authSession?.user?.id) {
      return NextResponse.json(
        { message: "This exam requires you to be logged in.", code: "LOGIN_REQUIRED" },
        { status: 403 }
      );
    }
    const enrollment = await prisma.enrollment.findUnique({
      where: { classId_userId: { classId: session.classId, userId: authSession.user.id } },
    });
    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this class.", code: "NOT_ENROLLED" },
        { status: 403 }
      );
    }
  }

  const questions = session.quiz.questions;
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

  let totalScore = 0;
  const processedAnswers = answers.map((a) => {
    const question = questions.find((q) => q.id === a.questionId);
    const option = question?.options.find((o) => o.id === a.selectedOptionId);
    const isCorrect = option?.isCorrect ?? false;
    if (isCorrect && question) totalScore += question.points;
    return { questionId: a.questionId, selectedOptionId: a.selectedOptionId, isCorrect };
  });

  // Link to user account nếu đang đăng nhập
  const authSession = await auth().catch(() => null);
  const userId = authSession?.user?.id ?? null;

  const submission = await prisma.submission.create({
    data: {
      nickname: nickname.trim(),
      totalScore,
      maxScore,
      timeTakenSeconds: timeTakenSeconds ?? 0,
      sessionId: id,
      userId,
      answers: { create: processedAnswers },
    },
  });

  const passed = maxScore > 0 ? (totalScore / maxScore) * 100 >= session.quiz.passingScore : false;

  return NextResponse.json(
    { submissionId: submission.id, totalScore, maxScore, passed },
    { status: 201 }
  );
}
