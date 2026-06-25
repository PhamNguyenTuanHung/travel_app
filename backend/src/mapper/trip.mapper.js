const placeMapper = require("./place.mapper");

class TripMapper {
  toDTO(trip) {
    if (!trip) return null;
    return {
      id: trip.id,
      user_id: trip.user_id,
      title: trip.title,
      created_at: trip.created_at,
      trip_places: Array.isArray(trip.trip_places) ? trip.trip_places.map(tp => ({
        id: Number(tp.id),
        trip_id: tp.trip_id,
        place_id: Number(tp.place_id),
        sort_order: tp.sort_order,
        places: tp.places ? placeMapper.toListViewDTO(tp.places) : undefined
      })) : undefined
    };
  }

  toDTOs(trips) {
    if (!Array.isArray(trips)) return [];
    return trips.map(trip => this.toDTO(trip));
  }

  toTripPlaceDTO(tp) {
    if (!tp) return null;
    return {
      id: Number(tp.id),
      trip_id: tp.trip_id,
      place_id: Number(tp.place_id),
      sort_order: tp.sort_order,
      places: tp.places ? placeMapper.toListViewDTO(tp.places) : undefined
    };
  }
}

module.exports = new TripMapper();
