const notificationService = require("../services/notification.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllNotifications = async (req, res) => {
  try {
    const result = await notificationService.getAllNotifications(req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const result = await notificationService.getMyNotifications(req.user.id, req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const result = await notificationService.getNotificationById(req.params.id);
    // If not admin/staff and it's a private notification, check ownership
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && result.user_id && result.user_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const result = await notificationService.createNotification(req.body);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const result = await notificationService.updateNotification(req.params.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
