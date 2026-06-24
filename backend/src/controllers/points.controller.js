const pointsService = require("../services/points.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllPoints = async (req, res) => {
  try {
    const filters = { ...req.query };
    // Normal users can only see their own points history
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      filters.user_id = req.user.id;
    }
    const result = await pointsService.getAllPoints(filters);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPointsById = async (req, res) => {
  try {
    const result = await pointsService.getPointsById(req.params.id);
    // Enforce ownership for normal users
    if (req.user.role !== "admin" && req.user.role !== "staff" && result.user_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Bạn không có quyền truy cập thông tin này" });
    }
    res.json(serializePrisma(result));
  } catch (err) {
    const status = err.message === "POINTS_HISTORY_NOT_FOUND" ? 404 : 500;
    res.status(status).json({ message: err.message });
  }
};

exports.createPointsHistory = async (req, res) => {
  try {
    const result = await pointsService.createPointsHistory(req.body);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePointsHistory = async (req, res) => {
  try {
    const result = await pointsService.updatePointsHistory(req.params.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePointsHistory = async (req, res) => {
  try {
    const result = await pointsService.deletePointsHistory(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
