const placeMapper = require("./place.mapper");

class FavoriteMapper {
  toDTO(favorite) {
    if (!favorite) return null;
    const dto = {
      user_id: favorite.user_id,
      place_id: Number(favorite.place_id),
    };
    if (favorite.already_favorited !== undefined) dto.already_favorited = favorite.already_favorited;
    if (favorite.favorited !== undefined) dto.favorited = favorite.favorited;
    if (favorite.removed !== undefined) dto.removed = favorite.removed;
    if (favorite.places) {
      dto.places = placeMapper.toListViewDTO(favorite.places);
    }
    return dto;
  }

  toDTOs(favorites) {
    if (!Array.isArray(favorites)) return [];
    return favorites.map(fav => this.toDTO(fav));
  }
}

module.exports = new FavoriteMapper();
