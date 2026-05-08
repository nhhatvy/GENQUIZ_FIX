import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: { include: { options: true }, orderBy: { order: "asc" } },
        creator: { select: { id: true, name: true, firstName: true, lastName: true } },
      },
    });
    if (!quiz) return new NextResponse("Not Found", { status: 404 });
    return NextResponse.json(quiz);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Xoá questions cũ rồi tạo lại
    await prisma.question.deleteMany({ where: { quizId: id } });

    const quiz = await prisma.quiz.update({
      where: { id, creatorId: session.user.id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        difficulty: body.difficulty,
        timeLimit: body.timeLimit,
        passingScore: body.passingScore,
        status: body.status,
        visibility: body.visibility ?? "Private",
        questions: {
          create: body.questions.map((q: any, index: number) => ({
            text: q.text,
            type: q.type,
            points: q.points,
            order: index,
            options: {
              create: q.options.map((opt: any) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
              })),
            },
          })),
        },
      },
      include: { _count: { select: { questions: true } } },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_PUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    await prisma.quiz.delete({ where: { id, creatorId: session.user.id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("[QUIZ_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
