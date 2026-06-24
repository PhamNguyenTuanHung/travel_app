const express = require("express");
const router = express.Router();
const placeController = require("../controllers/place.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", placeController.getAllPlaces);
router.get("/:id", placeController.getPlaceById);
router.post("/:id/view", placeController.updateViewPlace);
router.post("/", protect.locationCreate, placeController.createPlace);
router.put("/:id", protect.locationUpdate, placeController.updatePlace);
router.delete("/:id", protect.locationDelete, placeController.deletePlace);

module.exports = router;
