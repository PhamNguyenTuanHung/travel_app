const express = require("express");
const router = express.Router();
const provinceController = require("../controllers/province.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", provinceController.getAllProvinces);
router.get("/:id", provinceController.getProvinceById);
router.post("/", protect.locationCreate, provinceController.createProvince);
router.put("/:id", protect.locationUpdate, provinceController.updateProvince);
router.delete("/:id", protect.locationDelete, provinceController.deleteProvince);

module.exports = router;
