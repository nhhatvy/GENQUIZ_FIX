import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/student/reports  body: { quizId, reason, description? }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { quizId, reason, description } = await req.json();

  if (!quizId || !reason) {
    return NextResponse.json({ message: "Quiz and reason are required" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true } });
  if (!quiz) return NextResponse.json({ message: "Quiz not found" }, { status: 404 });

  // Kiểm tra đã report chưa
  const existing = await prisma.report.findUnique({
    where: { quizId_reporterId: { quizId, reporterId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ message: "You have already reported this quiz" }, { status: 400 });
  }

  await prisma.report.create({
    data: { quizId, reporterId: session.user.id, reason, description: description || null },
  });

  return NextResponse.json({ success: true });
}
