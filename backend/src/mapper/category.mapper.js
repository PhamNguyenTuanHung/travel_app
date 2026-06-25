class CategoryMapper {
  toDTO(category) {
    if (!category) return null;
    return {
      id: Number(category.id),
      icon_url: category.icon_url,
      marker_color: category.marker_color,
      name_vi: category.name_vi,
      name_en: category.name_en
    };
  }

  toDTOs(categories) {
    if (!Array.isArray(categories)) return [];
    return categories.map(category => this.toDTO(category));
  }
}

module.exports = new CategoryMapper();
