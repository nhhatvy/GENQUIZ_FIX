import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function buildLanguageInstruction(languages: string[]): string {
  if (languages.includes("Vietnamese") && languages.includes("English")) {
    return "Randomly mix the language of each question independently — some questions in Vietnamese, some in English. Each question and all its options must be fully in ONE language only (no mixing within a single question). Distribute roughly 50% Vietnamese and 50% English across all questions.";
  }
  if (languages.includes("Vietnamese")) {
    return "Write all questions and options in Vietnamese (Tiếng Việt).";
  }
  return "Write all questions and options in English.";
}

function buildTextPrompt(
  questionCount: number,
  difficulty: string,
  typeInstruction: string,
  bloomLevels: string[],
  subject: string,
  sourceText: string,
  languages: string[]
): string {
  return `You are a quiz generation expert. Based on the content below, generate exactly ${questionCount} quiz questions.

Requirements:
- Overall quiz difficulty: ${difficulty}
- ${typeInstruction}
- Bloom's Taxonomy cognitive levels to focus on: ${bloomLevels.join(", ")}
- Subject: ${subject}
- Language: ${buildLanguageInstruction(languages)}
- Each question must have exactly one correct answer marked with isCorrect: true
- For MULTIPLE_CHOICE: provide exactly 4 options
- For TRUE_FALSE: options must be exactly [{"text":"True","isCorrect":...},{"text":"False","isCorrect":...}]
- Assign each question its own "difficulty": "Easy" | "Medium" | "Hard" based on complexity
  * Easy quiz → ~60% Easy, ~30% Medium, ~10% Hard
  * Medium quiz → ~20% Easy, ~60% Medium, ~20% Hard
  * Hard quiz → ~10% Easy, ~30% Medium, ~60% Hard

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "text": "...",
    "type": "MULTIPLE_CHOICE",
    "difficulty": "Medium",
    "points": 10,
    "options": [
      {"text": "...", "isCorrect": true},
      {"text": "...", "isCorrect": false},
      {"text": "...", "isCorrect": false},
      {"text": "...", "isCorrect": false}
    ]
  }
]

Content:
---
${sourceText.slice(0, 8000)}
---`;
}

function buildPdfPrompt(
  questionCount: number,
  difficulty: string,
  typeInstruction: string,
  bloomLevels: string[],
  subject: string,
  languages: string[]
): string {
  return `You are a quiz generation expert. Based on the PDF document provided, generate exactly ${questionCount} quiz questions.

Requirements:
- Overall quiz difficulty: ${difficulty}
- ${typeInstruction}
- Bloom's Taxonomy cognitive levels to focus on: ${bloomLevels.join(", ")}
- Subject: ${subject}
- Language: ${buildLanguageInstruction(languages)}
- Each question must have exactly one correct answer marked with isCorrect: true
- For MULTIPLE_CHOICE: provide exactly 4 options
- For TRUE_FALSE: options must be exactly [{"text":"True","isCorrect":...},{"text":"False","isCorrect":...}]
- Assign each question its own "difficulty": "Easy" | "Medium" | "Hard" based on complexity
  * Easy quiz → ~60% Easy, ~30% Medium, ~10% Hard
  * Medium quiz → ~20% Easy, ~60% Medium, ~20% Hard
  * Hard quiz → ~10% Easy, ~30% Medium, ~60% Hard

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "text": "...",
    "type": "MULTIPLE_CHOICE",
    "difficulty": "Medium",
    "points": 10,
    "options": [
      {"text": "...", "isCorrect": true},
      {"text": "...", "isCorrect": false},
      {"text": "...", "isCorrect": false},
      {"text": "...", "isCorrect": false}
    ]
  }
]`;
}

async function generateWithOpenAI(apiKey: string, modelId: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const inputType = formData.get("inputType") as string;
    const bankName = formData.get("bankName") as string;
    const subject = formData.get("subject") as string;
    const questionCount = parseInt(formData.get("questionCount") as string) || 10;
    const difficulty = (formData.get("difficulty") as string) || "Medium";
    const bloomLevels = JSON.parse((formData.get("bloomLevels") as string) || '["Understand"]');
    const questionTypesRaw = JSON.parse((formData.get("questionTypes") as string) || '["MULTIPLE_CHOICE"]');
    const languages: string[] = JSON.parse((formData.get("languages") as string) || '["Vietnamese"]');

    const hasMultipleChoice = questionTypesRaw.includes("MULTIPLE_CHOICE");
    const hasTrueFalse = questionTypesRaw.includes("TRUE_FALSE");
    let typeInstruction = "";
    if (hasMultipleChoice && hasTrueFalse) {
      typeInstruction = "Mix both MULTIPLE_CHOICE (4 options) and TRUE_FALSE question types.";
    } else if (hasTrueFalse) {
      typeInstruction = 'Use only TRUE_FALSE question type (options must be exactly "True" and "False").';
    } else {
      typeInstruction = "Use only MULTIPLE_CHOICE question type with 4 options each.";
    }

    // Read config from DB — Admin → AI Config
    const dbSettings = await prisma.setting.findMany({
      where: { key: { in: ["ai_api_key", "ai_model", "ai_provider"] } },
    });
    const cfg: Record<string, string> = {};
    for (const s of dbSettings) cfg[s.key] = s.value;

    const apiKey = cfg["ai_api_key"];
    const modelId = cfg["ai_model"] ?? "gemini-2.0-flash-lite";
    const provider = cfg["ai_provider"] ?? "gemini";

    if (!apiKey) {
      return NextResponse.json({ message: "AI API key not configured. Go to Admin → AI Config." }, { status: 500 });
    }

    let rawText = "";
    let sourceType = "TEXT";
    let sourceFile: string | null = null;

    if (provider === "openai") {
      // OpenAI: all input types converted to text first, then single API call
      let promptText = "";

      if (inputType === "file") {
        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });
        sourceFile = file.name;
        sourceType = "FILE";
        const ext = file.name.split(".").pop()?.toLowerCase();
        const buffer = Buffer.from(await file.arrayBuffer());

        let sourceText = "";
        if (ext === "pdf") {
          return NextResponse.json(
            { message: "PDF upload is not supported with OpenAI provider. Please use text paste or a .docx/.txt file." },
            { status: 400 }
          );
        } else if (ext === "doc" || ext === "docx") {
          sourceText = await extractTextFromDocx(buffer);
        } else {
          sourceText = buffer.toString("utf-8");
        }
        promptText = buildTextPrompt(questionCount, difficulty, typeInstruction, bloomLevels, subject, sourceText, languages);
      } else {
        const sourceText = (formData.get("text") as string) || "";
        if (!sourceText.trim()) return NextResponse.json({ message: "No content to analyze" }, { status: 400 });
        promptText = buildTextPrompt(questionCount, difficulty, typeInstruction, bloomLevels, subject, sourceText, languages);
      }

      rawText = await generateWithOpenAI(apiKey, modelId, promptText);
    } else {
      // Gemini
      const ai = new GoogleGenAI({ apiKey });

      if (inputType === "file") {
        const file = formData.get("file") as File | null;
        if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });
        sourceFile = file.name;
        sourceType = "FILE";
        const ext = file.name.split(".").pop()?.toLowerCase();
        const buffer = Buffer.from(await file.arrayBuffer());

        if (ext === "pdf") {
          const base64 = buffer.toString("base64");
          const response = await ai.models.generateContent({
            model: modelId,
            contents: [
              {
                role: "user",
                parts: [
                  { inlineData: { mimeType: "application/pdf", data: base64 } },
                  { text: buildPdfPrompt(questionCount, difficulty, typeInstruction, bloomLevels, subject, languages) },
                ],
              },
            ],
          });
          rawText = response.text ?? "";
        } else if (ext === "doc" || ext === "docx") {
          const sourceText = await extractTextFromDocx(buffer);
          const response = await ai.models.generateContent({
            model: modelId,
            contents: buildTextPrompt(questionCount, difficulty, typeInstruction, bloomLevels, subject, sourceText, languages),
          });
          rawText = response.text ?? "";
        } else {
          const sourceText = buffer.toString("utf-8");
          const response = await ai.models.generateContent({
            model: modelId,
            contents: buildTextPrompt(questionCount, difficulty, typeInstruction, bloomLevels, subject, sourceText, languages),
          });
          rawText = response.text ?? "";
        }
      } else {
        const sourceText = (formData.get("text") as string) || "";
        if (!sourceText.trim()) return NextResponse.json({ message: "No content to analyze" }, { status: 400 });
        const response = await ai.models.generateContent({
          model: modelId,
          contents: buildTextPrompt(questionCount, difficulty, typeInstruction, bloomLevels, subject, sourceText, languages),
        });
        rawText = response.text ?? "";
      }
    }

    // Parse JSON từ response
    let questions: any[] = [];
    try {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");
      questions = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { message: "Failed to parse AI response", raw: rawText },
        { status: 500 }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ message: "AI returned no questions" }, { status: 500 });
    }

    // Lưu vào QuestionBank
    const bank = await prisma.questionBank.create({
      data: {
        name: bankName || `${subject} - AI Generated`,
        subject,
        sourceType,
        sourceFile,
        userId: session.user.id,
        questions: {
          create: questions.map((q: any, index: number) => ({
            text: q.text,
            type: q.type === "TRUE_FALSE" ? "TRUE_FALSE" : "MULTIPLE_CHOICE",
            difficulty: (["Easy", "Medium", "Hard"].includes(q.difficulty) ? q.difficulty : difficulty) as any,
            points: q.points || 10,
            order: index,
            options: {
              create: (q.options || []).map((o: any) => ({
                text: o.text,
                isCorrect: !!o.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ bank, questions: bank.questions }, { status: 201 });
  } catch (error: any) {
    console.error("[AI_GENERATE_QUIZ]", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
