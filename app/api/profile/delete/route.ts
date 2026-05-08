import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ success: true });
}
