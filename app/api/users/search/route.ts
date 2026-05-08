import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) return NextResponse.json([]);

  const roleParam = searchParams.get("role") ?? "STUDENT";
  const role = roleParam === "TEACHER" ? "TEACHER" : "STUDENT";

  const users = await prisma.user.findMany({
    where: {
      role,
      OR: [
        { email: { contains: q } },
        { name: { contains: q } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 8,
    orderBy: { email: "asc" },
  });

  return NextResponse.json(users);
}
