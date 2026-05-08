import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/student/exams?status=Upcoming|Active|Completed
// Returns sessions the student has access to:
// 1. Public sessions (classId = null, studentCreatorId = null)
// 2. Class sessions where student is enrolled
// 3. Sessions where student's email is in invitedEmails
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";

  const userId = session.user.id;
  const userEmail = session.user.email ?? "";

  // Get classes the student is enrolled in
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { classId: true },
  });
  const enrolledClassIds = enrollments.map((e) => e.classId);

  const sessions = await prisma.session.findMany({
    where: {
      studentCreatorId: null, // exclude study group sessions
      ...(status ? { status } : {}),
      OR: [
        // Class sessions student is enrolled in → always show
        { classId: { in: enrolledClassIds } },
        // Sessions where student is invited by email → always show
        { classId: null, invitedEmails: { contains: userEmail } },
        // Public sessions → only show if student has participated
        {
          classId: null,
          invitedEmails: null,
          submissions: { some: { userId } },
        },
      ],
    },
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
          id: true, title: true, category: true,
          creator: { select: { name: true, firstName: true, lastName: true } },
        },
      },
      _count: { select: { submissions: true } },
      submissions: {
        where: { userId },
        select: { id: true, totalScore: true, maxScore: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: [
      { status: "asc" }, // Active first, then Upcoming, then Completed
      { scheduledAt: "desc" },
    ],
  });

  return NextResponse.json(sessions);
}
