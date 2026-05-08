import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["ai_provider", "ai_model", "ai_api_key"] } },
  });

  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  return NextResponse.json({
    provider: map["ai_provider"] ?? "gemini",
    model: map["ai_model"] ?? "",
    apiKey: map["ai_api_key"] ? "••••••••" : "",
    hasKey: !!map["ai_api_key"],
  });
}

export async function POST(req: Request) {
  
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const { provider, model, apiKey } = await req.json();
  console.log("Dữ liệu nhận được:", { provider, model, apiKey: apiKey ? "Có nhận được" : "Trống" });

  const upserts = [
    prisma.setting.upsert({ where: { key: "ai_provider" }, update: { value: provider }, create: { key: "ai_provider", value: provider } }),
    prisma.setting.upsert({ where: { key: "ai_model" }, update: { value: model }, create: { key: "ai_model", value: model } }),
  ];

  if (apiKey && apiKey !== "••••••••") {
    upserts.push(
      prisma.setting.upsert({ where: { key: "ai_api_key" }, update: { value: apiKey }, create: { key: "ai_api_key", value: apiKey } })
    );
  }

  await Promise.all(upserts);
  return NextResponse.json({ ok: true });
}
