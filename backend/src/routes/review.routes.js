const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);
router.post("/", protect.reviewCreate, reviewController.createReview);
router.put("/:id", protect.reviewUpdate, reviewController.updateReview);
router.delete("/:id", protect.reviewDelete, reviewController.deleteReview);

module.exports = router;
