import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;

  const session = await prisma.session.findUnique({
    where: { pin },
    select: { id: true, title: true, status: true },
  });

  if (!session) {
    return NextResponse.json({ message: "Invalid or expired PIN" }, { status: 404 });
  }

  return NextResponse.json(session);
}
