import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const providerParam = searchParams.get("provider");

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["ai_provider", "ai_api_key"] } },
  });
  const cfg: Record<string, string> = {};
  for (const s of settings) cfg[s.key] = s.value;

  const provider = providerParam ?? cfg["ai_provider"] ?? "gemini";
  const apiKey = cfg["ai_api_key"];

  if (!apiKey) return NextResponse.json({ error: "No API key configured" }, { status: 400 });

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (!res.ok) return NextResponse.json({ error: "Invalid API key or Gemini request failed" }, { status: 400 });
    const data = await res.json();
    const models: string[] = (data.models ?? [])
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => (m.name as string).replace("models/", ""));
    return NextResponse.json({ models });
  } else {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return NextResponse.json({ error: "Invalid API key or OpenAI request failed" }, { status: 400 });
    const data = await res.json();
    const models: string[] = (data.data ?? [])
      .map((m: any) => m.id as string)
      .filter((id: string) => id.startsWith("gpt-"))
      .sort();
    return NextResponse.json({ models });
  }
}
