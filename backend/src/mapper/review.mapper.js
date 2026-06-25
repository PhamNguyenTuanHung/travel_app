class ReviewMapper {
  toDTO(review) {
    if (!review) return null;
    return {
      id: Number(review.id),
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      created_at: review.created_at,
      user: {
        id: review.users?.id,
        full_name: review.users?.full_name,
        email: review.users?.email
      },
      place: {
        id: Number(review.places?.id),
        name: review.places?.name_vi,
        province: review.places?.districts?.provinces?.name_vi
      }
    };
  }

  toDTOs(reviews) {
    if (!Array.isArray(reviews)) return [];
    return reviews.map(review => this.toDTO(review));
  }
}

module.exports = new ReviewMapper();
