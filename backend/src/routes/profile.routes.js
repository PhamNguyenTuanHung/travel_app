const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const protect = require("../middlewares/protect.middleware");



router.get("/", protect.profileRead, userController.getProfile);

router.put("/", protect.profileUpdate, userController.updateProfile);

router.put("/password", protect.profileUpdate, userController.updatePassword);

module.exports = router;