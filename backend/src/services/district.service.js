const prisma = require("../config/db");
const districtMapper = require("../mapper/district.mapper");

class DistrictService {
  async getAllDistricts({ limit = 10, page = 1, search, province_id, is_visible }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};
    if (search) {
      where.OR = [
        { name_vi: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (province_id) {
      where.province_id = parseInt(province_id);
    }
    if (is_visible !== undefined) {
      where.is_visible = is_visible === 'true' || is_visible === true;
    }

    const [rows, count] = await Promise.all([
      prisma.districts.findMany({
        where,
        take,
        skip,
        orderBy: { id: 'asc' },
        include: {
          provinces: true
        }
      }),
      prisma.districts.count({ where })
    ]);

    return { count, rows: districtMapper.toDTOs(rows) };
  }

  async getDistrictById(id) {
    const districtId = parseInt(id);
    const district = await prisma.districts.findUnique({
      where: { id: districtId },
      include: {
        provinces: true
      }
    });
    if (!district) {
      throw new Error("DISTRICT_NOT_FOUND");
    }
    return districtMapper.toDTO(district);
  }

  async createDistrict(data) {
    const { province_id, slug, name_vi, name_en, is_visible } = data;
    
    // Check if province exists
    const provinceExists = await prisma.provinces.findUnique({
      where: { id: parseInt(province_id) }
    });
    if (!provinceExists) {
      throw new Error("PROVINCE_NOT_FOUND");
    }

    const finalSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const district = await prisma.districts.create({
      data: {
        province_id: parseInt(province_id),
        slug: finalSlug,
        name_vi,
        name_en,
        is_visible: is_visible !== undefined ? (is_visible === 'true' || is_visible === true) : true
      }
    });
    return districtMapper.toDTO(district);
  }

  async updateDistrict(id, data) {
    const districtId = parseInt(id);
    const district = await prisma.districts.findUnique({ where: { id: districtId } });
    if (!district) {
      throw new Error("DISTRICT_NOT_FOUND");
    }

    const payload = {};
    if (data.province_id !== undefined) {
      const provinceExists = await prisma.provinces.findUnique({
        where: { id: parseInt(data.province_id) }
      });
      if (!provinceExists) {
        throw new Error("PROVINCE_NOT_FOUND");
      }
      payload.province_id = parseInt(data.province_id);
    }
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.name_vi !== undefined) payload.name_vi = data.name_vi;
    if (data.name_en !== undefined) payload.name_en = data.name_en;
    if (data.is_visible !== undefined) {
      payload.is_visible = data.is_visible === 'true' || data.is_visible === true;
    }

    const updated = await prisma.districts.update({
      where: { id: districtId },
      data: payload
    });
    return districtMapper.toDTO(updated);
  }

  async deleteDistrict(id) {
    const districtId = parseInt(id);
    const district = await prisma.districts.findUnique({ where: { id: districtId } });
    if (!district) {
      throw new Error("DISTRICT_NOT_FOUND");
    }
    await prisma.districts.delete({ where: { id: districtId } });
    return { id: districtId, deleted: true };
  }
}

module.exports = new DistrictService();
