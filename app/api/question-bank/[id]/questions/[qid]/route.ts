import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id, qid } = await params;

    // Verify ownership
    const bank = await prisma.questionBank.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!bank) return new NextResponse("Not Found", { status: 404 });

    const body = await req.json();
    const { text, difficulty, points, options } = body;

    // Update question
    const updated = await prisma.bankQuestion.update({
      where: { id: qid },
      data: {
        ...(text !== undefined && { text }),
        ...(difficulty !== undefined && { difficulty }),
        ...(points !== undefined && { points }),
      },
    });

    // Update options nếu có
    if (Array.isArray(options)) {
      for (const opt of options) {
        if (opt.id) {
          await prisma.bankOption.update({
            where: { id: opt.id },
            data: { text: opt.text, isCorrect: opt.isCorrect },
          });
        }
      }
    }

    const full = await prisma.bankQuestion.findUnique({
      where: { id: qid },
      include: { options: true },
    });

    return NextResponse.json(full);
  } catch (error) {
    console.error("[BANK_QUESTION_PUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id, qid } = await params;

    const bank = await prisma.questionBank.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!bank) return new NextResponse("Not Found", { status: 404 });

    await prisma.bankQuestion.delete({ where: { id: qid } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BANK_QUESTION_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
