const prisma = require("../config/db");

class FavoriteService {
  async getFavorites(user_id) {
    return await prisma.favorites.findMany({
      where: { user_id },
      include: {
        places: {
          include: {
            provinces: true
          }
        }
      }
    });
  }

  async addFavorite(user_id, place_id) {
    const placeId = BigInt(place_id);

    return await prisma.$transaction(async (tx) => {
      const place = await tx.places.findUnique({
        where: { id: placeId }
      });

      if (!place) {
        throw new Error("PLACE_NOT_FOUND");
      }

      const existingFavorite = await tx.favorites.findUnique({
        where: {
          user_id_place_id: {
            user_id,
            place_id: placeId
          }
        }
      });

      if (existingFavorite) {
        return {
          ...existingFavorite,
          already_favorited: true
        };
      }

      const favorite = await tx.favorites.create({
        data: {
          user_id,
          place_id: placeId
        }
      });

      await tx.places.update({
        where: { id: placeId },
        data: {
          total_favorites: {
            increment: 1
          }
        }
      });

      return {
        ...favorite,
        already_favorited: false
      };
    });
  }

  async removeFavorite(user_id, place_id) {
    const placeId = BigInt(place_id);

    return await prisma.$transaction(async (tx) => {
      const favorite = await tx.favorites.findUnique({
        where: {
          user_id_place_id: {
            user_id,
            place_id: placeId
          }
        }
      });

      if (!favorite) {
        throw new Error("FAVORITE_NOT_FOUND");
      }

      await tx.favorites.delete({
        where: {
          user_id_place_id: {
            user_id,
            place_id: placeId
          }
        }
      });

      await tx.places.update({
        where: { id: placeId },
        data: {
          total_favorites: {
            decrement: 1
          }
        }
      });

      return {
        removed: true
      };
    });
  }
}

module.exports = new FavoriteService();
