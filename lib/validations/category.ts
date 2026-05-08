import z from "zod";

export const categorySchema = z.object({
    name: z.string().min(3, { message: "Tên danh mục phải có ít nhất 3 ký tự" }).max(100, { message: "Tên danh mục quá dài" }),
    slug : z.string().min(3).max(100).optional(),
});
export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD') // Tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '') // Xóa ký tự đặc biệt
    .replace(/(\s+)/g, '-') // Thay khoảng trắng bằng gạch ngang
    .replace(/-+/g, '-') // Tránh gạch ngang liên tiếp
    .replace(/^-+|-+$/g, ''); // Xóa gạch ở đầu/cuối
};
export const categoryUpdateSchema = categorySchema.partial().extend({
    category_id: z.union([z.string(), z.number(), z.bigint()]),
})