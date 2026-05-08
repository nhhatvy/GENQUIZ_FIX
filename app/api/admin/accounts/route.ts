import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/accounts?role=STUDENT|TEACHER&search=&status=Active|Banned
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const skip = (page - 1) * limit;

  // 1. Định nghĩa điều kiện lọc dùng chung
  const whereCondition: any = {
    role: role === "STUDENT" ? "STUDENT" : role === "TEACHER" ? "TEACHER" : { in: ["STUDENT", "TEACHER"] },
    ...(search ? {
      OR: [
        { name: { contains: search } }, 
        { email: { contains: search } },
      ],
    } : {}),
    ...(status === "Banned" ? { banned: true } : status === "Active" ? { banned: false } : {}),
  };

  try {
    // 2. Chạy song song: Đếm tổng số bản ghi và Lấy dữ liệu trang hiện tại
    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereCondition }),
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          banned: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { quizzes: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      })
    ]);

    return NextResponse.json({
      accounts: users,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("Pagination Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/admin/accounts  body: { firstName, lastName, email, password }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { firstName, lastName, email, password } = await req.json();

  if (!firstName || !email || !password) {
    return NextResponse.json({ message: "First name, email and password are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Email already in use" }, { status: 400 });
  }

  const bcrypt = await import("bcryptjs");
  const hashed = await bcrypt.hash(password, 10);
  const fullName = [firstName.trim(), lastName?.trim()].filter(Boolean).join(" ");

  await prisma.user.create({
    data: { firstName, lastName: lastName || null, name: fullName, email, password: hashed, role: "ADMIN" },
  });

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/accounts  body: { userId, action: "ban" | "unban" }
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { userId, action } = await req.json();
  if (!userId || !["ban", "unban"].includes(action)) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  if (userId === session.user.id) {
    return NextResponse.json({ message: "Cannot ban yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) return NextResponse.json({ message: "User not found" }, { status: 404 });
  if (target.role === "ADMIN") return NextResponse.json({ message: "Cannot ban admin accounts" }, { status: 400 });

  await prisma.user.update({ where: { id: userId }, data: { banned: action === "ban" } });

  return NextResponse.json({ success: true });
}
