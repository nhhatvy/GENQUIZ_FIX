import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: authSession.user.id },
    select: { id: true, email: true, name: true, firstName: true, lastName: true, bio: true, avatarUrl: true, role: true },
  });

  if (!user) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { firstName, lastName, bio, avatarUrl } = await req.json();

  if (!firstName?.trim()) {
    return NextResponse.json({ message: "First name is required" }, { status: 400 });
  }

  const fullName = [firstName.trim(), lastName?.trim()].filter(Boolean).join(" ");

  const updated = await prisma.user.update({
    where: { id: authSession.user.id },
    data: {
      firstName: firstName.trim(),
      lastName: lastName?.trim() ?? null,
      name: fullName,
      bio: bio?.trim() ?? null,
      avatarUrl: avatarUrl?.trim() ?? null,
    },
    select: { id: true, email: true, name: true, firstName: true, lastName: true, bio: true, avatarUrl: true, role: true },
  });

  return NextResponse.json(updated);
}
