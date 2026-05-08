import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/quizzes?tab=All|Drafts&search=&category=
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "All";
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";

  const quizzes = await prisma.quiz.findMany({
    where: {
      ...(tab === "Drafts" ? { status: "Draft" } : {}),
      ...(tab === "Reported" ? { reports: { some: {} } } : {}),
      ...(category ? { category } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { creator: { name: { contains: search } } },
        ],
      } : {}),
    },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      visibility: true,
      createdAt: true,
      creator: { select: { id: true, name: true } },
      _count: { select: { questions: true, reports: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Lấy danh sách categories distinct
  const categories = await prisma.quiz.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return NextResponse.json({
    quizzes,
    categories: categories.map((c) => c.category),
  });
}

// PATCH /api/admin/quizzes  body: { quizId, action: "toggleVisibility" }
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { quizId, action } = await req.json();
  if (!quizId || action !== "toggleVisibility") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { visibility: true } });
  if (!quiz) return NextResponse.json({ message: "Quiz not found" }, { status: 404 });

  await prisma.quiz.update({
    where: { id: quizId },
    data: { visibility: quiz.visibility === "Public" ? "Private" : "Public" },
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/quizzes?quizId=
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get("quizId");
  if (!quizId) return NextResponse.json({ message: "Missing quizId" }, { status: 400 });

  await prisma.quiz.delete({ where: { id: quizId } });

  return NextResponse.json({ success: true });
}
