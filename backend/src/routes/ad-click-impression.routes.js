const express = require("express");
const router = express.Router();
const adClickImpressionController = require("../controllers/ad-click-impression.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", protect.adLogRead, adClickImpressionController.getAllLogs);
router.get("/:id", protect.adLogRead, adClickImpressionController.getLogById);
router.post("/", protect.adLogCreate, adClickImpressionController.createLog);
router.put("/:id", protect.adLogUpdate, adClickImpressionController.updateLog);
router.delete("/:id", protect.adLogDelete, adClickImpressionController.deleteLog);

module.exports = router;
