const express = require("express");
const router = express.Router();
const adController = require("../controllers/ad.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", adController.getAllAds);
router.get("/:id", adController.getAdById);
router.post("/", protect.adCreate, adController.createAd);
router.put("/:id", protect.adUpdate, adController.updateAd);
router.delete("/:id", protect.adDelete, adController.deleteAd);

module.exports = router;
