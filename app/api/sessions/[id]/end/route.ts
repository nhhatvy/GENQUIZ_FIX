import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const existing = await prisma.session.findFirst({
    where: { id, quiz: { creatorId: session.user.id } },
  });
  if (!existing) return new NextResponse("Not found", { status: 404 });

  const updated = await prisma.session.update({
    where: { id },
    data: {
      status: "Completed",
      endTime: new Date(),
    },
  });

  return NextResponse.json(updated);
}
