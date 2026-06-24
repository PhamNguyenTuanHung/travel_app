const prisma = require("../config/db");

class AdClickImpressionService {
  async getAllLogs({ limit = 10, page = 1, ad_id, place_id, user_id, event_type }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};
    if (ad_id) where.ad_id = parseInt(ad_id);
    if (place_id) where.place_id = BigInt(place_id);
    if (user_id) where.user_id = user_id;
    if (event_type) where.event_type = event_type;

    const [rows, count] = await Promise.all([
      prisma.ad_clicks_impressions.findMany({
        where,
        take,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          ads: true,
          places: true,
          users: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      }),
      prisma.ad_clicks_impressions.count({ where })
    ]);

    return { count, rows };
  }

  async getLogById(id) {
    const logId = BigInt(id);
    const log = await prisma.ad_clicks_impressions.findUnique({
      where: { id: logId },
      include: {
        ads: true,
        places: true,
        users: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });
    if (!log) {
      throw new Error("LOG_NOT_FOUND");
    }
    return log;
  }

  async createLog(data, current_user_id) {
    const { ad_id, place_id, event_type, ip_address, user_agent, user_id } = data;

    // Use current_user_id from JWT if present, otherwise fall back to user_id in payload, or null
    const finalUserId = current_user_id || user_id || null;

    if (ad_id) {
      const adExists = await prisma.ads.findUnique({ where: { id: parseInt(ad_id) } });
      if (!adExists) {
        throw new Error("AD_NOT_FOUND");
      }
    }

    if (place_id) {
      const placeExists = await prisma.places.findUnique({ where: { id: BigInt(place_id) } });
      if (!placeExists) {
        throw new Error("PLACE_NOT_FOUND");
      }
    }

    if (finalUserId) {
      const userExists = await prisma.users.findUnique({ where: { id: finalUserId } });
      if (!userExists) {
        throw new Error("USER_NOT_FOUND");
      }
    }

    return await prisma.ad_clicks_impressions.create({
      data: {
        ad_id: ad_id ? parseInt(ad_id) : null,
        place_id: place_id ? BigInt(place_id) : null,
        user_id: finalUserId,
        event_type,
        ip_address: ip_address || null,
        user_agent: user_agent || null
      }
    });
  }

  async updateLog(id, data) {
    const logId = BigInt(id);
    const log = await prisma.ad_clicks_impressions.findUnique({ where: { id: logId } });
    if (!log) {
      throw new Error("LOG_NOT_FOUND");
    }

    const payload = {};
    if (data.event_type !== undefined) payload.event_type = data.event_type;
    if (data.ip_address !== undefined) payload.ip_address = data.ip_address;
    if (data.user_agent !== undefined) payload.user_agent = data.user_agent;

    if (data.ad_id !== undefined) {
      payload.ad_id = data.ad_id ? parseInt(data.ad_id) : null;
    }
    if (data.place_id !== undefined) {
      payload.place_id = data.place_id ? BigInt(data.place_id) : null;
    }
    if (data.user_id !== undefined) {
      payload.user_id = data.user_id || null;
    }

    return await prisma.ad_clicks_impressions.update({
      where: { id: logId },
      data: payload
    });
  }

  async deleteLog(id) {
    const logId = BigInt(id);
    const log = await prisma.ad_clicks_impressions.findUnique({ where: { id: logId } });
    if (!log) {
      throw new Error("LOG_NOT_FOUND");
    }
    await prisma.ad_clicks_impressions.delete({ where: { id: logId } });
    return { id: Number(logId), deleted: true };
  }
}

module.exports = new AdClickImpressionService();
