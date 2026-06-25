class PlaceMapper {
  toListViewDTO(place) {
    if (!place) return null;
    return {
      id: Number(place.id),
      name: place.name_vi,
      slug: place.slug,
      province: place.districts?.provinces?.name_vi ?? "",
      district: place.districts?.name_vi ?? "",
      address: place.address_vi,
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
      description: place.description_vi,
      image_url: place.place_images?.[0]?.image_url ?? "",
      categories: place.categories,
      is_sponsored: place.ads ? place.ads.length > 0 : false,
      total_views: Number(place.total_views),
      avg_rating: Number(place.avg_rating ?? 0),
      total_reviews: Number(place.total_reviews),
      total_favorites: Number(place.total_favorites),
      total_visits: Number(place.total_visits),
    };
  }

  toListViewDTOs(places) {
    if (!Array.isArray(places)) return [];
    return places.map(place => this.toListViewDTO(place));
  }

  toDetailDTO(place) {
    if (!place) return null;
    return {
      id: Number(place.id),
      name: place.name_vi,
      province: place.districts?.provinces?.name_vi || '',
      district: place.districts?.name_vi || '',
      address: place.address_vi,
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
      description: place.description_vi,
      image_url: place.place_images ? (place.place_images.find(img => img.is_primary)?.image_url || place.place_images?.[0]?.image_url || '') : '',
      total_views: Number(place.total_views),
      min_price: place.min_price !== null ? Number(place.min_price) : null,
      max_price: place.max_price !== null ? Number(place.max_price) : null,
      price_range: (place.min_price !== null && place.max_price !== null)
        ? (place.min_price === place.max_price ? `${place.min_price.toLocaleString('vi-VN')}đ` : `${place.min_price.toLocaleString('vi-VN')}đ - ${place.max_price.toLocaleString('vi-VN')}đ`)
        : (place.min_price !== null ? `${place.min_price.toLocaleString('vi-VN')}đ` : ""),
      reviews: place.reviews ? place.reviews.map(r => ({
        id: Number(r.id),
        user_id: r.user_id,
        rating: r.rating,
        comment: r.comment,
        user: {
          id: r.users?.id,
          full_name: r.users?.full_name,
          email: r.users?.email
        }
      })) : []
    };
  }

  toSimpleDTO(id, name, province, district, description, image_url) {
    return {
      id: Number(id),
      name: name,
      province: province,
      district: district || '',
      description: description || '',
      image_url: image_url || ''
    };
  }
}

module.exports = new PlaceMapper();
