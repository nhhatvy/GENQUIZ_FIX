import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const session = await prisma.session.findFirst({
    where: { id, studentCreatorId: { not: null } },
    include: {
      quiz: { select: { id: true, title: true, category: true, difficulty: true, passingScore: true } },
      studentCreator: { select: { id: true, name: true } },
      submissions: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          answers: { select: { isCorrect: true } },
        },
      },
      _count: { select: { submissions: true } },
    },
  });

  if (!session) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  // Only the creator can edit
  const session = await prisma.session.findFirst({
    where: { id, studentCreatorId: authSession.user.id },
  });
  if (!session) return new NextResponse("Not found or not your session", { status: 404 });

  const { title, isPublic, invitedEmails } = await req.json();

  const updated = await prisma.session.update({
    where: { id },
    data: {
      ...(title?.trim() && { title: title.trim() }),
      invitedEmails: isPublic
        ? null
        : (invitedEmails?.length ? JSON.stringify(invitedEmails) : null),
    },
    include: {
      quiz: { select: { id: true, title: true, category: true, difficulty: true } },
      studentCreator: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const session = await prisma.session.findFirst({
    where: { id, studentCreatorId: authSession.user.id },
  });
  if (!session) return new NextResponse("Not found or not your session", { status: 404 });

  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
