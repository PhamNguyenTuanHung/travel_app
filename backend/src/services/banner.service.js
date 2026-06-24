const prisma = require("../config/db");

class BannerService {
  async getAllBanners({ limit = 10, page = 1, is_active, type, search }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (is_active !== undefined) {
      where.is_active = is_active === 'true' || is_active === true;
    }
    if (type) {
      where.type = type;
    }

    const [rows, count] = await Promise.all([
      prisma.banners.findMany({
        where,
        take,
        skip,
        orderBy: { start_date: 'desc' }
      }),
      prisma.banners.count({ where })
    ]);

    return { count, rows };
  }

  async getBannerById(id) {
    const banner = await prisma.banners.findUnique({
      where: { id: parseInt(id) }
    });
    if (!banner) {
      throw new Error("BANNER_NOT_FOUND");
    }
    return banner;
  }

  async createBanner(data) {
    const { title, image_url, type, target_url, start_date, end_date, is_active } = data;
    return await prisma.banners.create({
      data: {
        title,
        image_url,
        type,
        target_url: target_url || null,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        is_active: is_active !== undefined ? (is_active === 'true' || is_active === true) : true
      }
    });
  }

  async updateBanner(id, data) {
    const bannerId = parseInt(id);
    const banner = await prisma.banners.findUnique({ where: { id: bannerId } });
    if (!banner) {
      throw new Error("BANNER_NOT_FOUND");
    }

    const payload = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.image_url !== undefined) payload.image_url = data.image_url;
    if (data.type !== undefined) payload.type = data.type;
    if (data.target_url !== undefined) payload.target_url = data.target_url;
    if (data.start_date !== undefined) payload.start_date = new Date(data.start_date);
    if (data.end_date !== undefined) payload.end_date = new Date(data.end_date);
    if (data.is_active !== undefined) {
      payload.is_active = data.is_active === 'true' || data.is_active === true;
    }

    return await prisma.banners.update({
      where: { id: bannerId },
      data: payload
    });
  }

  async deleteBanner(id) {
    const bannerId = parseInt(id);
    const banner = await prisma.banners.findUnique({ where: { id: bannerId } });
    if (!banner) {
      throw new Error("BANNER_NOT_FOUND");
    }
    await prisma.banners.delete({ where: { id: bannerId } });
    return { id: bannerId, deleted: true };
  }
}

module.exports = new BannerService();
