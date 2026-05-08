import z from "zod";
export const questionTypeEnum = z.enum(["multiple_choice", "true_false"]);
export const questionSchema = z.object({
    quiz_id: z.union([z.string(), z.number(), z.bigint()]),
   question_text: z
    .string()
    .min(5, { message: "Nội dung câu hỏi phải có ít nhất 5 ký tự" })
    .max(5000, { message: "Câu hỏi quá dài" }),

  question_type: questionTypeEnum,

  // Validate mảng các lựa chọn
  options_json: z
    .array(z.string().min(1, "Đáp án không được để trống"))
    .min(2, "Trắc nghiệm phải có ít nhất 2 lựa chọn"),

  // Validate mảng các index đúng
  correct_index: z
    .array(z.number().int().nonnegative())
    .min(1, "Phải chọn ít nhất một đáp án đúng"),

  points: z
    .number()
    .min(0, "Điểm không được âm")
    .max(100)
    .default(1.0),

  order_inquiz: z.number().int().default(0),
});
export const questionUpdateSchema = questionSchema.partial().extend({
    question_id: z.union([z.string(), z.number(), z.bigint()]),
})