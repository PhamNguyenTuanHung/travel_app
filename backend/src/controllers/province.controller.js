const provinceService = require("../services/province.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllProvinces = async (req, res) => {
  try {
    const result = await provinceService.getAllProvinces(req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProvinceById = async (req, res) => {
  try {
    const result = await provinceService.getProvinceById(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createProvince = async (req, res) => {
  try {
    const result = await provinceService.createProvince(req.body);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProvince = async (req, res) => {
  try {
    const result = await provinceService.updateProvince(req.params.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProvince = async (req, res) => {
  try {
    const result = await provinceService.deleteProvince(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
