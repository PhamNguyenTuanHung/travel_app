const prisma = require("../config/db");
const provinceMapper = require("../mapper/province.mapper");

class ProvinceService {
  async getAllProvinces({ limit = 10, page = 1, search, is_visible }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};
    if (search) {
      where.OR = [
        { name_vi: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (is_visible !== undefined) {
      where.is_visible = is_visible === 'true' || is_visible === true;
    }

    const [rows, count] = await Promise.all([
      prisma.provinces.findMany({
        where,
        take,
        skip,
        orderBy: { name_vi: 'asc' }
      }),
      prisma.provinces.count({ where })
    ]);

    return { count, rows: provinceMapper.toDTOs(rows) };
  }

  async getProvinceById(id) {
    const province = await prisma.provinces.findUnique({
      where: { id: parseInt(id) }
    });
    if (!province) {
      throw new Error("PROVINCE_NOT_FOUND");
    }
    return provinceMapper.toDTO(province);
  }

  async createProvince(data) {
    const { slug, name_vi, name_en, is_visible } = data;
    const finalSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const province = await prisma.provinces.create({
      data: {
        slug: finalSlug,
        name_vi,
        name_en,
        is_visible: is_visible !== undefined ? (is_visible === 'true' || is_visible === true) : true
      }
    });
    return provinceMapper.toDTO(province);
  }

  async updateProvince(id, data) {
    const provinceId = parseInt(id);
    const province = await prisma.provinces.findUnique({ where: { id: provinceId } });
    if (!province) {
      throw new Error("PROVINCE_NOT_FOUND");
    }

    const payload = {};
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.name_vi !== undefined) payload.name_vi = data.name_vi;
    if (data.name_en !== undefined) payload.name_en = data.name_en;
    if (data.is_visible !== undefined) {
      payload.is_visible = data.is_visible === 'true' || data.is_visible === true;
    }

    const updated = await prisma.provinces.update({
      where: { id: provinceId },
      data: payload
    });
    return provinceMapper.toDTO(updated);
  }

  async deleteProvince(id) {
    const provinceId = parseInt(id);
    const province = await prisma.provinces.findUnique({ where: { id: provinceId } });
    if (!province) {
      throw new Error("PROVINCE_NOT_FOUND");
    }
    await prisma.provinces.delete({ where: { id: provinceId } });
    return { id: provinceId, deleted: true };
  }
}

module.exports = new ProvinceService();
