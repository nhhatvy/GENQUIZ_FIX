import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/classes/[id]/enrollments — list students in a class
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  const cls = await prisma.class.findFirst({ where: { id, teacherId: session.user.id } });
  if (!cls) return new NextResponse("Not found", { status: 404 });

  const enrollments = await prisma.enrollment.findMany({
    where: { classId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          _count: { select: { submissions: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(enrollments);
}

// POST /api/classes/[id]/enrollments — add student by email
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { email } = body;

  if (!email?.trim()) {
    return NextResponse.json({ message: "Student email is required" }, { status: 400 });
  }

  const cls = await prisma.class.findFirst({ where: { id, teacherId: session.user.id } });
  if (!cls) return new NextResponse("Not found", { status: 404 });

  const student = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!student) {
    return NextResponse.json({ message: "No user found with that email" }, { status: 404 });
  }

  if (student.role !== "STUDENT") {
    return NextResponse.json({ message: "Only students can be enrolled" }, { status: 400 });
  }

  const existing = await prisma.enrollment.findUnique({
    where: { classId_userId: { classId: id, userId: student.id } },
  });

  if (existing) {
    return NextResponse.json({ message: "Student already enrolled" }, { status: 409 });
  }

  const enrollment = await prisma.enrollment.create({
    data: { classId: id, userId: student.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          _count: { select: { submissions: true } },
        },
      },
    },
  });

  return NextResponse.json(enrollment, { status: 201 });
}

// DELETE /api/classes/[id]/enrollments?userId=xxx — remove student
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "userId is required" }, { status: 400 });
  }

  const cls = await prisma.class.findFirst({ where: { id, teacherId: session.user.id } });
  if (!cls) return new NextResponse("Not found", { status: 404 });

  await prisma.enrollment.deleteMany({ where: { classId: id, userId } });

  return new NextResponse(null, { status: 204 });
}
