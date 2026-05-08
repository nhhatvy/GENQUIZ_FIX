import * as z from "zod";

export const QuizSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải ít nhất 5 ký tự").max(100),
  description: z.string().optional().default(""),
  category: z.string().min(1, "Chọn danh mục"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  timeLimit: z.coerce.number().min(1).default(15),
  passingScore: z.coerce.number().min(0).max(100).default(70),
  status: z.enum(["Draft", "Published"]).default("Published"),
  visibility: z.enum(["Public", "Private"]).default("Private"),
  creationMethod: z.enum(["MANUAL", "AI"]).default("MANUAL"),
  questions: z.array(
    z.object({
      text: z.string().min(1, "Câu hỏi không được để trống"),
      type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE"]),
      points: z.coerce.number().min(1).default(10),
      options: z
        .array(z.object({ text: z.string().min(1), isCorrect: z.boolean() }))
        .min(2)
        .refine((opts) => opts.some((o) => o.isCorrect), {
          message: "Phải có ít nhất một đáp án đúng",
        }),
    })
  ).min(1, "Phải có ít nhất 1 câu hỏi"),
});

export type QuizInput = z.infer<typeof QuizSchema>;
