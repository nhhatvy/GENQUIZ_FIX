import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

function derivePriority(reason: string): "High" | "Medium" | "Low" {
  if (reason === "Inappropriate") return "High";
  if (reason === "Spam") return "Medium";
  return "Low";
}

// GET /api/admin/reports?status=Pending|Resolved|Rejected&search=
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  const reports = await prisma.report.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { quiz: { title: { contains: search } } },
          { reporter: { name: { contains: search } } },
          { reason: { contains: search } },
        ],
      } : {}),
    },
    select: {
      id: true,
      reason: true,
      description: true,
      status: true,
      createdAt: true,
      quiz: { select: { id: true, title: true, category: true } },
      reporter: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    reports.map((r) => ({ ...r, priority: derivePriority(r.reason) }))
  );
}

// PATCH /api/admin/reports  body: { reportId, action: "resolve" | "reject" }
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { reportId, action } = await req.json();
  if (!reportId || !["resolve", "reject"].includes(action)) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ message: "Report not found" }, { status: 404 });

  await prisma.report.update({
    where: { id: reportId },
    data: { status: action === "resolve" ? "Resolved" : "Rejected" },
  });

  if (action === "resolve") {
    await prisma.quiz.update({
      where: { id: report.quizId },
      data: { visibility: "Private" },
    });
  }

  return NextResponse.json({ success: true });
}
