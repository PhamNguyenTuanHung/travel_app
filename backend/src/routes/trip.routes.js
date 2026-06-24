const express = require("express");
const router = express.Router();
const tripController = require("../controllers/trip.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", protect.tripRead, tripController.getAllTrips);
router.get("/:id", protect.tripRead, tripController.getTripById);
router.post("/", protect.tripWrite, tripController.createTrip);
router.put("/:id", protect.tripWrite, tripController.updateTrip);
router.delete("/:id", protect.tripWrite, tripController.deleteTrip);

router.post("/:id/places", protect.tripWrite, tripController.addPlaceToTrip);
router.delete("/:id/places/:place_id", protect.tripWrite, tripController.removePlaceFromTrip);

module.exports = router;
