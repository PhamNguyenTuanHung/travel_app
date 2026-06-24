const prisma = require("../config/db");

class CategoryService {
  async getAllCategories({ limit = 10, page = 1, search }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};
    if (search) {
      where.OR = [
        { name_vi: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [rows, count] = await Promise.all([
      prisma.categories.findMany({
        where,
        take,
        skip,
        orderBy: { id: 'asc' }
      }),
      prisma.categories.count({ where })
    ]);

    return { count, rows };
  }

  async getCategoryById(id) {
    const category = await prisma.categories.findUnique({
      where: { id: parseInt(id) }
    });
    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
    return category;
  }

  async createCategory(data) {
    const { icon_url, marker_color, name_vi, name_en } = data;
    return await prisma.categories.create({
      data: {
        icon_url,
        marker_color,
        name_vi,
        name_en
      }
    });
  }

  async updateCategory(id, data) {
    const categoryId = parseInt(id);
    const category = await prisma.categories.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    const payload = {};
    if (data.icon_url !== undefined) payload.icon_url = data.icon_url;
    if (data.marker_color !== undefined) payload.marker_color = data.marker_color;
    if (data.name_vi !== undefined) payload.name_vi = data.name_vi;
    if (data.name_en !== undefined) payload.name_en = data.name_en;

    return await prisma.categories.update({
      where: { id: categoryId },
      data: payload
    });
  }

  async deleteCategory(id) {
    const categoryId = parseInt(id);
    const category = await prisma.categories.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
    await prisma.categories.delete({ where: { id: categoryId } });
    return { id: categoryId, deleted: true };
  }
}

module.exports = new CategoryService();
