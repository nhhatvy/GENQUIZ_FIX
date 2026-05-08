import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Public — không cần auth cho public sessions; class sessions yêu cầu đăng nhập + enrolled
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          passingScore: true,
          questions: {
            select: {
              id: true,
              text: true,
              type: true,
              points: true,
              order: true,
              options: {
                select: {
                  id: true,
                  text: true,
                  // isCorrect KHÔNG gửi xuống client — chống gian lận
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!session) return new NextResponse("Not found", { status: 404 });

  // Class-restricted: chỉ enrolled students mới vào được
  if (session.classId) {
    const authSession = await auth().catch(() => null);
    if (!authSession?.user?.id) {
      return NextResponse.json(
        { message: "This exam is restricted to enrolled students. Please log in to continue.", code: "LOGIN_REQUIRED" },
        { status: 403 }
      );
    }
    const enrollment = await prisma.enrollment.findUnique({
      where: { classId_userId: { classId: session.classId, userId: authSession.user.id } },
    });
    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in the class assigned to this exam.", code: "NOT_ENROLLED" },
        { status: 403 }
      );
    }
  }

  // Auto-activate khi scheduledAt đã qua mà status vẫn Upcoming
  if (session.status === "Upcoming" && session.scheduledAt && session.scheduledAt <= new Date()) {
    const updated = await prisma.session.update({
      where: { id },
      data: { status: "Active" },
      include: {
        quiz: {
          select: {
            id: true, title: true, passingScore: true,
            questions: {
              select: {
                id: true, text: true, type: true, points: true, order: true,
                options: { select: { id: true, text: true } },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json(session);
}
