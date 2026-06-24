const districtService = require("../services/district.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllDistricts = async (req, res) => {
  try {
    const result = await districtService.getAllDistricts(req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDistrictById = async (req, res) => {
  try {
    const result = await districtService.getDistrictById(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createDistrict = async (req, res) => {
  try {
    const result = await districtService.createDistrict(req.body);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateDistrict = async (req, res) => {
  try {
    const result = await districtService.updateDistrict(req.params.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteDistrict = async (req, res) => {
  try {
    const result = await districtService.deleteDistrict(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
