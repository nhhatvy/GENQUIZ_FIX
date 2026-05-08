import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/submissions/claim
// Links an anonymous submission (userId = null) to the currently logged-in user.
export async function PATCH(req: Request) {
  const authSession = await auth();
  if (!authSession?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { submissionId } = await req.json();
  if (!submissionId) return NextResponse.json({ message: "submissionId required" }, { status: 400 });

  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) return NextResponse.json({ message: "Submission not found" }, { status: 404 });

  // Only claim if it was anonymous (userId = null)
  if (submission.userId !== null) {
    return NextResponse.json({ message: "Already linked to an account" }, { status: 409 });
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: { userId: authSession.user.id },
  });
  

  return NextResponse.json(updated);
}
