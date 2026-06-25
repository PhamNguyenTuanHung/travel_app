const prisma = require("../config/db");
const tripMapper = require("../mapper/trip.mapper");

class TripService {
  async getAllTrips(user_id) {
    const list = await prisma.trips.findMany({
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
    return tripMapper.toDTOs(list);
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
    return tripMapper.toDTO(trip);
  }

  async createTrip(user_id, data) {
    const { title } = data;
    const trip = await prisma.trips.create({
      data: {
        user_id,
        title
      }
    });
    return tripMapper.toDTO(trip);
  }

  async updateTrip(id, user_id, data) {
    const trip = await prisma.trips.findUnique({ where: { id } });
    if (!trip) {
      throw new Error("TRIP_NOT_FOUND");
    }
    if (trip.user_id !== user_id) {
      throw new Error("UNAUTHORIZED_TRIP_ACCESS");
    }

    const updated = await prisma.trips.update({
      where: { id },
      data: {
        title: data.title
      }
    });
    return tripMapper.toDTO(updated);
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

    const tp = await prisma.trip_places.create({
      data: {
        trip_id,
        place_id: placeId,
        sort_order: parseInt(sort_order || 0)
      }
    });
    return tripMapper.toTripPlaceDTO(tp);
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
