const provinceMapper = require("./province.mapper");

class DistrictMapper {
  toDTO(district) {
    if (!district) return null;
    return {
      id: Number(district.id),
      province_id: Number(district.province_id),
      slug: district.slug,
      name_vi: district.name_vi,
      name_en: district.name_en,
      is_visible: district.is_visible,
      province: district.provinces ? provinceMapper.toDTO(district.provinces) : undefined
    };
  }

  toDTOs(districts) {
    if (!Array.isArray(districts)) return [];
    return districts.map(district => this.toDTO(district));
  }
}

module.exports = new DistrictMapper();
