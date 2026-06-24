const express = require("express");
const router = express.Router();
const gamificationController = require("../controllers/gamification.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", gamificationController.getAllConfigs);
router.get("/:action_key", gamificationController.getConfigByKey);
router.post("/", protect.gamificationWrite, gamificationController.upsertConfig);
router.delete("/:action_key", protect.gamificationWrite, gamificationController.deleteConfig);

module.exports = router;
