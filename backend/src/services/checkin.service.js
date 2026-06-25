const prisma = require("../config/db");

class CheckinService {
  async getCheckins(user_id) {
    return await prisma.user_checkins.findMany({
      where: { user_id },
      include: {
        places: {
          include: {
            districts: {
              include: {
                provinces: true
              }
            }
          }
        }
      },
      orderBy: { verified_at: 'desc' }
    });
  }

  async addCheckin(user_id, place_id, latitude, longitude) {
    const placeId = BigInt(place_id);
    const place = await prisma.places.findUnique({ where: { id: placeId } });
    if (!place) {
      throw new Error("PLACE_NOT_FOUND");
    }

    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      // Calculate distance in meters using PostGIS geography ST_Distance
      const checkDistance = await prisma.$queryRaw`
        SELECT ST_Distance(
          ST_SetSRID(ST_MakePoint(${Number(longitude)}, ${Number(latitude)}), 4326)::geography,
          (SELECT geom FROM places WHERE id = ${placeId})::geography
        ) AS distance
      `;
      const distance = checkDistance[0] ? Number(checkDistance[0].distance) : null;
      if (distance !== null && distance > 1000) {
        throw new Error("TOO_FAR_FROM_PLACE");
      }

      // Execute Raw SQL insert to populate PostGIS geometry field
      const inserted = await prisma.$queryRaw`
        INSERT INTO user_checkins (
          user_id, place_id, latitude, longitude, geom
        ) VALUES (
          ${user_id}::uuid, ${placeId}, ${Number(latitude)}, ${Number(longitude)}, ST_SetSRID(ST_MakePoint(${Number(longitude)}, ${Number(latitude)}), 4326)
        ) RETURNING id, verified_at
      `;

      const checkinId = inserted[0].id;
      const verifiedAt = inserted[0].verified_at;

      return {
        id: Number(checkinId),
        user_id,
        place_id: Number(placeId),
        latitude: Number(latitude),
        longitude: Number(longitude),
        verified_at: verifiedAt
      };
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
