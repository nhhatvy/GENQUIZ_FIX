import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const banks = await prisma.questionBank.findMany({
      where: { userId: session.user.id },
      include: { _count: { select: { questions: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(banks);
  } catch (error) {
    console.error("[QUESTION_BANK_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
