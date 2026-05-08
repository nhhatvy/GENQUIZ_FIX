export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD') // Chuyển về dạng tổ hợp để bỏ dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '') // Xóa ký tự đặc biệt
    .replace(/(\s+)/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Tránh nhiều dấu gạch ngang liên tiếp
    .replace(/^-+|-+$/g, ''); // Xóa dấu gạch ở đầu/cuối
}