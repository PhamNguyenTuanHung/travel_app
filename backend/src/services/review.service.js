const prisma = require("../config/db");

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
              provinces: true
            }
          }
        },
        orderBy: { id: 'desc' }
      }),
      prisma.reviews.count({ where })
    ]);

    const rows = reviewsList.map(r => ({
      id: Number(r.id),
      user_id: r.user_id,
      place_id: Number(r.place_id),
      destination_id: Number(r.place_id),
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      created_at: r.created_at,
      user: {
        id: r.users?.id,
        full_name: r.users?.full_name,
        email: r.users?.email
      },
      place: {
        id: Number(r.places?.id),
        name: r.places?.name_vi,
        province: r.places?.provinces?.name_vi
      },
      destination: {
        id: Number(r.places?.id),
        name: r.places?.name_vi,
        province: r.places?.provinces?.name_vi
      }
    }));

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
            provinces: true
          }
        }
      }
    });

    if (!r) {
      throw new Error("REVIEW_NOT_FOUND");
    }

    return {
      id: Number(r.id),
      user_id: r.user_id,
      place_id: Number(r.place_id),
      destination_id: Number(r.place_id),
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      created_at: r.created_at,
      user: {
        id: r.users?.id,
        full_name: r.users?.full_name,
        email: r.users?.email
      },
      place: {
        id: Number(r.places?.id),
        name: r.places?.name_vi,
        province: r.places?.provinces?.name_vi
      },
      destination: {
        id: Number(r.places?.id),
        name: r.places?.name_vi,
        province: r.places?.provinces?.name_vi
      }
    };
  }

  async createReview(data) {
    const { user_id, place_id, destination_id, rating, comment } = data;
    const targetPlaceId = place_id || destination_id;

    if (!targetPlaceId) {
      throw new Error("PLACE_ID_REQUIRED");
    }

    // Check if place exists
    const place = await prisma.places.findUnique({
      where: { id: BigInt(targetPlaceId) }
    });
    if (!place) {
      throw new Error("PLACE_NOT_FOUND");
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: user_id }
    });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
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
            provinces: true
          }
        }
      }
    });

    return {
      id: Number(newReview.id),
      user_id: newReview.user_id,
      place_id: Number(newReview.place_id),
      destination_id: Number(newReview.place_id),
      rating: newReview.rating,
      comment: newReview.comment,
      status: newReview.status,
      created_at: newReview.created_at,
      user: {
        id: newReview.users?.id,
        full_name: newReview.users?.full_name,
        email: newReview.users?.email
      },
      place: {
        id: Number(newReview.places?.id),
        name: newReview.places?.name_vi,
        province: newReview.places?.provinces?.name_vi
      },
      destination: {
        id: Number(newReview.places?.id),
        name: newReview.places?.name_vi,
        province: newReview.places?.provinces?.name_vi
      }
    };
  }

  async updateReview(id, data) {
    const reviewId = BigInt(id);
    const review = await prisma.reviews.findUnique({
      where: { id: reviewId }
    });
    if (!review) {
      throw new Error("REVIEW_NOT_FOUND");
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
            provinces: true
          }
        }
      }
    });

    return {
      id: Number(updated.id),
      user_id: updated.user_id,
      place_id: Number(updated.place_id),
      destination_id: Number(updated.place_id),
      rating: updated.rating,
      comment: updated.comment,
      status: updated.status,
      created_at: updated.created_at,
      user: {
        id: updated.users?.id,
        full_name: updated.users?.full_name,
        email: updated.users?.email
      },
      place: {
        id: Number(updated.places?.id),
        name: updated.places?.name_vi,
        province: updated.places?.provinces?.name_vi
      },
      destination: {
        id: Number(updated.places?.id),
        name: updated.places?.name_vi,
        province: updated.places?.provinces?.name_vi
      }
    };
  }

  async deleteReview(id) {
    const reviewId = BigInt(id);
    const review = await prisma.reviews.findUnique({
      where: { id: reviewId }
    });
    if (!review) {
      throw new Error("REVIEW_NOT_FOUND");
    }
    await prisma.reviews.delete({
      where: { id: reviewId }
    });
    return { id: Number(id), deleted: true };
  }
}

module.exports = new ReviewService();
