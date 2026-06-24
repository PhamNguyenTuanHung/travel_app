const express = require("express");
const router = express.Router();
const districtController = require("../controllers/district.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", districtController.getAllDistricts);
router.get("/:id", districtController.getDistrictById);
router.post("/", protect.locationCreate, districtController.createDistrict);
router.put("/:id", protect.locationUpdate, districtController.updateDistrict);
router.delete("/:id", protect.locationDelete, districtController.deleteDistrict);

module.exports = router;
