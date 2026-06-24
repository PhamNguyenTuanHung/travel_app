const prisma = require("../config/db");

class TripService {
  async getAllTrips(user_id) {
    return await prisma.trips.findMany({
      where: { user_id },
      include: {
        trip_places: {
          include: {
            places: {
              include: {
                provinces: true
              }
            }
          },
          orderBy: { sort_order: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getTripById(id, user_id) {
    const trip = await prisma.trips.findUnique({
      where: { id },
      include: {
        trip_places: {
          include: {
            places: {
              include: {
                provinces: true
              }
            }
          },
          orderBy: { sort_order: 'asc' }
        }
      }
    });

    if (!trip) {
      throw new Error("TRIP_NOT_FOUND");
    }
    if (trip.user_id !== user_id) {
      throw new Error("UNAUTHORIZED_TRIP_ACCESS");
    }
    return trip;
  }

  async createTrip(user_id, data) {
    const { title } = data;
    return await prisma.trips.create({
      data: {
        user_id,
        title
      }
    });
  }

  async updateTrip(id, user_id, data) {
    const trip = await prisma.trips.findUnique({ where: { id } });
    if (!trip) {
      throw new Error("TRIP_NOT_FOUND");
    }
    if (trip.user_id !== user_id) {
      throw new Error("UNAUTHORIZED_TRIP_ACCESS");
    }

    return await prisma.trips.update({
      where: { id },
      data: {
        title: data.title
      }
    });
  }

  async deleteTrip(id, user_id) {
    const trip = await prisma.trips.findUnique({ where: { id } });
    if (!trip) {
      throw new Error("TRIP_NOT_FOUND");
    }
    if (trip.user_id !== user_id) {
      throw new Error("UNAUTHORIZED_TRIP_ACCESS");
    }

    await prisma.trips.delete({
      where: { id }
    });
    return { id, deleted: true };
  }

  // Trip Places logic
  async addPlaceToTrip(trip_id, user_id, data) {
    const { place_id, sort_order } = data;
    const placeId = BigInt(place_id);

    const trip = await prisma.trips.findUnique({ where: { id: trip_id } });
    if (!trip) {
      throw new Error("TRIP_NOT_FOUND");
    }
    if (trip.user_id !== user_id) {
      throw new Error("UNAUTHORIZED_TRIP_ACCESS");
    }

    const place = await prisma.places.findUnique({ where: { id: placeId } });
    if (!place) {
      throw new Error("PLACE_NOT_FOUND");
    }

    return await prisma.trip_places.create({
      data: {
        trip_id,
        place_id: placeId,
        sort_order: parseInt(sort_order || 0)
      }
    });
  }

  async removePlaceFromTrip(trip_id, user_id, place_id) {
    const placeId = BigInt(place_id);

    const trip = await prisma.trips.findUnique({ where: { id: trip_id } });
    if (!trip) {
      throw new Error("TRIP_NOT_FOUND");
    }
    if (trip.user_id !== user_id) {
      throw new Error("UNAUTHORIZED_TRIP_ACCESS");
    }

    await prisma.trip_places.deleteMany({
      where: {
        trip_id,
        place_id: placeId
      }
    });

    return { trip_id, place_id: Number(placeId), deleted: true };
  }
}

module.exports = new TripService();
