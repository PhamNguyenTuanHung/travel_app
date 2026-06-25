class NotificationMapper {
  toDTO(notification) {
    if (!notification) return null;
    return {
      id: Number(notification.id),
      user_id: notification.user_id,
      title_vi: notification.title_vi,
      title_en: notification.title_en,
      content_vi: notification.content_vi,
      content_en: notification.content_en,
      is_read: notification.is_read,
      created_at: notification.created_at,
      user: notification.users ? {
        id: notification.users.id,
        full_name: notification.users.full_name,
        email: notification.users.email
      } : null
    };
  }

  toDTOs(notifications) {
    if (!Array.isArray(notifications)) return [];
    return notifications.map(notif => this.toDTO(notif));
  }
}

module.exports = new NotificationMapper();
