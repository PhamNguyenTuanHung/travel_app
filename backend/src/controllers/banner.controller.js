const bannerService = require("../services/banner.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllBanners = async (req, res) => {
  try {
    const result = await bannerService.getAllBanners(req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const result = await bannerService.getBannerById(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const result = await bannerService.createBanner(req.body);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const result = await bannerService.updateBanner(req.params.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const result = await bannerService.deleteBanner(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
