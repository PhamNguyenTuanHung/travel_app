const prisma = require("../config/db");

class AdService {
  async getAllAds({ limit = 10, page = 1, is_active, type, search }) {
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
      prisma.ads.findMany({
        where,
        take,
        skip,
        orderBy: { start_date: 'desc' }
      }),
      prisma.ads.count({ where })
    ]);

    return { count, rows };
  }

  async getAdById(id) {
    const ad = await prisma.ads.findUnique({
      where: { id: parseInt(id) }
    });
    if (!ad) {
      throw new Error("AD_NOT_FOUND");
    }
    return ad;
  }

  async createAd(data) {
    const { title, image_url, type, target_url, start_date, end_date, is_active, place_id, provider_id } = data;
    return await prisma.ads.create({
      data: {
        title,
        image_url,
        type,
        target_url: target_url || null,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        is_active: is_active !== undefined ? (is_active === 'true' || is_active === true) : true,
        place_id: place_id ? BigInt(place_id) : null,
        provider_id: provider_id ? parseInt(provider_id) : null
      }
    });
  }

  async updateAd(id, data) {
    const adId = parseInt(id);
    const ad = await prisma.ads.findUnique({ where: { id: adId } });
    if (!ad) {
      throw new Error("AD_NOT_FOUND");
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
    if (data.place_id !== undefined) {
      payload.place_id = data.place_id ? BigInt(data.place_id) : null;
    }
    if (data.provider_id !== undefined) {
      payload.provider_id = data.provider_id ? parseInt(data.provider_id) : null;
    }

    return await prisma.ads.update({
      where: { id: adId },
      data: payload
    });
  }

  async deleteAd(id) {
    const adId = parseInt(id);
    const ad = await prisma.ads.findUnique({ where: { id: adId } });
    if (!ad) {
      throw new Error("AD_NOT_FOUND");
    }
    await prisma.ads.delete({ where: { id: adId } });
    return { id: adId, deleted: true };
  }
}

module.exports = new AdService();
