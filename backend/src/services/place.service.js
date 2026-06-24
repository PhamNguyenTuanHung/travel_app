const prisma = require("../config/db");

class PlaceService {
  async getAllPlaces({ limit = 10, page = 1, search, categories }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};

    if (search) {
      where.OR = [
        {
          name_vi: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          name_en: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          provinces: {
            name_vi: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          provinces: {
            name_en: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          categories: {
            some: {
              name_vi: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          categories: {
            some: {
              name_en: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    if (categories) {
      where.categories = {
        some: {
          id: Number(categories),
        },
      };
    }

    const [placesList] = await Promise.all([
      prisma.places.findMany({
        where,
        include: {
          provinces: true,
          categories: true,
          place_images: {
            where: { is_primary: true },
          },
          ads: {
            where: {
              type: "sponsored",
              is_active: true,
              start_date: { lte: new Date() },
              end_date: { gte: new Date() }
            }
          }
        },
      }),
    ]);

    const mappedPlaces = placesList.map((place) => ({
      ...place,
      is_sponsored: place.ads && place.ads.length > 0
    }));

    mappedPlaces.sort((a, b) => {
      if (a.is_sponsored && !b.is_sponsored) return -1;
      if (!a.is_sponsored && b.is_sponsored) return 1;
      return Number(a.id - b.id);
    });

    const totalCount = mappedPlaces.length;
    const paginatedPlaces = mappedPlaces.slice(skip, skip + take);

    const rows = paginatedPlaces.map((place) => ({
      id: Number(place.id),
      name: place.name_vi,
      province: place.provinces?.name_vi || "",
      description: place.description_vi,
      image_url: place.place_images?.[0]?.image_url || "",
      categories: place.categories,
      is_sponsored: place.is_sponsored,
      slug: place.provinces?.slug || "test"
    }));

    return {
      count: totalCount,
      rows,
    };
  }

  async getPlaceById(id) {
    const place = await prisma.places.findUnique({
      where: { id: BigInt(id) },
      include: {
        provinces: true,
        place_images: true,
        reviews: {
          include: {
            users: true
          }
        }
      }
    });

    if (!place) {
      throw new Error("PLACE_NOT_FOUND");
    }

    return {
      id: Number(place.id),
      name: place.name_vi,
      province: place.provinces?.name_vi || '',
      description: place.description_vi,
      image_url: place.place_images.find(img => img.is_primary)?.image_url || place.place_images?.[0]?.image_url || '',
      total_views: place.total_views,
      reviews: place.reviews.map(r => ({
        id: Number(r.id),
        user_id: r.user_id,
        rating: r.rating,
        comment: r.comment,
        user: {
          id: r.users?.id,
          full_name: r.users?.full_name,
          email: r.users?.email
        }
      }))
    };
  }

  async createPlace(data) {
    const { name, province, description, image_url } = data;

    // Find or create province
    let prov = await prisma.provinces.findFirst({
      where: {
        OR: [
          { name_vi: { equals: province, mode: 'insensitive' } },
          { name_en: { equals: province, mode: 'insensitive' } }
        ]
      }
    });

    if (!prov) {
      const slug = province.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      prov = await prisma.provinces.create({
        data: {
          slug,
          name_vi: province,
          name_en: province,
          is_visible: true
        }
      });
    }

    const name_vi = name;
    const name_en = name;
    const description_vi = description || '';
    const description_en = description || '';
    const address_vi = province;
    const address_en = province;
    const latitude = 10.0;
    const longitude = 105.0;

    // Raw SQL query to insert place because PostGIS geom Unsupported type is NOT NULL
    const inserted = await prisma.$queryRaw`
      INSERT INTO places (
        province_id, category_id, name_vi, name_en, description_vi, description_en,
        address_vi, address_en, latitude, longitude, geom, phone, opening_hours, price_range,
        has_parking, avg_rating, total_reviews, total_favorites, total_visits, total_views
      ) VALUES (
        ${prov.id}, 3, ${name_vi}, ${name_en}, ${description_vi}, ${description_en},
        ${address_vi}, ${address_en}, ${latitude}, ${longitude}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
        '', '08:00 - 17:00', '', false, 0.0, 0, 0, 0, 0
      ) RETURNING id
    `;

    const insertedId = inserted[0].id;

    if (image_url) {
      await prisma.place_images.create({
        data: {
          place_id: insertedId,
          image_url: image_url,
          is_primary: true
        }
      });
    }

    return {
      id: Number(insertedId),
      name: name_vi,
      province: province,
      description: description_vi,
      image_url: image_url || ''
    };
  }

  async updatePlace(id, data) {
    const { name, province, description, image_url } = data;
    const placeId = BigInt(id);

    const place = await prisma.places.findUnique({
      where: { id: placeId }
    });
    if (!place) {
      throw new Error("PLACE_NOT_FOUND");
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name_vi = name;
      updateData.name_en = name;
    }
    if (description !== undefined) {
      updateData.description_vi = description;
      updateData.description_en = description;
    }

    if (province !== undefined) {
      let prov = await prisma.provinces.findFirst({
        where: {
          OR: [
            { name_vi: { equals: province, mode: 'insensitive' } },
            { name_en: { equals: province, mode: 'insensitive' } }
          ]
        }
      });

      if (!prov) {
        const slug = province.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        prov = await prisma.provinces.create({
          data: {
            slug,
            name_vi: province,
            name_en: province,
            is_visible: true
          }
        });
      }

      updateData.province_id = prov.id;
      updateData.address_vi = province;
      updateData.address_en = province;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.places.update({
        where: { id: placeId },
        data: updateData
      });
    }

    if (image_url !== undefined) {
      await prisma.place_images.deleteMany({
        where: { place_id: placeId }
      });
      if (image_url) {
        await prisma.place_images.create({
          data: {
            place_id: placeId,
            image_url,
            is_primary: true
          }
        });
      }
    }

    return await this.getPlaceById(id);
  }

  async deletePlace(id) {
    const placeId = BigInt(id);
    const place = await prisma.places.findUnique({
      where: { id: placeId }
    });
    if (!place) {
      throw new Error("PLACE_NOT_FOUND");
    }

    await prisma.places.delete({
      where: { id: placeId }
    });

    return { id: Number(id), deleted: true };
  }

  async updateViewPlace(id) {
    const placeId = BigInt(id);

    const updatedPlace = await prisma.places.update({
      where: { id: placeId },
      data: {
        total_views: {
          increment: 1
        }
      }
    });

    return {
      id: Number(id),
      updated: true,
      total_views: updatedPlace.total_views
    };
  }
}

module.exports = new PlaceService();
