class AdMapper {
  toDTO(ad) {
    if (!ad) return null;
    return {
      id: Number(ad.id),
      provider_id: ad.provider_id ? Number(ad.provider_id) : null,
      place_id: ad.place_id ? Number(ad.place_id) : null,
      title: ad.title,
      image_url: ad.image_url,
      type: ad.type,
      target_url: ad.target_url,
      start_date: ad.start_date,
      end_date: ad.end_date,
      is_active: ad.is_active
    };
  }

  toDTOs(ads) {
    if (!Array.isArray(ads)) return [];
    return ads.map(ad => this.toDTO(ad));
  }
}

module.exports = new AdMapper();
