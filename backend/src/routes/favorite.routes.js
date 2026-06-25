const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", protect.favoriteRead, favoriteController.getFavorites);
router.post("/", protect.favoriteWrite, favoriteController.addFavorite);
router.delete("/", protect.favoriteWrite, favoriteController.removeFavorite);

module.exports = router;
