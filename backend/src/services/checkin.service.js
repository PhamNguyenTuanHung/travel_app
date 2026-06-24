const prisma = require("../config/db");

class CheckinService {
  async getCheckins(user_id) {
    return await prisma.user_checkins.findMany({
      where: { user_id },
      include: {
        places: {
          include: {
            provinces: true
          }
        }
      },
      orderBy: { verified_at: 'desc' }
    });
  }

  async addCheckin(user_id, place_id) {
    const placeId = BigInt(place_id);
    const place = await prisma.places.findUnique({ where: { id: placeId } });
    if (!place) {
      throw new Error("PLACE_NOT_FOUND");
    }

    return await prisma.user_checkins.create({
      data: {
        user_id,
        place_id: placeId
      }
    });
  }
}

module.exports = new CheckinService();
