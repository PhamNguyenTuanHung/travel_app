const prisma = require("../config/db");

class ProviderService {
  async getAllProviders({ limit = 10, page = 1, search, status }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contact_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) {
      where.status = status;
    }

    const [rows, count] = await Promise.all([
      prisma.providers.findMany({
        where,
        take,
        skip,
        orderBy: { id: 'asc' }
      }),
      prisma.providers.count({ where })
    ]);

    return { count, rows };
  }

  async getProviderById(id) {
    const providerId = parseInt(id);
    const provider = await prisma.providers.findUnique({
      where: { id: providerId },
      include: {
        places: true,
        ads: true
      }
    });
    if (!provider) {
      throw new Error("PROVIDER_NOT_FOUND");
    }
    return provider;
  }

  async createProvider(data) {
    const { name, logo_url, contact_name, phone, email, website_url, status } = data;
    return await prisma.providers.create({
      data: {
        name,
        logo_url: logo_url || null,
        contact_name: contact_name || null,
        phone: phone || null,
        email: email || null,
        website_url: website_url || null,
        status: status || 'active'
      }
    });
  }

  async updateProvider(id, data) {
    const providerId = parseInt(id);
    const provider = await prisma.providers.findUnique({ where: { id: providerId } });
    if (!provider) {
      throw new Error("PROVIDER_NOT_FOUND");
    }

    const payload = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.logo_url !== undefined) payload.logo_url = data.logo_url;
    if (data.contact_name !== undefined) payload.contact_name = data.contact_name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.email !== undefined) payload.email = data.email;
    if (data.website_url !== undefined) payload.website_url = data.website_url;
    if (data.status !== undefined) payload.status = data.status;

    return await prisma.providers.update({
      where: { id: providerId },
      data: payload
    });
  }

  async deleteProvider(id) {
    const providerId = parseInt(id);
    const provider = await prisma.providers.findUnique({ where: { id: providerId } });
    if (!provider) {
      throw new Error("PROVIDER_NOT_FOUND");
    }
    await prisma.providers.delete({ where: { id: providerId } });
    return { id: providerId, deleted: true };
  }
}

module.exports = new ProviderService();
