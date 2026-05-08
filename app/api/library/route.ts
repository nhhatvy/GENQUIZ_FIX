import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authSession = await auth();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const search = searchParams.get("q") ?? "";

  const quizzes = await prisma.quiz.findMany({
    where: {
      visibility: "Public",
      status: "Published",
      // Exclude user's own quizzes
      ...(authSession?.user?.id ? { creatorId: { not: authSession.user.id } } : {}),
      ...(category ? { category } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
    include: {
      creator: { select: { id: true, name: true, role: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(quizzes);
}
