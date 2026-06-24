const placeService = require("../services/place.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllPlaces = async (req, res) => {
  try {
    const result = await placeService.getAllPlaces(req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlaceById = async (req, res) => {
  try {
    const place = await placeService.getPlaceById(req.params.id);
    res.json(serializePrisma(place));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createPlace = async (req, res) => {
  try {
    const place = await placeService.createPlace(req.body);
    res.status(201).json(serializePrisma(place));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const place = await placeService.updatePlace(req.params.id, req.body);
    res.json(serializePrisma(place));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const result = await placeService.deletePlace(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.updateViewPlace = async (req, res) => {
  try {
    const place = await placeService.updateViewPlace(req.params.id);
    res.json(serializePrisma(place));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
