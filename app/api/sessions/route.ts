import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { syncSessionStatuses } from "@/lib/syncSessionStatus";

async function uniquePin(): Promise<string> {
  while (true) {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await prisma.session.findUnique({ where: { pin } });
    if (!existing) return pin;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  await syncSessionStatuses();

  const sessions = await prisma.session.findMany({
    where: { quiz: { creatorId: session.user.id } },
    include: {
      quiz: { select: { id: true, title: true } },
      class: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { title, quizId, scheduledAt, durationMinutes, targetClass, classId, invitedEmails } = body;

  if (!title?.trim() || !quizId) {
    return NextResponse.json({ message: "title and quizId are required" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, creatorId: session.user.id },
  });
  if (!quiz) return new NextResponse("Quiz not found", { status: 404 });

  // Validate classId belongs to this teacher
  if (classId) {
    const cls = await prisma.class.findFirst({ where: { id: classId, teacherId: session.user.id } });
    if (!cls) return new NextResponse("Class not found", { status: 404 });
  }

  const pin = await uniquePin();

  const newSession = await prisma.session.create({
    data: {
      title: title.trim(),
      quizId,
      pin,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      durationMinutes: durationMinutes ? Number(durationMinutes) : quiz.timeLimit,
      targetClass: targetClass?.trim() || null,
      classId: classId || null,
      invitedEmails: invitedEmails?.length ? JSON.stringify(invitedEmails) : null,
      status: "Upcoming",
    },
    include: {
      quiz: { select: { id: true, title: true } },
      class: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
  });

  return NextResponse.json(newSession, { status: 201 });
}
