import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [totalUsers, pendingReports, activeSessions, totalQuizzes, recentReports, newUsers] =
    await Promise.all([
      prisma.user.count({ where: { role: { not: "ADMIN" } } }),
      prisma.report.count({ where: { status: "Pending" } }),
      prisma.session.count({ where: { status: "Active" } }),
      prisma.quiz.count(),
      prisma.report.findMany({
        where: { status: "Pending" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          reason: true,
          status: true,
          createdAt: true,
          quiz: { select: { title: true } },
          reporter: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: { not: "ADMIN" } },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

  return NextResponse.json({
    stats: { totalUsers, pendingReports, activeSessions, totalQuizzes },
    recentReports,
    newUsers,
  });
}
