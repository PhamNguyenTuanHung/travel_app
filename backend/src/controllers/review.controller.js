const reviewService = require("../services/review.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllReviews = async (req, res) => {
  try {
    const result = await reviewService.getAllReviews(req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    res.json(serializePrisma(review));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    req.body.user_id = req.user.id;
    const review = await reviewService.createReview(req.body);
    res.status(201).json(serializePrisma(review));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    req.body.user_id = req.user.id;
    const review = await reviewService.updateReview(req.params.id, req.body);
    res.json(serializePrisma(review));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    req.body.user_id = req.user.id;
    const result = await reviewService.deleteReview(req.params.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
