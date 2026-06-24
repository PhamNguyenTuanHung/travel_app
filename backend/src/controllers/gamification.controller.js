const gamificationService = require("../services/gamification.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllConfigs = async (req, res) => {
  try {
    const result = await gamificationService.getAllConfigs();
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getConfigByKey = async (req, res) => {
  try {
    const result = await gamificationService.getConfigByKey(req.params.action_key);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.upsertConfig = async (req, res) => {
  try {
    const result = await gamificationService.upsertConfig(req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteConfig = async (req, res) => {
  try {
    const result = await gamificationService.deleteConfig(req.params.action_key);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
