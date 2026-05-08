import { NextResponse } from "next/server";
import { QuizSchema } from "@/lib/validations/quiz";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const tab = searchParams.get("tab") || "All Quizzes";
    const whereCondition: any = {
      creatorId: session.user.id,
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { category: { contains: search } },
        ]
      } : {}),
    };
    if (tab === "Published") {
      whereCondition.status = "Published";
    }

    if (tab === "Drafts") {
      whereCondition.status = "Draft";
    }

    // Chạy song song truy vấn đếm và truy vấn lấy dữ liệu
    const [total, quizzes] = await Promise.all([
      prisma.quiz.count({ where: whereCondition }),
      prisma.quiz.findMany({
        where: whereCondition,
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      quizzes,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[QUIZZES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = QuizSchema.parse(json);

    const quiz = await prisma.quiz.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        difficulty: body.difficulty,
        timeLimit: body.timeLimit,
        passingScore: body.passingScore,
        status: body.status,
        visibility: body.visibility ?? "Private",
        creationMethod: body.creationMethod ?? "MANUAL",
        creatorId: session.user.id,
        questions: {
          create: body.questions.map((q, index) => ({
            text: q.text,
            type: q.type,
            points: q.points,
            order: index,
            options: {
              create: q.options.map((opt) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
              })),
            },
          })),
        },
      },
      include: { _count: { select: { questions: true } } },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data", errors: error.issues },
        { status: 422 }
      );
    }
    console.error("[QUIZ_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
