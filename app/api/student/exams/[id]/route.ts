import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

// GET /api/student/exams/[id]
// Returns session detail + student's own submission history
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const userId = session.user.id;

  const examSession = await prisma.session.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      pin: true,
      scheduledAt: true,
      durationMinutes: true,
      classId: true,
      invitedEmails: true,
      quiz: {
        select: {
          id: true,
          title: true,
          category: true,
          difficulty: true,
          passingScore: true,
          _count: { select: { questions: true } },
          creator: { select: { name: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!examSession) return new NextResponse("Not found", { status: 404 });

  const submissions = await prisma.submission.findMany({
    where: { sessionId: id, userId },
    select: {
      id: true,
      nickname: true,
      totalScore: true,
      maxScore: true,
      timeTakenSeconds: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ session: examSession, submissions });
}
