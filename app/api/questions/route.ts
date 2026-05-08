import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const questionSchema = z.object({
  quizId: z.string(),
  text: z.string().min(1),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE"]).default("MULTIPLE_CHOICE"),
  points: z.number().int().default(10),
  order: z.number().int(),
  options: z.array(
    z.object({
      text: z.string().min(1),
      isCorrect: z.boolean(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = questionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const quizExists = await prisma.quiz.findUnique({ where: { id: data.quizId } });
    if (!quizExists) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        quizId: data.quizId,
        text: data.text,
        type: data.type,
        points: data.points,
        order: data.order,
        options: {
          create: data.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json(
      { message: "Question created", data: newQuestion },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Question API Error:", error);
    return NextResponse.json(
      { message: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
