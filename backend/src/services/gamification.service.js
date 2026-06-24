const prisma = require("../config/db");

class GamificationService {
  async getAllConfigs() {
    return await prisma.gamification_configs.findMany({
      orderBy: { action_key: 'asc' }
    });
  }

  async getConfigByKey(action_key) {
    const config = await prisma.gamification_configs.findUnique({
      where: { action_key }
    });
    if (!config) {
      throw new Error("CONFIG_NOT_FOUND");
    }
    return config;
  }

  async upsertConfig(data) {
    const { action_key, points } = data;
    return await prisma.gamification_configs.upsert({
      where: { action_key },
      update: { points: parseInt(points), updated_at: new Date() },
      create: { action_key, points: parseInt(points) }
    });
  }

  async deleteConfig(action_key) {
    const config = await prisma.gamification_configs.findUnique({
      where: { action_key }
    });
    if (!config) {
      throw new Error("CONFIG_NOT_FOUND");
    }
    await prisma.gamification_configs.delete({
      where: { action_key }
    });
    return { action_key, deleted: true };
  }
}

module.exports = new GamificationService();
