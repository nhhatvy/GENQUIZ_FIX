import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { enrollments: true, sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ message: "Class name is required" }, { status: 400 });
  }

  const newClass = await prisma.class.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      teacherId: session.user.id,
    },
    include: {
      _count: { select: { enrollments: true, sessions: true } },
    },
  });

  return NextResponse.json(newClass, { status: 201 });
}
