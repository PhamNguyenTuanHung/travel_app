const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const protect = require("../middlewares/protect.middleware");

// Personal routes
router.get("/my", protect.notificationRead, notificationController.getMyNotifications);
router.put("/my/:id/read", protect.notificationRead, notificationController.markAsRead);

// Management routes
router.get("/", protect.notificationRead, notificationController.getAllNotifications);
router.get("/:id", protect.notificationRead, notificationController.getNotificationById);
router.post("/", protect.notificationCreate, notificationController.createNotification);
router.put("/:id", protect.notificationUpdate, notificationController.updateNotification);
router.delete("/:id", protect.notificationDelete, notificationController.deleteNotification);

module.exports = router;
