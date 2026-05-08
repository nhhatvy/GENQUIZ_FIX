import prisma from "@/lib/prisma";

/**
 * Lazy status transitions for teacher-created sessions.
 * Call this at the start of any GET that returns session data.
 *
 * Rules:
 *  - Upcoming  + scheduledAt <= now              → Active
 *  - Active    + scheduledAt + duration <= now   → Completed
 */
export async function syncSessionStatuses() {
  const now = new Date();

  // 1. Upcoming → Active
  await prisma.session.updateMany({
    where: {
      status: "Upcoming",
      scheduledAt: { lte: now },
      studentCreatorId: null, // only teacher sessions
    },
    data: { status: "Active" },
  });

  // 2. Active → Completed (requires arithmetic — fetch then filter in JS)
  const activeSessions = await prisma.session.findMany({
    where: {
      status: "Active",
      scheduledAt: { not: null },
      studentCreatorId: null,
    },
    select: { id: true, scheduledAt: true, durationMinutes: true },
  });

  const expiredIds = activeSessions
    .filter(
      (s) =>
        s.scheduledAt &&
        s.scheduledAt.getTime() + s.durationMinutes * 60 * 1000 <= now.getTime()
    )
    .map((s) => s.id);

  if (expiredIds.length > 0) {
    await prisma.session.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: "Completed", endTime: now },
    });
  }
}
