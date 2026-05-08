import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  const cls = await prisma.class.findFirst({
    where: { id, teacherId: session.user.id },
    include: {
      enrollments: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { sessions: true } },
    },
  });

  if (!cls) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(cls);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, description } = body;

  const cls = await prisma.class.findFirst({ where: { id, teacherId: session.user.id } });
  if (!cls) return new NextResponse("Not found", { status: 404 });

  const updated = await prisma.class.update({
    where: { id },
    data: {
      name: name?.trim() ?? cls.name,
      description: description !== undefined ? description?.trim() || null : cls.description,
    },
    include: { _count: { select: { enrollments: true, sessions: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  const cls = await prisma.class.findFirst({ where: { id, teacherId: session.user.id } });
  if (!cls) return new NextResponse("Not found", { status: 404 });

  await prisma.class.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
