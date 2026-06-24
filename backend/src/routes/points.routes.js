const express = require("express");
const router = express.Router();
const pointsController = require("../controllers/points.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", protect.pointsRead, pointsController.getAllPoints);
router.get("/:id", protect.pointsRead, pointsController.getPointsById);
router.post("/", protect.pointsWrite, pointsController.createPointsHistory);
router.put("/:id", protect.pointsWrite, pointsController.updatePointsHistory);
router.delete("/:id", protect.pointsWrite, pointsController.deletePointsHistory);

module.exports = router;
