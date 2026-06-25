class ProvinceMapper {
  toDTO(province) {
    if (!province) return null;
    return {
      id: Number(province.id),
      slug: province.slug,
      name_vi: province.name_vi,
      name_en: province.name_en,
      is_visible: province.is_visible
    };
  }

  toDTOs(provinces) {
    if (!Array.isArray(provinces)) return [];
    return provinces.map(province => this.toDTO(province));
  }
}

module.exports = new ProvinceMapper();
