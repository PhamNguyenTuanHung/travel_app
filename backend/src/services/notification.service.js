const prisma = require("../config/db");
const notificationMapper = require("../mapper/notification.mapper");

class NotificationService {
  async getAllNotifications({ limit = 10, page = 1, user_id }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};
    if (user_id) {
      where.user_id = user_id;
    }

    const [rows, count] = await Promise.all([
      prisma.notifications.findMany({
        where,
        take,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      }),
      prisma.notifications.count({ where })
    ]);

    return { count, rows: notificationMapper.toDTOs(rows) };
  }

  async getMyNotifications(user_id, { limit = 10, page = 1 }) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {
      OR: [
        { user_id: user_id },
        { user_id: null } // System-wide notifications
      ]
    };

    const [rows, count] = await Promise.all([
      prisma.notifications.findMany({
        where,
        take,
        skip,
        orderBy: { created_at: 'desc' }
      }),
      prisma.notifications.count({ where })
    ]);

    return { count, rows: notificationMapper.toDTOs(rows) };
  }

  async getNotificationById(id) {
    const notificationId = BigInt(id);
    const notification = await prisma.notifications.findUnique({
      where: { id: notificationId },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });
    if (!notification) {
      throw new Error("NOTIFICATION_NOT_FOUND");
    }
    return notificationMapper.toDTO(notification);
  }

  async createNotification(data) {
    const { user_id, title_vi, title_en, content_vi, content_en, is_read } = data;

    if (user_id) {
      const userExists = await prisma.users.findUnique({ where: { id: user_id } });
      if (!userExists) {
        throw new Error("USER_NOT_FOUND");
      }
    }

    const notification = await prisma.notifications.create({
      data: {
        user_id: user_id || null,
        title_vi,
        title_en,
        content_vi,
        content_en,
        is_read: is_read !== undefined ? (is_read === 'true' || is_read === true) : false
      }
    });
    return notificationMapper.toDTO(notification);
  }

  async updateNotification(id, data) {
    const notificationId = BigInt(id);
    const notification = await prisma.notifications.findUnique({ where: { id: notificationId } });
    if (!notification) {
      throw new Error("NOTIFICATION_NOT_FOUND");
    }

    const payload = {};
    if (data.title_vi !== undefined) payload.title_vi = data.title_vi;
    if (data.title_en !== undefined) payload.title_en = data.title_en;
    if (data.content_vi !== undefined) payload.content_vi = data.content_vi;
    if (data.content_en !== undefined) payload.content_en = data.content_en;
    if (data.is_read !== undefined) {
      payload.is_read = data.is_read === 'true' || data.is_read === true;
    }
    if (data.user_id !== undefined) {
      if (data.user_id) {
        const userExists = await prisma.users.findUnique({ where: { id: data.user_id } });
        if (!userExists) {
          throw new Error("USER_NOT_FOUND");
        }
        payload.user_id = data.user_id;
      } else {
        payload.user_id = null;
      }
    }

    const updated = await prisma.notifications.update({
      where: { id: notificationId },
      data: payload
    });
    return notificationMapper.toDTO(updated);
  }

  async markAsRead(id, user_id) {
    const notificationId = BigInt(id);
    const notification = await prisma.notifications.findUnique({ where: { id: notificationId } });
    if (!notification) {
      throw new Error("NOTIFICATION_NOT_FOUND");
    }

    // Verify ownership if not admin/staff
    if (notification.user_id && notification.user_id !== user_id) {
      throw new Error("UNAUTHORIZED_NOTIFICATION_ACCESS");
    }

    const updated = await prisma.notifications.update({
      where: { id: notificationId },
      data: { is_read: true }
    });
    return notificationMapper.toDTO(updated);
  }

  async deleteNotification(id) {
    const notificationId = BigInt(id);
    const notification = await prisma.notifications.findUnique({ where: { id: notificationId } });
    if (!notification) {
      throw new Error("NOTIFICATION_NOT_FOUND");
    }
    await prisma.notifications.delete({ where: { id: notificationId } });
    return { id: Number(notificationId), deleted: true };
  }
}

module.exports = new NotificationService();
