import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { syncSessionStatuses } from "@/lib/syncSessionStatus";

type Params = { params: Promise<{ id: string }> };

async function getOwned(id: string, userId: string) {
  return prisma.session.findFirst({
    where: { id, quiz: { creatorId: userId } },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  await syncSessionStatuses();

  const data = await prisma.session.findFirst({
    where: { id, quiz: { creatorId: session.user.id } },
    include: {
      quiz: {
        include: {
          questions: {
            include: { options: true },
            orderBy: { order: "asc" },
          },
        },
      },
      class: { select: { id: true, name: true } },
      submissions: {
        include: { answers: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { submissions: true } },
    },
  });

  if (!data) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const existing = await getOwned(id, session.user.id);
  if (!existing) return new NextResponse("Not found", { status: 404 });

  const body = await req.json();
  const updated = await prisma.session.update({
    where: { id },
    data: {
      title: body.title?.trim() ?? existing.title,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : existing.scheduledAt,
      durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : existing.durationMinutes,
      targetClass: body.targetClass !== undefined ? (body.targetClass?.trim() || null) : existing.targetClass,
      classId: body.classId !== undefined ? (body.classId || null) : existing.classId,
      ...(body.invitedEmails !== undefined && {
        invitedEmails: body.invitedEmails?.length ? JSON.stringify(body.invitedEmails) : null,
      }),
    },
    include: {
      quiz: { select: { id: true, title: true } },
      class: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const existing = await getOwned(id, session.user.id);
  if (!existing) return new NextResponse("Not found", { status: 404 });

  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
