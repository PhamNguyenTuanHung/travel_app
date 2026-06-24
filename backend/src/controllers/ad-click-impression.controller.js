const adClickImpressionService = require("../services/ad-click-impression.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllLogs = async (req, res) => {
  try {
    const result = await adClickImpressionService.getAllLogs(req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLogById = async (req, res) => {
  try {
    const result = await adClickImpressionService.getLogById(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createLog = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const result = await adClickImpressionService.createLog(req.body, userId);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateLog = async (req, res) => {
  try {
    const result = await adClickImpressionService.updateLog(req.params.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    const result = await adClickImpressionService.deleteLog(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
