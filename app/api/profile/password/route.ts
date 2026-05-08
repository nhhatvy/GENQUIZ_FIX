import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ message: "New password must be at least 6 characters" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authSession.user.id },
    select: { password: true },
  });

  if (!user) return new NextResponse("Not found", { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: authSession.user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ message: "Password updated successfully" });
}
