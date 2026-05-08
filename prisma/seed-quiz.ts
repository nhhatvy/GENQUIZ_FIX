import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";


const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

const categories = ["Programming", "Web", "Database", "General"];
const difficulties = ["Easy", "Medium", "Hard"] as const;
const statuses = ["Draft", "Published"] as const;

function getRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOptions(correctIndex: number) {
  return Array.from({ length: 4 }).map((_, i) => ({
    text: `Option ${i + 1}`,
    isCorrect: i === correctIndex,
  }));
}

async function createQuiz(userId: string, i: number) {
  return prisma.quiz.create({
    data: {
      title: `Quiz ${i}`,
      description: `Fake quiz number ${i}`,
      category: getRandom(categories),
      difficulty: getRandom(difficulties),
      timeLimit: Math.floor(Math.random() * 30) + 5,
      passingScore: 50 + Math.floor(Math.random() * 50),
      status: getRandom(statuses),
      visibility: Math.random() > 0.5 ? "Public" : "Private",
      creationMethod: "MANUAL",
      creatorId: userId,

      questions: {
        create: Array.from({ length: 5 }).map((_, qIndex) => {
          const correctIndex = Math.floor(Math.random() * 4);
          return {
            text: `Question ${qIndex + 1} of quiz ${i}?`,
            type: "MULTIPLE_CHOICE",
            points: 1,
            order: qIndex,
            options: {
              create: generateOptions(correctIndex),
            },
          };
        }),
      },
    },
  });
}

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "nhhatvy1@gmail.com" }
  });

  if (!user) {
    throw new Error("❌ No user found");
  }

  const TOTAL = 1000;
  const BATCH_SIZE = 50;

  console.log("🚀 Start seeding 1000 quizzes...");

  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batch = [];

    for (let j = i; j < i + BATCH_SIZE && j < TOTAL; j++) {
      batch.push(createQuiz(user.id, j + 1));
    }

    await Promise.all(batch);

    console.log(`✅ Seeded ${i + batch.length}/${TOTAL}`);
  }

  console.log("🎉 DONE 1000 quizzes!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());