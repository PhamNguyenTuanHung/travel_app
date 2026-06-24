const express = require("express");
const router = express.Router();
const checkinController = require("../controllers/checkin.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", protect.checkinRead, checkinController.getCheckins);
router.post("/", protect.checkinWrite, checkinController.addCheckin);

module.exports = router;
