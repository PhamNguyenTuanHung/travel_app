const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/banner.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", bannerController.getAllBanners);
router.get("/:id", bannerController.getBannerById);
router.post("/", protect.bannerCreate, bannerController.createBanner);
router.put("/:id", protect.bannerUpdate, bannerController.updateBanner);
router.delete("/:id", protect.bannerDelete, bannerController.deleteBanner);

module.exports = router;
