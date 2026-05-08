import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    const bank = await prisma.questionBank.findFirst({
      where: { id, userId: session.user.id },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!bank) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json(bank);
  } catch (error) {
    console.error("[QUESTION_BANK_GET_ID]", error);
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

    const bank = await prisma.questionBank.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!bank) return new NextResponse("Not Found", { status: 404 });

    await prisma.questionBank.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[QUESTION_BANK_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
