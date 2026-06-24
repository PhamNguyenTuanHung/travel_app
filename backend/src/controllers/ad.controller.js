const adService = require("../services/ad.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllAds = async (req, res) => {
  try {
    const result = await adService.getAllAds(req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdById = async (req, res) => {
  try {
    const result = await adService.getAdById(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createAd = async (req, res) => {
  try {
    const result = await adService.createAd(req.body);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAd = async (req, res) => {
  try {
    const result = await adService.updateAd(req.params.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const result = await adService.deleteAd(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
