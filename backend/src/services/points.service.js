const prisma = require("../config/db");

class PointsService {
  async getAllPoints({ limit = 10, page = 1, user_id, action_type, blockchain_status }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};
    if (user_id) {
      where.user_id = user_id;
    }
    if (action_type) {
      where.action_type = action_type;
    }
    if (blockchain_status) {
      where.blockchain_status = blockchain_status;
    }

    const [rows, count] = await Promise.all([
      prisma.loyalty_points_history.findMany({
        where,
        take,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
              email: true,
              total_points: true
            }
          }
        }
      }),
      prisma.loyalty_points_history.count({ where })
    ]);

    return { count, rows };
  }

  async getPointsById(id) {
    const historyId = BigInt(id);
    const history = await prisma.loyalty_points_history.findUnique({
      where: { id: historyId },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            total_points: true
          }
        }
      }
    });

    if (!history) {
      throw new Error("POINTS_HISTORY_NOT_FOUND");
    }
    return history;
  }

  async createPointsHistory(data) {
    const { user_id, action_type, points_earned, blockchain_status } = data;

    const user = await prisma.users.findUnique({ where: { id: user_id } });
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return await prisma.$transaction(async (tx) => {
      const history = await tx.loyalty_points_history.create({
        data: {
          user_id,
          action_type,
          points_earned: parseInt(points_earned),
          blockchain_status: blockchain_status || "none"
        }
      });

      await tx.users.update({
        where: { id: user_id },
        data: {
          total_points: {
            increment: parseInt(points_earned)
          }
        }
      });

      return history;
    });
  }

  async updatePointsHistory(id, data) {
    const historyId = BigInt(id);
    const history = await prisma.loyalty_points_history.findUnique({
      where: { id: historyId }
    });
    if (!history) {
      throw new Error("POINTS_HISTORY_NOT_FOUND");
    }

    const payload = {};
    if (data.action_type !== undefined) payload.action_type = data.action_type;
    if (data.blockchain_status !== undefined) payload.blockchain_status = data.blockchain_status;

    return await prisma.$transaction(async (tx) => {
      if (data.points_earned !== undefined) {
        const newPoints = parseInt(data.points_earned);
        const diff = newPoints - history.points_earned;
        payload.points_earned = newPoints;

        if (diff !== 0) {
          await tx.users.update({
            where: { id: history.user_id },
            data: {
              total_points: {
                increment: diff
              }
            }
          });
        }
      }

      return await tx.loyalty_points_history.update({
        where: { id: historyId },
        data: payload
      });
    });
  }

  async deletePointsHistory(id) {
    const historyId = BigInt(id);
    const history = await prisma.loyalty_points_history.findUnique({
      where: { id: historyId }
    });
    if (!history) {
      throw new Error("POINTS_HISTORY_NOT_FOUND");
    }

    await prisma.$transaction(async (tx) => {
      await tx.loyalty_points_history.delete({
        where: { id: historyId }
      });

      await tx.users.update({
        where: { id: history.user_id },
        data: {
          total_points: {
            decrement: history.points_earned
          }
        }
      });
    });

    return { id: Number(historyId), deleted: true };
  }
}

module.exports = new PointsService();
