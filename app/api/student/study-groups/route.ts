import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

async function uniquePin(): Promise<string> {
  while (true) {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await prisma.session.findUnique({ where: { pin } });
    if (!existing) return pin;
  }
}

// GET: sessions created by any student that the current user can see
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  // Fetch all study group sessions (studentCreatorId is set)
  const all = await prisma.session.findMany({
    where: { studentCreatorId: { not: null } },
    include: {
      quiz: { select: { id: true, title: true, category: true, difficulty: true } },
      studentCreator: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter: show if creator = me OR my email is in invitedEmails OR invitedEmails is null (public)
  const visible = all.filter((s) => {
    if (s.studentCreatorId === session.user!.id) return true;
    if (!s.invitedEmails) return true; // public study group
    try {
      const emails: string[] = JSON.parse(s.invitedEmails);
      return emails.includes(user.email);
    } catch {
      return false;
    }
  });

  return NextResponse.json(visible);
}

// POST: student creates a study group session
export async function POST(req: Request) {
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { quizId, title, isPublic, invitedEmails } = body;

  if (!quizId || !title?.trim()) {
    return NextResponse.json({ message: "quizId and title are required" }, { status: 400 });
  }

  // Verify quiz exists (ownership not required — library quizzes can also be used)
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId },
  });
  if (!quiz) return new NextResponse("Quiz not found", { status: 404 });

  const pin = await uniquePin();

  const newSession = await prisma.session.create({
    data: {
      title: title.trim(),
      quizId,
      pin,
      status: "Active",
      durationMinutes: quiz.timeLimit,
      studentCreatorId: authSession.user.id,
      invitedEmails: !isPublic && invitedEmails?.length
        ? JSON.stringify(invitedEmails)
        : null,
    },
    include: {
      quiz: { select: { id: true, title: true, category: true, difficulty: true } },
      studentCreator: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
  });

  return NextResponse.json(newSession, { status: 201 });
}
