const prisma = require("../config/db");
const reviewMapper = require("../mapper/review.mapper");

class ReviewService {
  async getAllReviews({ limit = 10, page = 1, place_id, destination_id, user_id }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};
    const targetPlaceId = place_id || destination_id;
    if (targetPlaceId) {
      where.place_id = BigInt(targetPlaceId);
    }
    if (user_id) {
      where.user_id = user_id;
    }

    const [reviewsList, totalCount] = await Promise.all([
      prisma.reviews.findMany({
        where,
        take,
        skip,
        include: {
          users: true,
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
        orderBy: { id: 'desc' }
      }),
      prisma.reviews.count({ where })
    ]);

    const rows = reviewMapper.toDTOs(reviewsList);

    return {
      count: totalCount,
      rows
    };
  }

  async getReviewById(id) {
    const r = await prisma.reviews.findUnique({
      where: { id: BigInt(id) },
      include: {
        users: true,
        places: {
          include: {
            districts: {
              include: {
                provinces: true
              }
            }
          }
        }
      }
    });

    if (!r) {
      throw new Error("REVIEW_NOT_FOUND");
    }

    return reviewMapper.toDTO(r);
  }

  async createReview(data) {
    const { user_id, place_id, rating, comment } = data;
    const targetPlaceId = place_id;

    if (!targetPlaceId) {
      throw new Error("PLACE_ID_REQUIRED");
    }

    const place = await prisma.places.findUnique({
      where: { id: BigInt(targetPlaceId) }
    });
    if (!place) {
      throw new Error("PLACE_NOT_FOUND");
    }

    const user = await prisma.users.findUnique({
      where: { id: user_id }
    });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const review = await prisma.reviews.findFirst({
      where: {
        user_id,
        place_id: BigInt(targetPlaceId)
      }
    })
    if (review) {
      throw new Error("REVIEW_ALREADY_EXISTS");
    }

    const rate = parseInt(rating);
    if (isNaN(rate) || rate < 1 || rate > 5) {
      throw new Error("RATING_MUST_BE_BETWEEN_1_AND_5");
    }

    const newReview = await prisma.reviews.create({
      data: {
        user_id,
        place_id: BigInt(targetPlaceId),
        rating: rate,
        comment,
        status: "approved"
      },
      include: {
        users: true,
        places: {
          include: {
            districts: {
              include: {
                provinces: true
              }
            }
          }
        }
      }
    });

    return reviewMapper.toDTO(newReview);
  }

  async updateReview(id, data) {
    const reviewId = BigInt(id);
    const review = await prisma.reviews.findUnique({
      where: { id: reviewId }
    });
    if (!review) {
      throw new Error("REVIEW_NOT_FOUND");
    }

    if (review.user_id !== data.user_id) {
      throw new Error("UNAUTHORIZED_TO_UPDATE_REVIEW");
    }

    const updateData = {};
    if (data.rating !== undefined) {
      const rate = parseInt(data.rating);
      if (isNaN(rate) || rate < 1 || rate > 5) {
        throw new Error("RATING_MUST_BE_BETWEEN_1_AND_5");
      }
      updateData.rating = rate;
    }
    if (data.comment !== undefined) {
      updateData.comment = data.comment;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const updated = await prisma.reviews.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        users: true,
        places: {
          include: {
            districts: {
              include: {
                provinces: true
              }
            }
          }
        }
      }
    });

    return reviewMapper.toDTO(updated);
  }

  async deleteReview(id, user_id) {
    const reviewId = BigInt(id);
    const review = await prisma.reviews.findUnique({
      where: { id: reviewId }
    });
    if (!review) {
      throw new Error("REVIEW_NOT_FOUND");
    }

    if (review.user_id !== user_id) {
      throw new Error("UNAUTHORIZED_TO_DELETE_REVIEW");
    }
    await prisma.reviews.delete({
      where: { id: reviewId }
    });
    return { id: Number(id), deleted: true };
  }
}

module.exports = new ReviewService();
